# CareerAI - Intelligent Career Management Platform

![CareerAI Dashboard Video Preview](./public/dashboard-video.webp)

CareerAI is a comprehensive **Career Intelligence Platform** designed to help job seekers manage their career journey with data-driven insights. It transforms standard resume tracking into an actionable system using **OpenAI GPT-4o** and **Google Gemini 1.5**.

## 🚀 Key Features

### 1. 📊 Intelligent Dashboard
- **Career Health Snapshot**: Real-time 0-100 score of your job search momentum.
- **Priority Actions Engine**: "Needs Attention" feeds that prioritize critical tasks (e.g., upcoming interviews, stale applications).
- **Pipeline Visualization**: Bento-box style view of your conversion funnel.
- **AI Coach**: Natural language insights providing strategic advice on your next move.

### 2. 🧠 Advanced Resume Intelligence
- **Dual-Engine Analysis**: Leverages both OpenAI and Google Gemini for robust resume parsing and critique.
- **Deep Parsing**: Upload PDF/DOCX resumes with auto-text extraction.
- **AI Scoring**: Get a 0-100 effectiveness score with bullet-level improvement suggestions.
- **"Fix It" Automation**: Auto-rewrite weak resume sections with a single click.
- **Contextual Versioning**: Manage multiple resume versions tailored to different roles.

### 3. 💼 Modern Job Application Pipeline
- **Kanban Board**: Drag-and-drop tracking (Applied → Screening → Interview → Offer).
- **Automated Company Intelligence**: Automatically fetches official company logos and brand colors via **Brandfetch**.
- **Match Analysis**: Compare your resume against detailed job descriptions to identify keyword gaps.
- **Interview Prep**: Generate tailored interview questions and STAR-method answers based on specific job contexts.

### 4. 🗂️ Document Link Hub
- **Central Repository**: Manage all your resumes, cover letters, and portfolio documents in one place.
- **Smart Linking**: Link specific documents to job applications for easy retrieval during interviews.
- **Preview & Edit**: Integrated document viewer and editor.

### 5. ⚡️ Smart Automation
- **Cover Letter Generator**: Create personalized cover letters in seconds.
- **Stale Application Detection**: Automatically flags applications that haven't moved in days.
- **LinkedIn Optimizer**: Turn your resume into a viral-ready LinkedIn post.

## 🛠 Tech Stack

- **Frontend**: Next.js 16 (App Router), TailwindCSS v4, Framer Motion.
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Row Level Security).
- **AI**: OpenAI API (GPT-4o) & Google Gemini API (Flash 1.5).
- **Tools**: `dnd-kit` (Kanban), `Brandfetch` (Logos), `pdf-parse`, `mammoth`.

## 🏁 Getting Started

### Prerequisites
-   Node.js 20+
-   Supabase Account
-   OpenAI API Key
-   Google Gemini API Key
-   Brandfetch API Key (Optional, for logos)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/ai-resume-analyzer.git
    cd ai-resume-analyzer
    ```

2.  **Install Dependencies**
    ```bash
    yarn install
    ```

3.  **Environment Setup**
    Create a `.env.local` file in the root directory:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    OPENAI_API_KEY=your_openai_api_key
    GEMINI_API_KEY=your_gemini_api_key
    # Optional
    BRANDFETCH_API_KEY=your_brandfetch_key
    ```

4.  **Database Migration**
    Run the SQL scripts located in `supabase/migrations/` in your Supabase SQL Editor to set up the schema and RLS policies.
    -   `20240101000000_initial_schema.sql`: Core tables (profiles, resumes, jobs).
    -   `20240101000001_storage_bucket.sql`: Storage bucket for resume files.
    -   `20260103000000_add_match_analysis.sql`: Adds AI matching support.
    -   `20260103010000_add_interview_questions.sql`: Adds AI interview prep support.

5.  **Run Development Server**
    ```bash
    yarn dev
    ```

    Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🔒 Security
-   **Authentication**: Managed via Supabase Auth.
-   **Data Privacy**: Row Level Security (RLS) ensures users can only access their own data.

## 📄 License
MIT
