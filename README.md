# CareerAI - Intelligent Career Management Platform


![CareerAI Dashboard Video Preview](./public/dashboard-video.webp)

CareerAI is a comprehensive **Career Intelligence Platform** designed to help job seekers manage their career journey with data-driven insights. It transforms standard resume tracking into an actionable system using OpenAI GPT-4o.

## 🚀 Key Features

### 1. 📊 Intelligent Dashboard (New)
- **Career Health Snapshot**: Real-time 0-100 score of your job search momentum.
- **Priority Actions Engine**: "Needs Attention" feeds that prioritize critical tasks (e.g., upcoming interviews, stale applications) over busy work.
- **Pipeline Visualization**: Bento-box style view of your conversion funnel.
- **AI Coach**: Natural language insights providing strategic advice on your next move.

### 2. 📄 Resume Intelligence
- **Deep Parsing**: Upload PDF/DOCX resumes with auto-text extraction.
- **AI Scoring**: Get a 0-100 effectiveness score with bullet-level improvement suggestions.
- **Contextual Versioning**: Manage multiple resume versions tailored to different roles.

### 3. 💼 Job Application Pipeline
- **Smart Tracking**: Visual hiring pipeline (Applied → Screening → Interview → Offer).
- **Match Analysis**: Compare your resume against detailed job descriptions to find gaps.
- **Interview Prep**: Generate tailored interview questions and STAR-method answers based on the specific job context.

### 4. ⚡️ Smart Automation
- **Cover Letter Generator**: Create personalized cover letters in seconds.
- **Thank You Emails**: Draft post-interview follow-ups automatically.
- **LinkedIn Optimizer**: Turn your resume into a viral-ready LinkedIn post.

## 🛠 Tech Stack

- **Frontend**: Next.js 14+ (App Router), TailwindCSS, Framer Motion.
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Row Level Security).
- **AI**: OpenAI API (GPT-4o).
- **Parsing**: `pdf-parse` (PDF) and `mammoth` (DOCX).

## 🏁 Getting Started

### Prerequisites
-   Node.js 18+
-   Supabase Account
-   OpenAI API Key

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
