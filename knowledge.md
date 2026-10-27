opic: Skillora AI: AI-Powered Career Readiness & Skill Gap Analyzer
Presented By:
1. Shreyansh Yadav (Roll No: 239)
2. Shaurya Mani (Roll No: 223)
3. Shivendra Kumar (Roll No: 234)
4. Shikhar Mishra (Roll No: 226)
Submitted To:
Shweta Kushwaha
Assistant Professor
Department of CSE (Data Science)
1. Introduction & Project Context
In the current competitive employment landscape, students often struggle to understand
whether their academic training matches practical industry expectations. Traditional career
preparation typically relies on static resume guidelines, high-level ATS keyword checks, and
manual exploratory research of job profiles. This fragmented approach leaves critical questions
unanswered: 'What exact competencies am I missing for my dream role?', 'What should I learn
next?', and 'How ready am I to apply?'.
To resolve these issues, the proposed project, Skillora AI, serves as an intelligent platform
going beyond basic text scanning. It extracts information dynamically from a student's
unstructured resume (PDF/DOCX), maps it directly to targeted job domain frameworks (e.g.,
Data Analyst, ML Engineer, Software Developer), identifies precise technical or behavioral
gaps, ranks them according to critical modern workflows, and offers automated structured
upskilling recommendations. This literature survey consolidates foundational research
methodologies in text mining, semantic intelligence, transformer-based encoders, and
recommendation loops that validate the structural framework of Skillora AI.
2. Comprehensive Literature Review
Paper 1: AI-Driven Semantic Matching and Skill Gap Analysis Using
Sentence-BERT
Source: Design and Implementation of an AI-Driven Skill Gap Analysis System (JOIREM,
2026).
Objectives: To automate the cross-referencing process between candidate capabilities and
highly dynamic job descriptions without losing context through strict keyword dependencies.
Methodology: The framework transitions away from traditional text-filtering filters by adopting a
deep semantic similarity technique. It leverages Sentence-BERT (SBERT) fine-tuned on the all-
MiniLM-L6-v2 architecture to convert resume sentences and job demands into unified high-
dimensional vector spaces, calculating precise cosine similarity indexes. An isolated analysis
layer handles multi-role matching and exposes the spatial metrics on a visual 3D dashboard.
Key Findings: The system successfully eliminated keyword rigidities (e.g., recognizing that
'Statistical Modeling' matches semantic variants like 'Regression Analysis'). It successfully
quantified explicit competency gaps simultaneously across multiple target configurations,
providing personalized directional milestones.
Research Gaps: The architecture does not handle deeply layered structural sub-dependencies
within complex task descriptions or evaluate the explicit real-world authority of the matching
projects.
Future Scope: Integration of temporal weights to factor in skill decay and expanding vector
capabilities to support real-time market data streaming.
Paper 2: AI-Based Smart Resume Parser and Skill Extractor Using Bi-
LSTM-CRF and Keyword Matching
Source: AI-Based Smart Resume Parser and Skill Extractor (ResearchGate, 2026).
Objectives: To structure information from highly unstructured, variably formatted multi-style
professional profiles with high lexical accuracy.
Methodology: The researchers implemented a unified hybrid Natural Language Processing
(NLP) framework. It combines a fast dictionary-based keyword look-up rule mechanism with a
deep sequential deep learning framework built on Bidirectional Long Short-Term Memory joined
with Conditional Random Fields (Bi-LSTM-CRF) for advanced Named Entity Recognition (NER).
A specialized fusion controller aggregates outputs from both tracks to filter anomalies.
Key Findings: The combined hybrid network achieved an overall entity extraction validation
accuracy of 91.6%, vastly outstripping independent keyword matching (83.2%) and pure
unconstrained Bi-LSTM-CRF implementations (89.1%) by enforcing domain-specific constraints.
Research Gaps: The framework is heavily reliant on structured English language patterns and
exhibits performance bottlenecks when parsing highly complex multi-column visual document
structures.
Future Scope: Enhancing the text abstraction stack to support native multi-lingual extraction
and integration with modern computer vision layout tools like LayoutLM.
Paper 3: Automated Resume Parsing and Job Domain Prediction Using
Machine Learning
Source: Automated Resume Parsing and Job Domain Prediction (2026).


