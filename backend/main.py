"""
Skillora AI — FastAPI Server
Main entry point for the backend API.
Exposes endpoints for resume analysis, role listing, and health checks.
"""

import json
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse

from resume_parser import parse_resume
from skill_analyzer import analyze_skill_gaps, get_available_roles, load_taxonomy
from recommender import generate_learning_roadmap

# ── App Setup ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="Skillora AI",
    description="AI-Powered Career Readiness & Skill Gap Analyzer",
    version="1.0.0"
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load taxonomy once at startup
taxonomy = load_taxonomy()


# ── Endpoints ───────────────────────────────────────────────────────────────

@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "Skillora AI", "version": "1.0.0"}


@app.get("/api/roles")
async def list_roles():
    """List all available target job roles."""
    roles = get_available_roles(taxonomy)
    return {"roles": roles}


@app.post("/api/analyze")
async def analyze_resume(
    file: UploadFile = File(...),
    target_role: str = Form(...)
):
    """
    Analyze a resume against a target job role.

    Accepts:
        - file: PDF or DOCX resume file
        - target_role: Target role key (e.g., 'data_analyst')

    Returns:
        - contact info, readiness score, matched skills,
          missing skills, category breakdown, learning roadmap
    """
    # Validate file type
    allowed_types = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword"
    ]
    filename = file.filename or "resume.pdf"
    ext = filename.lower().rsplit(".", 1)[-1] if "." in filename else ""

    if ext not in ("pdf", "docx", "doc"):
        raise HTTPException(
            status_code=400,
            detail="Unsupported file format. Please upload a PDF or DOCX file."
        )

    # Validate target role
    if target_role not in taxonomy.get("roles", {}):
        available = list(taxonomy.get("roles", {}).keys())
        raise HTTPException(
            status_code=400,
            detail=f"Unknown role: {target_role}. Available roles: {available}"
        )

    try:
        # Read file bytes
        file_bytes = await file.read()

        if len(file_bytes) == 0:
            raise HTTPException(status_code=400, detail="Empty file uploaded.")

        if len(file_bytes) > 10 * 1024 * 1024:  # 10MB limit
            raise HTTPException(status_code=400, detail="File too large. Maximum size is 10MB.")

        # Step 1: Parse resume
        parsed = parse_resume(file_bytes, filename, taxonomy)

        # Step 2: Analyze skill gaps
        analysis = analyze_skill_gaps(parsed["skills"], target_role, taxonomy)

        # Step 3: Generate learning roadmap
        roadmap = generate_learning_roadmap(analysis["missing_skills"])

        # Combine results
        result = {
            "success": True,
            "contact": parsed["contact"],
            "resume_stats": {
                "file_type": parsed["file_type"],
                "word_count": parsed["word_count"],
                "sections_found": list(parsed["sections"].keys()),
                "skills_extracted": len(parsed["skills"]),
                "education_entries": len(parsed["education"])
            },
            "extracted_skills": parsed["skills"],
            "education": parsed["education"],
            "analysis": analysis,
            "roadmap": roadmap
        }

        return JSONResponse(content=result)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")



# ── Serve the built React frontend ──────────────────────────────────────────
FRONTEND_DIST = Path(__file__).resolve().parent.parent / "frontend" / "dist"


@app.get("/{full_path:path}", include_in_schema=False)
async def serve_frontend(full_path: str):
    if full_path == "api" or full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="Not found")

    dist_root = FRONTEND_DIST.resolve()
    requested_file = (dist_root / full_path).resolve()

    if requested_file != dist_root and dist_root not in requested_file.parents:
        raise HTTPException(status_code=404, detail="Not found")

    if requested_file.is_file():
        return FileResponse(requested_file)

    index_file = dist_root / "index.html"
    if index_file.is_file():
        return FileResponse(index_file)

    raise HTTPException(
        status_code=404,
        detail="Frontend build not found. Build the frontend first."
    )


# ── Run ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
