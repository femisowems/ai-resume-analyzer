import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="px-6 py-4 flex justify-between items-center border-b">
        <h1 className="text-xl font-bold text-indigo-600">CareerIntel</h1>
        <nav>
          <Link href="/login" className="text-sm font-medium hover:text-indigo-600">
            Sign In
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50">
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-6">
          Optimize Your Resume.<br />
          <span className="text-indigo-600">Land More Interviews.</span>
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mb-8">
          AI-powered resume analysis, job application tracking, and intelligence
          to help you tailor every application for success.
        </p>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="rounded-md bg-indigo-600 px-6 py-3 text-white font-semibold shadow hover:bg-indigo-700 transition"
          >
            Get Started for Free
          </Link>
          <Link
            href="#features"
            className="rounded-md bg-white border border-gray-300 px-6 py-3 text-gray-700 font-semibold shadow-sm hover:bg-gray-50 transition"
          >
            Learn More
          </Link>
        </div>
      </main>

      <footer className="border-t py-6 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Career Intelligence Platform. All rights reserved.
      </footer>
    </div>
  )
}
