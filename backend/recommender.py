"""
Skillora AI — Learning Recommendation Engine
Generates personalized, structured learning roadmaps with milestone tracking.
Based on Paper 4 (Bloom's Taxonomy-mapped adaptive learning paths).
"""

from typing import Dict, List


# ── Bloom's Taxonomy Levels ─────────────────────────────────────────────────
BLOOM_LEVELS = [
    {"level": 1, "name": "Remember", "description": "Recall basic facts and concepts", "icon": "📖"},
    {"level": 2, "name": "Understand", "description": "Explain ideas and concepts", "icon": "💡"},
    {"level": 3, "name": "Apply", "description": "Use knowledge in new situations", "icon": "🔧"},
    {"level": 4, "name": "Analyze", "description": "Draw connections and examine relationships", "icon": "🔍"},
    {"level": 5, "name": "Evaluate", "description": "Justify decisions and critique approaches", "icon": "⚖️"},
    {"level": 6, "name": "Create", "description": "Produce original work and innovate", "icon": "🚀"},
]


def generate_learning_roadmap(missing_skills: List[Dict]) -> Dict:
    """
    Generate a structured learning roadmap from missing skills.

    Maps each skill gap to a milestone with:
    - Bloom's Taxonomy progression levels
    - Curated learning resources (YouTube, courses, GitHub, docs)
    - Estimated learning time
    - Priority-based ordering

    Returns:
        Dict containing milestones, total_estimated_time, and phase breakdown
    """
    milestones = []
    total_hours = 0

    # Group skills by priority for phased learning
    phases = {
        "critical": {"name": "Foundation Phase", "skills": [], "icon": "🔴", "description": "Master these first — they're essential for the role"},
        "important": {"name": "Growth Phase", "skills": [], "icon": "🟡", "description": "Build depth and become a competitive candidate"},
        "nice_to_have": {"name": "Excellence Phase", "skills": [], "icon": "🟢", "description": "Stand out from other candidates with these differentiators"}
    }

    for skill in missing_skills:
        priority = skill.get("priority", "nice_to_have")
        if priority in phases:
            phases[priority]["skills"].append(skill)

    milestone_index = 0
    for priority in ["critical", "important", "nice_to_have"]:
        phase = phases[priority]
        for skill in phase["skills"]:
            milestone_index += 1
            resources = skill.get("resources", [])

            # Estimate hours based on resource durations
            estimated_hours = _estimate_skill_hours(resources, priority)
            total_hours += estimated_hours

            # Map to Bloom's Taxonomy progression
            learning_steps = _create_bloom_steps(skill["name"], resources)

            milestone = {
                "id": milestone_index,
                "skill_name": skill["name"],
                "category": skill.get("category", "Technical"),
                "priority": priority,
                "phase": phase["name"],
                "phase_icon": phase["icon"],
                "description": skill.get("description", ""),
                "estimated_hours": estimated_hours,
                "estimated_weeks": max(1, round(estimated_hours / 10)),  # ~10h/week study
                "resources": _format_resources(resources),
                "bloom_steps": learning_steps,
                "status": "not_started"
            }
            milestones.append(milestone)

    # Calculate phase summaries
    phase_summaries = []
    for priority in ["critical", "important", "nice_to_have"]:
        phase = phases[priority]
        phase_milestones = [m for m in milestones if m["priority"] == priority]
        if phase_milestones:
            phase_hours = sum(m["estimated_hours"] for m in phase_milestones)
            phase_summaries.append({
                "name": phase["name"],
                "icon": phase["icon"],
                "description": phase["description"],
                "skill_count": len(phase_milestones),
                "estimated_hours": phase_hours,
                "estimated_weeks": max(1, round(phase_hours / 10)),
                "skills": [m["skill_name"] for m in phase_milestones]
            })

    return {
        "milestones": milestones,
        "phases": phase_summaries,
        "total_estimated_hours": total_hours,
        "total_estimated_weeks": max(1, round(total_hours / 10)),
        "total_skills": len(milestones)
    }


