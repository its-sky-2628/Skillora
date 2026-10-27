# Skillora 🎯
### AI-Powered Skill Gap Analyzer & Learning Roadmap

Skillora is a web application designed to help users understand their skill gaps, analyze their existing skills, and discover a structured learning path toward their career goals.

By analyzing resume information and comparing skills against relevant role requirements, Skillora aims to make career planning and skill development more organized and actionable.

## ✨ Features

- **Resume Upload:** Upload a resume for skill analysis.
- **Skill Gap Analysis:** Identify existing skills and areas that may need improvement.
- **Role-Based Analysis:** Analyze skills relevant to different professional roles.
- **Learning Roadmap:** Explore a structured roadmap to guide skill development.
- **Skill Visualization:** View skill-related insights through visual components.
- **Skill Recommendations:** Get recommendations to help prioritize learning.

## 🛠️ Tech Stack

**Frontend**
- React
- Vite
- JavaScript
- CSS

**Backend**
- Python
- FastAPI
- Uvicorn

**Document Processing & Analysis**
- pdfplumber
- python-docx
- RapidFuzz
- Custom skill taxonomy and recommendation logic

## 📁 Project Structure

```text
Skillora/
├── backend/
│   ├── main.py
│   ├── recommender.py
│   ├── resume_parser.py
│   ├── skill_analyzer.py
│   ├── skill_taxonomy.json
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites

Make sure you have installed:
- Node.js and npm
- Python 3
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/its-sky-2628/Skillora.git
cd Skillora
```

### 2. Set Up the Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Start the backend using Uvicorn:

```bash
python -m uvicorn main:app --reload --port 8000
```

> If your FastAPI application uses a different variable name than `app`, update `main:app` accordingly.

### 3. Set Up the Frontend

Open a new terminal and run:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite, usually `http://localhost:5173`.

## 🔌 API Configuration

The frontend development server is configured to proxy `/api` requests to the backend at:

```text
http://localhost:8000
```

Make sure the backend is running before using features that require API access.

## 🎯 Project Goals

- Help users identify skills relevant to their target roles.
- Make skill gaps easier to understand.
- Support structured and focused learning.
- Provide a foundation for personalized career development.

## 🔮 Future Improvements

- Personalized learning recommendations.
- More job roles and skill categories.
- Improved resume analysis and skill matching.
- Progress tracking for learning roadmaps.
- Deployment with a publicly accessible demo.

## 🤝 Contributing

Contributions, ideas, and feedback are welcome. Fork the repository, create a feature branch, and submit a pull request.

## 📄 License

A license has not yet been specified. Add a `LICENSE` file if you intend to distribute the project under an open-source license.

---

**Developed as a project focused on skill analysis, career guidance, and structured learning.**
