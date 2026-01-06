import Link from 'next/link'
import Logo from '@/components/Logo'
import { Sparkles, FileText, Target, MessageSquare, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <Logo />
        <nav className="flex items-center space-x-6">
          <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition">
            Features
          </Link>
          <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-primary transition">
            How It Works
          </Link>
          <Link href="/login" className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition shadow-sm">
            Sign In
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="flex flex-col items-center justify-center p-8 py-20 text-center bg-gradient-to-b from-primary/5 to-background">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6">
              Optimize Your Resume.
              <br />
              <span className="text-primary">Land More Interviews.</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              AI-powered resume analysis, job application tracking, and intelligence
              to help you tailor every application for success.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/login"
                className="rounded-md bg-primary px-8 py-4 text-lg text-primary-foreground font-semibold shadow-lg hover:bg-primary/90 transition flex items-center"
              >
                Get Started for Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="#features"
                className="rounded-md bg-background border-2 border-border px-8 py-4 text-lg text-foreground font-semibold shadow-sm hover:bg-muted transition"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4">Powerful Features</h2>
              <p className="text-xl text-muted-foreground">Everything you need to land your dream job</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="p-6 border border-border rounded-lg hover:shadow-lg transition bg-card">
                <div className="bg-primary/10 rounded-lg p-3 w-fit mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">AI Resume Analysis</h3>
                <p className="text-muted-foreground">Get instant feedback with a 0-100 score and actionable improvement suggestions powered by GPT-4o.</p>
              </div>
              <div className="p-6 border border-border rounded-lg hover:shadow-lg transition bg-card">
                <div className="bg-primary/10 rounded-lg p-3 w-fit mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Job Matching</h3>
                <p className="text-muted-foreground">Compare your resume against job descriptions and identify missing keywords to optimize your fit.</p>
              </div>
              <div className="p-6 border border-border rounded-lg hover:shadow-lg transition bg-card">
                <div className="bg-purple-500/10 rounded-lg p-3 w-fit mb-4">
                  <MessageSquare className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Interview Prep</h3>
                <p className="text-muted-foreground">Generate custom technical and behavioral questions with STAR-method answers tailored to each role.</p>
              </div>
              <div className="p-6 border border-border rounded-lg hover:shadow-lg transition bg-card">
                <div className="bg-green-500/10 rounded-lg p-3 w-fit mb-4">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Application Tracking</h3>
                <p className="text-muted-foreground">Manage all your applications in a Kanban board with drag-and-drop status updates.</p>
              </div>
              <div className="p-6 border border-border rounded-lg hover:shadow-lg transition bg-card">
                <div className="bg-orange-500/10 rounded-lg p-3 w-fit mb-4">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Resume Versioning</h3>
                <p className="text-muted-foreground">Keep track of multiple resume versions and link specific versions to job applications.</p>
              </div>
              <div className="p-6 border border-border rounded-lg hover:shadow-lg transition bg-card">
                <div className="bg-pink-500/10 rounded-lg p-3 w-fit mb-4">
                  <CheckCircle className="h-6 w-6 text-pink-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Secure & Private</h3>
                <p className="text-muted-foreground">Your data is protected with Row Level Security and encrypted storage via Supabase.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 bg-muted/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4">How It Works</h2>
              <p className="text-xl text-muted-foreground">Get started in three simple steps</p>
            </div>
            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Upload Your Resume</h3>
                <p className="text-muted-foreground">Upload your resume in PDF or DOCX format. Our AI will parse and analyze it instantly.</p>
              </div>
              <div className="text-center">
                <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Get AI Insights</h3>
                <p className="text-muted-foreground">Receive a detailed analysis with scores, suggestions, and match percentages for each job.</p>
              </div>
              <div className="text-center">
                <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Track & Succeed</h3>
                <p className="text-muted-foreground">Manage applications, prepare for interviews, and land your dream job with confidence.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4">What Our Users Say</h2>
              <p className="text-xl text-muted-foreground">Join thousands of job seekers who landed their dream roles</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-muted/50 p-6 rounded-lg border border-border">
                <div className="flex items-center mb-4">
                  <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center font-bold mr-3">
                    JS
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Jane Smith</h4>
                    <p className="text-sm text-muted-foreground">Software Engineer</p>
                  </div>
                </div>
                <p className="text-muted-foreground italic">"CareerAI helped me identify gaps in my resume I never noticed. I got 3 interviews in the first week!"</p>
              </div>
              <div className="bg-muted/50 p-6 rounded-lg border border-border">
                <div className="flex items-center mb-4">
                  <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center font-bold mr-3">
                    MD
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Michael Davis</h4>
                    <p className="text-sm text-muted-foreground">Product Manager</p>
                  </div>
                </div>
                <p className="text-muted-foreground italic">"The interview prep feature is a game-changer. I felt confident and prepared for every question."</p>
              </div>
              <div className="bg-muted/50 p-6 rounded-lg border border-border">
                <div className="flex items-center mb-4">
                  <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center font-bold mr-3">
                    SL
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Sarah Lee</h4>
                    <p className="text-sm text-muted-foreground">Data Analyst</p>
                  </div>
                </div>
                <p className="text-muted-foreground italic">"Tracking all my applications in one place saved me so much time. Highly recommend!"</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="max-w-4xl mx-auto text-center px-6">
            <h2 className="text-4xl font-bold mb-4">Ready to Land Your Dream Job?</h2>
            <p className="text-xl mb-8 text-primary-foreground/90">Join thousands of successful job seekers using CareerAI</p>
            <Link
              href="/login"
              className="inline-block rounded-md bg-background text-primary px-8 py-4 text-lg font-semibold shadow-lg hover:bg-muted transition"
            >
              Get Started for Free
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} CareerAI. Built with Next.js, Supabase & OpenAI.
            </div>
            <div className="flex space-x-6 text-sm">
              <Link href="/login" className="text-muted-foreground hover:text-primary transition">
                Sign In
              </Link>
              <Link href="#features" className="text-muted-foreground hover:text-primary transition">
                Features
              </Link>
              <Link href="#how-it-works" className="text-muted-foreground hover:text-primary transition">
                How It Works
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

