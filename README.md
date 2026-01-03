# CareerAI - Intelligent Career Management Platform

CareerAI is a comprehensive platform designed to help job seekers manage their career journey. It leverages Artificial Intelligence (OpenAI GPT-4o) to analyze resumes, provide improvement suggestions, track job applications, and calculate match scores against job descriptions.

## 🚀 Key Features

### 1. Resume Management
-   **Upload & Parsing**: Upload PDF or DOCX resumes. The system automatically extracts text content.
-   **Versioning**: Keep track of multiple versions of your resume.
-   **AI Analysis**:
    -   **Scoring**: Get a 0-100 score on your resume's effectiveness.
    -   **Summary**: Auto-generated professional summary.
    -   **Improvements**: Actionable bullet points to enhance your resume.

### 2. Job Application Tracking
-   **Dashboard**: Manage all your applications in one place.
-   **Status Tracking**: Track applications through stages (Applied, Interview, Offer, Rejected).
-   **Organization**: Link specific resume versions to job applications for better context.

### 3. AI Job Matching
-   **Fit Analysis**: Compare your resume against a specific job description.
-   **Match Score**: Receive a percentage score indicating how well you fit the role.
-   **Gap Analysis**: Identify missing keywords and skills required for the job that are missing from your resume.

### 4. AI Interview Coach
-   **Custom Questions**: Generate tailored technical and behavioral interview questions based on your resume and the job description.
-   **STAR Method Answers**: Get suggested answers using the STAR (Situation, Task, Action, Result) framework.

### 5. Kanban Board
-   **Visual Pipeline**: View your job applications in a Kanban-style board organized by status.
-   **Drag-and-Drop**: Easily update application status by dragging cards between columns.

### 6. User Settings
-   **Profile Management**: Edit your display name and view account details.
-   **Secure Authentication**: Sign out functionality integrated with Supabase Auth.

## 🛠 Tech Stack

-   **Frontend**: Next.js 14+ (App Router), TailwindCSS, Lucide Icons.
-   **Backend**: Supabase (PostgreSQL, Auth, Storage, Row Level Security).
-   **AI**: OpenAI API (GPT-4o).
-   **Parsing**: `pdf-parse` (PDF) and `mammoth` (DOCX).

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