def _estimate_skill_hours(resources: List[Dict], priority: str) -> int:
    """Estimate learning hours based on available resources and priority."""
    base_hours = {
        "critical": 20,
        "important": 15,
        "nice_to_have": 10
    }

    if not resources:
        return base_hours.get(priority, 10)

    # Parse duration strings from resources
    total_from_resources = 0
    for res in resources:
        duration = res.get("duration", "")
        hours = _parse_duration(duration)
        total_from_resources += hours

    # Use resource time × 2 (for practice) or base hours, whichever is larger
    return max(base_hours.get(priority, 10), int(total_from_resources * 2))


def _parse_duration(duration_str: str) -> float:
    """Parse duration string like '4h 20m', '3 months', '5h' into hours."""
    import re
    if not duration_str or duration_str.lower() in ("self-paced", "ongoing"):
        return 5  # Default estimate

    hours = 0
    # Match hours
    h_match = re.search(r'(\d+)\s*h', duration_str, re.I)
    if h_match:
        hours += int(h_match.group(1))

    # Match minutes
    m_match = re.search(r'(\d+)\s*m(?:in)?', duration_str, re.I)
    if m_match:
        hours += int(m_match.group(1)) / 60

    # Match weeks
    w_match = re.search(r'(\d+)\s*week', duration_str, re.I)
    if w_match:
        hours += int(w_match.group(1)) * 5  # ~5h per week

    # Match months
    mo_match = re.search(r'(\d+)\s*month', duration_str, re.I)
    if mo_match:
        hours += int(mo_match.group(1)) * 20  # ~20h per month

    # Match days
    d_match = re.search(r'(\d+)\s*day', duration_str, re.I)
    if d_match:
        hours += int(d_match.group(1)) * 1  # ~1h per day

    return hours if hours > 0 else 5


def _create_bloom_steps(skill_name: str, resources: List[Dict]) -> List[Dict]:
    """Create learning progression steps based on Bloom's Taxonomy."""
    steps = [
        {
            "level": 1,
            "bloom_level": "Remember",
            "icon": "📖",
            "action": f"Learn the fundamentals of {skill_name}",
            "description": f"Watch introductory tutorials and read documentation to understand what {skill_name} is and why it's used.",
            "completed": False
        },
        {
            "level": 2,
            "bloom_level": "Understand",
            "icon": "💡",
            "action": f"Understand core concepts of {skill_name}",
            "description": f"Explain key concepts and mechanisms of {skill_name} in your own words. Complete guided tutorials.",
            "completed": False
        },
        {
            "level": 3,
            "bloom_level": "Apply",
            "icon": "🔧",
            "action": f"Build a hands-on project with {skill_name}",
            "description": f"Apply {skill_name} knowledge by building a small project or completing coding challenges.",
            "completed": False
        },
        {
            "level": 4,
            "bloom_level": "Analyze",
            "icon": "🔍",
            "action": f"Analyze real-world {skill_name} implementations",
            "description": f"Study open-source projects using {skill_name}. Compare different approaches and identify best practices.",
            "completed": False
        }
    ]
    return steps


def _format_resources(resources: List[Dict]) -> List[Dict]:
    """Format and enrich resource data for frontend display."""
    type_icons = {
        "youtube": "🎥",
        "course": "📚",
        "github": "💻",
        "docs": "📄",
        "practice": "✏️",
        "book": "📕"
    }

    type_colors = {
        "youtube": "#ff0000",
        "course": "#6366f1",
        "github": "#333333",
        "docs": "#3b82f6",
        "practice": "#10b981",
        "book": "#f59e0b"
    }

    formatted = []
    for res in resources:
        res_type = res.get("type", "docs")
        formatted.append({
            **res,
            "icon": type_icons.get(res_type, "📄"),
            "color": type_colors.get(res_type, "#6b7280"),
            "type_label": res_type.replace("_", " ").title()
        })
    return formatted
