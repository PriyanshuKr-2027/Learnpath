# CourseOs & LearnPath AI — Complete Functional Specification & Architecture

> **System Title:** LearnPath AI 2.0 (CourseOs Cognitive Operating System)  
> **Core Mission:** Dynamic, AI-driven adaptive career transition roadmap generator with automated Kahn's DAG sequencing, multi-modal background verification, Rasch CAT boss assessments, split-screen learning canvas, and real-time collaboration.

---

## 1. Executive Summary & Core Value Proposition
Traditional tech bootcamps and online courses provide linear, rigid, one-size-fits-all roadmaps that waste learner time on mastered topics or overwhelm them with missing prerequisites. 

**LearnPath AI** is an autonomous career architect that:
1. **Ingests Multi-Modal Ground Truth**: Analyzes uploaded Resume PDFs and authentic non-forked GitHub repository telemetry.
2. **Synthesizes Adaptive DAGs**: Employs **Kahn's Topological Sort** to generate an S-curve sequenced learning graph where foundational concepts strictly precede advanced topics.
3. **Adaptive Remediation Loops**: Evaluates mastery via **1-PL Rasch Item Response Theory CAT Boss Checkpoints**. Failing a boss checkpoint automatically injects an orange remediation node into the DAG with targeted drill exercises.
4. **Focused Daily Study Canvas**: Provides high-density study tools including split-screen video/documentation, 3D interactive flashcards, markdown notes, and a Socratic AI Copilot.
5. **Live Collaborative Study**: Integrates Stream Video/Chat SDK for real-time peer study rooms.

---

## 2. Comprehensive System Capabilities & Requirements

### 🎯 2.1 Multi-Modal AI Onboarding & Skill Delta Matrix
- **Career Prompt Semantic Role Extraction**:
  - Accepts free-form goals (e.g. *"Transition into an AI Engineer role in 12 weeks with 10 hrs/week"*).
  - Matches goals against a taxonomy of 6 pre-seeded engineering roles (Data Analyst, Generative AI & RAG, Full-Stack AI, Cloud & DevOps, Distributed Backend, FAANG DSA).
- **Resume Ingestion**:
  - Parses PDFs, extracts verified tech stack entities, past projects, and certifications.
- **GitHub Profile Telemetry**:
  - Connects to GitHub API, filters out forked repositories, and calculates codebase language distribution percentages from original commits.
- **Skill Delta Matrix Calibration**:
  - Calculates $\Delta = \text{Required Proficiency} - \text{Current Baseline Proficiency}$.
  - Skills with $\ge 75\%$ proficiency are marked *Mastered* and automatically bypassed.

---

### 🗺️ 2.2 Dynamic Kahn's Topological DAG & Gamified Level Map
- **Kahn's Topological Sorting Engine (`scheduleNodesWithKahns`)**:
  - Builds in-degree mappings and dependency queues.
  - Resolves prerequisite constraints and assigns optimal `targetWeek` and `displayLevel`.
- **Serpentine Map Coordinates (`generateSerpentineCoordinates`)**:
  - Positions levels in a multi-row curved visual flow resembling a mobile progression game.
- **Node Classification & State Machine**:
  - `Completed`: Marked with green signal badge and 1–3 star mastery tiers.
  - `Active`: Pulsing focal beacon indicating the current active learning milestone.
  - `Boss Checkpoint`: High-stakes assessment node testing combined prerequisite topics.
  - `Remediation Lab`: Dynamically generated branch node with dashed red edges injected upon diagnostic failure.
  - `Locked`: Nodes pending prerequisite completion.

---

### 💻 2.3 Focused Study Canvas (`/learn/[stepId]`)
- **Split-Screen Layout**:
  - Left pane: YouTube video lecture / interactive documentation canvas.
  - Right pane: 3D flip flashcard deck with difficulty rating and keyboard shortcuts (Space to flip, arrows to navigate).
- **Socratic AI Tutor**:
  - Embedded chat assistant using Groq Llama 3 70B & Gemini 1.5 Pro.
  - Guides students with conceptual hints and step-by-step reasoning rather than giving away raw answers.
- **Rich Markdown Note Taker**:
  - Real-time autosaving notes with syntax highlighting and quick export.

---

### 🧪 2.4 1-PL Rasch Computerized Adaptive Testing (CAT)
- **Item Response Theory Formula**:
  $$P(\text{Correct} \mid \theta, b_i) = \frac{1}{1 + e^{-(\theta - b_i)}}$$
  where $\theta$ represents the learner's estimated latent ability and $b_i$ represents the calibrated item difficulty.
- **Real-Time Ability Updating**:
  - Correct answers increase item difficulty; incorrect answers dynamically reduce difficulty to pinpoint exact knowledge boundaries.
- **Autonomous Remediation Trigger**:
  - If final $\theta < \text{Passing Threshold}$, the engine identifies deficient topics, generates a targeted remediation milestone, and splices it into the active DAG with diff notifications.

---

### 👥 2.5 Real-Time Social Study Rooms (`/social`)
- **Stream Video SDK & WebRTC**:
  - Peer-to-peer study sessions with video, audio, and screen sharing.
- **Group Chats & Direct Messaging**:
  - Stream Chat integration for cohort channels and 1-on-1 direct messaging.
- **Global Leaderboard & Streak Tracking**:
  - Daily active streak counter, XP gamification, and peer ranking.

---

### 🛡️ 2.6 Administrator Management Suite (`/admin`)
- **Learner Progress Directory**:
  - Live table of registered users, completed levels, mastery scores, and streak data.
- **Live Chat Monitor**:
  - Administrative oversight of community study channels.
- **User Provisioning**:
  - Admin creation and role management.

---

### 🎨 2.7 Design System & Visual Architecture
- **Palette Tokens**:
  - Primary Focus: `#6D5BF0` (Violet)
  - Signal (Mastered): `#3DDC84` (Green)
  - Warning (Boss): `#F5A623` (Amber)
  - Alert (Remediation): `#E2533D` (Coral/Red)
  - Surfaces: `#0A0A0B` (Dark Paper), `#14171C` (Dark Sidebar), `#1C1F26` (Dark Surface), `#2A2D35` (Border)
- **Iconography**:
  - Clean vector Lucide React & React-Icons. Zero emoji policy across core dashboards and workflows.
- **Offline Resiliency**:
  - Dual-mode architecture supporting live Supabase PostgreSQL backend with instant zero-error local mock fallback.
