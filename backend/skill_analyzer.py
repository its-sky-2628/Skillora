"""
Skillora AI — Skill Gap Analyzer Module
Calculates career readiness scores and identifies precise skill gaps.
Based on Paper 1 (SBERT semantic matching) and Paper 3 (classification with explainability).
MVP uses keyword matching + fuzzy similarity for lightweight operation.
"""

import json
from typing import Dict, List, Tuple
from pathlib import Path


def load_taxonomy() -> dict:
    """Load the skill taxonomy from JSON file."""
    taxonomy_path = Path(__file__).parent / "skill_taxonomy.json"
    with open(taxonomy_path, "r") as f:
        return json.load(f)


# ── Priority Weights ────────────────────────────────────────────────────────
# Following Paper 4's Bloom's Taxonomy-inspired weighting
PRIORITY_WEIGHTS = {
    "critical": 3.0,     # Must-have skills for the role
    "important": 2.0,    # Strongly expected skills
    "nice_to_have": 1.0  # Bonus/differentiating skills
}


def analyze_skill_gaps(
    extracted_skills: List[Dict],
    target_role: str,
    taxonomy: dict
) -> Dict:
    """
    Analyze skill gaps between extracted resume skills and target role requirements.

    Args:
        extracted_skills: List of skills extracted from resume
        target_role: Target job role key (e.g., 'data_analyst')
        taxonomy: Full skill taxonomy dict

    Returns:
        Dict containing readiness_score, matched_skills, missing_skills, gap_analysis
    """
    role_data = taxonomy.get("roles", {}).get(target_role)
    if not role_data:
        available_roles = list(taxonomy.get("roles", {}).keys())
        raise ValueError(f"Unknown role: {target_role}. Available: {available_roles}")

    # Build set of extracted skill names (lowercased for matching)
    extracted_names = set()
    extracted_map = {}
    for skill in extracted_skills:
        name_lower = skill["name"].lower()
        extracted_names.add(name_lower)
        extracted_map[name_lower] = skill

    # Analyze each priority tier
    matched_skills = []
    missing_skills = []
    category_scores = {}  # category -> (matched_weight, total_weight)

    total_weighted_score = 0
    max_weighted_score = 0

    for priority in ["critical", "important", "nice_to_have"]:
        weight = PRIORITY_WEIGHTS[priority]
        skills_list = role_data.get("skills", {}).get(priority, [])

        for skill in skills_list:
            skill_name = skill["name"]
            skill_name_lower = skill_name.lower()
            category = skill.get("category", "Technical")

            # Initialize category tracking
            if category not in category_scores:
                category_scores[category] = {"matched": 0, "total": 0, "matched_count": 0, "total_count": 0}

            category_scores[category]["total"] += weight
            category_scores[category]["total_count"] += 1
            max_weighted_score += weight

            # Check if skill is matched
            is_matched = False
            match_confidence = 0

            # Direct name match
            if skill_name_lower in extracted_names:
                is_matched = True
                match_confidence = extracted_map[skill_name_lower].get("confidence", 1.0)
            else:
                # Check aliases against extracted skills
                for alias in skill.get("aliases", []):
                    alias_lower = alias.lower()
                    if alias_lower in extracted_names:
                        is_matched = True
                        match_confidence = extracted_map[alias_lower].get("confidence", 0.9)
                        break

                # Also check if any extracted skill name matches this skill's aliases
                if not is_matched:
                    for ext_name in extracted_names:
                        if ext_name in [a.lower() for a in skill.get("aliases", [])]:
                            is_matched = True
                            match_confidence = 0.85
                            break

            if is_matched:
                matched_skills.append({
                    "name": skill_name,
                    "category": category,
                    "priority": priority,
                    "confidence": match_confidence,
                    "weight": weight,
                    "description": skill.get("description", "")
                })
                total_weighted_score += weight * match_confidence
                category_scores[category]["matched"] += weight * match_confidence
                category_scores[category]["matched_count"] += 1
            else:
                missing_skills.append({
                    "name": skill_name,
                    "category": category,
                    "priority": priority,
                    "weight": weight,
                    "description": skill.get("description", ""),
                    "resources": skill.get("resources", [])
                })

    # Calculate readiness score (0-100)
    readiness_score = round((total_weighted_score / max_weighted_score) * 100, 1) if max_weighted_score > 0 else 0

    # Calculate category breakdown
    category_breakdown = {}
    for cat, data in category_scores.items():
        cat_score = round((data["matched"] / data["total"]) * 100, 1) if data["total"] > 0 else 0
        category_breakdown[cat] = {
            "score": cat_score,
            "matched_count": data["matched_count"],
            "total_count": data["total_count"]
        }

    # Sort missing skills by priority weight (critical first)
    missing_skills.sort(key=lambda s: -s["weight"])

    # Generate gap summary
    gap_summary = _generate_gap_summary(
        readiness_score, matched_skills, missing_skills, role_data["title"]
    )

    return {
        "target_role": {
            "key": target_role,
            "title": role_data["title"],
            "description": role_data.get("description", ""),
            "icon": role_data.get("icon", "💼")
        },
        "readiness_score": readiness_score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "category_breakdown": category_breakdown,
        "gap_summary": gap_summary,
        "stats": {
            "total_required": len(matched_skills) + len(missing_skills),
            "total_matched": len(matched_skills),
            "total_missing": len(missing_skills),
            "critical_matched": len([s for s in matched_skills if s["priority"] == "critical"]),
            "critical_total": len([s for s in matched_skills if s["priority"] == "critical"]) +
                             len([s for s in missing_skills if s["priority"] == "critical"]),
            "important_matched": len([s for s in matched_skills if s["priority"] == "important"]),
            "important_total": len([s for s in matched_skills if s["priority"] == "important"]) +
                              len([s for s in missing_skills if s["priority"] == "important"]),
        }
    }