Objectives: To parse, normalize, and automatically classify candidate historical data into exact
specialized operational clusters while explaining model criteria.
Methodology: Raw multi-format profiles are ingested and normalized utilizing custom Python
regular expressions combined with spaCy's pretrained spatial pipelines. Once segmented into
discrete functional profiles (Education, Projects, Technical Core), an ensemble machine
learning stack powered by CatBoost models and K-Nearest Neighbors (KNN) evaluates
alignment profiles.
Key Findings: The KNN classification framework recorded a peak accuracy of 92.5% for
structural job category mapping. The integration of advanced model interpretability helpers
provided clear feature-weight data showing why individual records mapped to designated roles.
Research Gaps: The system is restricted to a set of static dataset categories and does not
provide an actionable sequential step-by-step roadmap to eliminate identified professional
weaknesses.
Future Scope: Transitioning to a dynamic training topology that updates its target classes
automatically from active continuous job board indices.
Paper 4: AI-Powered Reskilling Pathways for Closing Digital Skill Gaps
Source: AI-Powered Reskilling Pathways Using SAP Talent Intelligence Hub (ResearchGate,
2025).
Objectives: To engineer scalable automated enterprise architectures that close identified
workspace skill deficiencies through adaptive educational paths.
Methodology: The system orchestrates a multi-step analytical loop utilizing qualitative and
quantitative layers. It maps current enterprise skill logs against targeted digital states mapped
out by strategic corporate goals. When gaps are isolated, an automated ingestion pipeline
designs course syllabi mapping directly to Bloom's Taxonomy scales.
Key Findings: The architecture effectively customized educational workflows to match unique
employee proficiency strata, moving past uniform training schedules to generate optimal
knowledge gains per credit hour invested.
Research Gaps: The framework operates effectively within highly integrated corporate
ecosystems but lacks open-source modular components necessary for direct individual student
deployments.
Future Scope: Integrating decentralized open learning modules (such as YouTube, GitHub,
open MOOCs) into the generation pipeline to lower training infrastructure costs.
3. Literature Survey Summary Matrix
Paper Topic &
Source
Core Objectives Methodology &
Architecture
Key Findings &
Achievements
Identified
Research Gaps
Semantic Analysis
(JOIREM, 2026)
Automate resume-
to-job matching with
contextual semantic
tracking.
Sentence-BERT
(SBERT) and all-
MiniLM-L6-v2 vector
embeddings + 3D
visualization.
Overcame strict
keyword limitations.
Found hidden
semantic relations.
Lacks sub-
dependency
checking within
long
descriptions.
Hybrid Resume
Parsing
(ResearchGate,
2026)
Accurate entity
extraction from
multiple formatting
styles.
Hybrid system joining
Keyword Matching with
Bi-LSTM-CRF
frameworks.
Attained 91.6%
accuracy. Enforced
domain rules over
loose model
predictions.
Fails on
unconventional
multi-column
graphical
documents.
Domain
Categorization
(Research, 2026)
Classify candidate
profiles into career
domains with
explanations.
spaCy NLP parsing
pipeline + CatBoost and
KNN Ensemble
classifiers.
Achieved 92.5%
classification accuracy
with explicit feature-
weight metrics.
Static
classifications;
no automated
learning
roadmap loop.
Reskilling
Pathways (SAP,
2025)
Create adaptive
learning paths
based on workforce
gap logs.
Multi-modal
competency matrices
mapped directly to
Bloom's Taxonomy
frameworks.
Delivered
personalized training
roadmaps matching
exact proficiency tiers.
Tightly coupled
to corporate
systems; lacks
open-source
ingestion.
4. Research Gaps & Architectural Alignment with Skillora AI
The comprehensive literature survey reveals clear developmental hurdles that Skillora AI aims
to close:
1. Bridge the Prep-Gap: Most current applications focus strictly on either the employer's
screening process or basic keyword matching, skipping the crucial preparation step of 'What
should I improve before applying?'. Skillora AI shifts this target focus directly to the student.
2. Layout & Formatting Resilience: While deep learning networks provide high accuracy
(such as the 91.6% parsed via Bi-LSTM-CRF frameworks), they often struggle with non-
standard visual resume structures. Skillora AI introduces an extraction system that blends
robust structural normalization with structural fallback blocks.
3. Democratized and Actionable Learning Paths: Past pathway designs are locked inside
premium closed corporate HR setups (e.g., SAP Hub). Skillora AI introduces a modular
architectural framework accessible to students, utilizing open learning data vectors to build
dynamic, step-by-step career readiness scores and structured milestones.
By fusing semantic embeddings (SBERT) for career role alignment, utilizing structured hybrid
keyword-transformer extraction layers, and outputting explicit readiness scores alongside open-
source learning milestones, Skillora AI turns isolated analysis observations into clear goals. This
literature check confirms that the functional workflow steps of Skillora AI—ranging from multi-
format ingestion to customized prioritized learning maps—are backed by sound academic
principles and address important unmet needs in modern educational technology.