"""
Skillora AI — Resume Parser Module
Hybrid extraction engine combining structural parsing with keyword matching.
Handles PDF and DOCX formats with structural fallback blocks.
Based on Paper 2 (Bi-LSTM-CRF hybrid approach) and Paper 3 (spaCy + regex).
"""

import re
import io
from typing import Dict, List, Optional, Tuple

# ── PDF extraction ──────────────────────────────────────────────────────────
def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from a PDF file using pdfplumber with fallback."""
    import pdfplumber
    text_parts = []
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)

                # Fallback: try extracting from tables if regular text is sparse
                if not page_text or len(page_text.strip()) < 50:
                    tables = page.extract_tables()
                    for table in tables:
                        for row in table:
                            if row:
                                row_text = " | ".join([cell or "" for cell in row])
                                text_parts.append(row_text)
    except Exception as e:
        raise ValueError(f"Failed to parse PDF: {str(e)}")

    full_text = "\n".join(text_parts)
    if not full_text.strip():
        raise ValueError("Could not extract any text from the PDF. The file may be image-based or corrupted.")
    return full_text


# ── DOCX extraction ────────────────────────────────────────────────────────
def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extract text from a DOCX file using python-docx."""
    from docx import Document
    try:
        doc = Document(io.BytesIO(file_bytes))
        text_parts = []
        for paragraph in doc.paragraphs:
            if paragraph.text.strip():
                text_parts.append(paragraph.text.strip())

        # Also extract from tables
        for table in doc.tables:
            for row in table.rows:
                row_text = " | ".join([cell.text.strip() for cell in row.cells if cell.text.strip()])
                if row_text:
                    text_parts.append(row_text)
    except Exception as e:
        raise ValueError(f"Failed to parse DOCX: {str(e)}")

    full_text = "\n".join(text_parts)
    if not full_text.strip():
        raise ValueError("Could not extract any text from the DOCX file.")
    return full_text


# ── Section Segmentation ───────────────────────────────────────────────────

# Section header patterns (case-insensitive)
SECTION_PATTERNS = {
    "education": [
        r"(?i)\b(education|academic|qualification|degree|university|college|school|coursework|certifications?)\b"
    ],
    "experience": [
        r"(?i)\b(experience|work\s*history|employment|professional\s*experience|internship|work\s*experience|career)\b"
    ],
    "skills": [
        r"(?i)\b(skills?|technical\s*skills?|technologies|tools|competenc|proficienc|expertise|tech\s*stack|programming\s*languages?)\b"
    ],
    "projects": [
        r"(?i)\b(projects?|portfolio|personal\s*projects?|academic\s*projects?|side\s*projects?)\b"
    ],
    "summary": [
        r"(?i)\b(summary|objective|about\s*me|profile|career\s*objective|professional\s*summary|overview)\b"
    ],
    "certifications": [
        r"(?i)\b(certifications?|licenses?|credentials?|certificates?|accreditations?)\b"
    ],
    "achievements": [
        r"(?i)\b(achievements?|awards?|honors?|accomplishments?|recognition)\b"
    ]
}


def segment_sections(text: str) -> Dict[str, str]:
    """
    Segment resume text into logical sections using regex-based header detection.
    Returns a dict mapping section names to their content.
    """
    lines = text.split("\n")
    sections = {}
    current_section = "header"  # Everything before first detected section
    current_content = []

    for line in lines:
        stripped = line.strip()
        if not stripped:
            current_content.append("")
            continue

        # Check if this line is a section header
        detected_section = None

        # Heuristic: Section headers are usually short, sometimes ALL CAPS or Title Case
        if len(stripped.split()) <= 6:
            for section_name, patterns in SECTION_PATTERNS.items():
                for pattern in patterns:
                    if re.search(pattern, stripped):
                        detected_section = section_name
                        break
                if detected_section:
                    break

        if detected_section:
            # Save current section
            sections[current_section] = "\n".join(current_content).strip()
            current_section = detected_section
            current_content = []
        else:
            current_content.append(stripped)

    # Save the last section
    if current_content:
        sections[current_section] = "\n".join(current_content).strip()

    return sections


# ── Contact Info Extraction ─────────────────────────────────────────────────

def extract_contact_info(text: str) -> Dict[str, Optional[str]]:
    """Extract name, email, phone, and LinkedIn from resume text."""
    info = {"name": None, "email": None, "phone": None, "linkedin": None, "github": None}

    # Email
    email_match = re.search(r'[\w.+-]+@[\w-]+\.[\w.-]+', text)
    if email_match:
        info["email"] = email_match.group(0)

    # Phone (various formats)
    phone_match = re.search(
        r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}',
        text
    )
    if phone_match:
        info["phone"] = phone_match.group(0).strip()

    # LinkedIn
    linkedin_match = re.search(r'(?:linkedin\.com/in/|linkedin:\s*)([\w-]+)', text, re.I)
    if linkedin_match:
        info["linkedin"] = f"linkedin.com/in/{linkedin_match.group(1)}"

    # GitHub
    github_match = re.search(r'(?:github\.com/|github:\s*)([\w-]+)', text, re.I)
    if github_match:
        info["github"] = f"github.com/{github_match.group(1)}"

    # Name — take the first meaningful line (heuristic: first non-empty line that isn't an email/phone)
    first_lines = text.strip().split("\n")[:5]
    for line in first_lines:
        cleaned = line.strip()
        if cleaned and not re.search(r'[@\d{5,}]', cleaned) and len(cleaned) < 60:
            # Likely a name if it doesn't contain emails or long numbers
            info["name"] = cleaned
            break

    return info