def _generate_gap_summary(
    score: float,
    matched: List[Dict],
    missing: List[Dict],
    role_title: str
) -> Dict:
    """Generate a human-readable gap summary with actionable insights."""
    if score >= 85:
        level = "Excellent"
        message = f"You're highly prepared for a {role_title} role! Focus on the remaining gaps to become an exceptional candidate."
        color = "#10b981"
    elif score >= 70:
        level = "Good"
        message = f"You have a solid foundation for a {role_title} role. Addressing the critical gaps below will significantly boost your readiness."
        color = "#3b82f6"
    elif score >= 50:
        level = "Moderate"
        message = f"You have some relevant skills for a {role_title} role, but there are important gaps to fill. Follow the learning roadmap to level up."
        color = "#f59e0b"
    elif score >= 30:
        level = "Developing"
        message = f"You're building towards a {role_title} role. Focus on the critical skills first to build a strong foundation."
        color = "#f97316"
    else:
        level = "Getting Started"
        message = f"You're at the beginning of your journey towards a {role_title} role. Start with the critical skills and work your way through the roadmap."
        color = "#ef4444"

    critical_missing = [s for s in missing if s["priority"] == "critical"]
    top_priorities = [s["name"] for s in critical_missing[:3]]

    return {
        "level": level,
        "message": message,
        "color": color,
        "top_priorities": top_priorities,
        "estimated_prep_weeks": _estimate_prep_time(missing)
    }


def _estimate_prep_time(missing_skills: List[Dict]) -> int:
    """Estimate preparation time in weeks based on missing skills."""
    weeks = 0
    for skill in missing_skills:
        if skill["priority"] == "critical":
            weeks += 3
        elif skill["priority"] == "important":
            weeks += 2
        else:
            weeks += 1
    return max(4, min(weeks, 52))  # Cap between 4-52 weeks


def get_available_roles(taxonomy: dict) -> List[Dict]:
    """Return list of available roles with metadata."""
    roles = []
    for key, data in taxonomy.get("roles", {}).items():
        roles.append({
            "key": key,
            "title": data["title"],
            "description": data.get("description", ""),
            "icon": data.get("icon", "💼"),
            "skill_count": sum(
                len(data.get("skills", {}).get(p, []))
                for p in ["critical", "important", "nice_to_have"]
            )
        })
    return roles