# ── Skill Extraction ───────────────────────────────────────────────────────

def extract_skills_from_text(text: str, taxonomy: dict) -> List[Dict]:
    """
    Hybrid skill extraction:
    1. Dictionary-based keyword matching (fast, high precision)
    2. Fuzzy matching for variants and misspellings
    Returns list of matched skills with confidence scores.
    """
    from rapidfuzz import fuzz

    text_lower = text.lower()
    found_skills = []
    seen_skills = set()

    for role_key, role_data in taxonomy.get("roles", {}).items():
        for priority in ["critical", "important", "nice_to_have"]:
            skills_list = role_data.get("skills", {}).get(priority, [])
            for skill in skills_list:
                skill_name = skill["name"]
                if skill_name in seen_skills:
                    continue

                # Check exact name match
                name_lower = skill_name.lower()
                if name_lower in text_lower:
                    seen_skills.add(skill_name)
                    found_skills.append({
                        "name": skill_name,
                        "category": skill.get("category", "Technical"),
                        "confidence": 1.0,
                        "match_type": "exact"
                    })
                    continue

                # Check aliases
                alias_matched = False
                for alias in skill.get("aliases", []):
                    alias_lower = alias.lower()
                    if alias_lower in text_lower:
                        seen_skills.add(skill_name)
                        found_skills.append({
                            "name": skill_name,
                            "category": skill.get("category", "Technical"),
                            "confidence": 0.9,
                            "match_type": "alias",
                            "matched_alias": alias
                        })
                        alias_matched = True
                        break

                if alias_matched:
                    continue

                # Fuzzy matching as fallback (for misspellings)
                # Only check against skill sections for performance
                best_score = 0
                words = re.findall(r'\b\w+(?:\s+\w+)?\b', text_lower)
                for word in words:
                    score = fuzz.ratio(name_lower, word)
                    if score > best_score:
                        best_score = score

                if best_score >= 85:  # High threshold to avoid false positives
                    seen_skills.add(skill_name)
                    found_skills.append({
                        "name": skill_name,
                        "category": skill.get("category", "Technical"),
                        "confidence": round(best_score / 100, 2),
                        "match_type": "fuzzy"
                    })

    return found_skills


# ── Education Extraction ─────────────────────────────────────────────────

def extract_education(text: str) -> List[Dict]:
    """Extract education entries from resume text."""
    education = []

    # Common degree patterns
    degree_patterns = [
        r"(?i)(B\.?(?:Tech|E|Sc|A|Com|S)|Bachelor(?:'?s)?)\s*(?:of|in)?\s*[\w\s,]+",
        r"(?i)(M\.?(?:Tech|E|Sc|A|Com|S|BA)|Master(?:'?s)?)\s*(?:of|in)?\s*[\w\s,]+",
        r"(?i)(Ph\.?D|Doctorate)\s*(?:of|in)?\s*[\w\s,]+",
        r"(?i)(Diploma|Associate)\s*(?:of|in)?\s*[\w\s,]+",
        r"(?i)(B\.?C\.?A|M\.?C\.?A|B\.?B\.?A|M\.?B\.?A)\b",
        r"(?i)(12th|10th|HSC|SSC|CBSE|ICSE|High\s*School|Intermediate)\b"
    ]

    for pattern in degree_patterns:
        matches = re.finditer(pattern, text)
        for match in matches:
            degree_text = match.group(0).strip()
            if len(degree_text) > 3 and degree_text not in [e["degree"] for e in education]:
                education.append({
                    "degree": degree_text[:100],
                    "raw_match": match.group(0)[:150]
                })

    return education[:5]  # Cap at 5 entries


# ── Main Parse Function ─────────────────────────────────────────────────

def parse_resume(file_bytes: bytes, filename: str, taxonomy: dict) -> Dict:
    """
    Main entry point: Parse a resume file and extract structured information.

    Returns:
        dict with keys: contact, sections, skills, education, raw_text
    """
    # Step 1: Extract raw text based on file type
    ext = filename.lower().rsplit(".", 1)[-1] if "." in filename else ""
    if ext == "pdf":
        raw_text = extract_text_from_pdf(file_bytes)
    elif ext in ("docx", "doc"):
        raw_text = extract_text_from_docx(file_bytes)
    else:
        raise ValueError(f"Unsupported file format: .{ext}. Please upload a PDF or DOCX file.")

    # Step 2: Extract contact information
    contact = extract_contact_info(raw_text)

    # Step 3: Segment into sections
    sections = segment_sections(raw_text)

    # Step 4: Extract skills (hybrid: keyword + fuzzy)
    skills = extract_skills_from_text(raw_text, taxonomy)

    # Step 5: Extract education
    education = extract_education(raw_text)

    return {
        "contact": contact,
        "sections": sections,
        "skills": skills,
        "education": education,
        "raw_text": raw_text,
        "file_type": ext,
        "word_count": len(raw_text.split())
    }
