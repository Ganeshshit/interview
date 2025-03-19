import React from "react";
import { ArrowRight, Calendar, Code, Users, Video } from "lucide-react";

// Custom Button Component
const Button = ({ children, variant = "default", size = "default", className = "", ...props }) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";
  
  const variantStyles = {
    default: "bg-gray-900 text-white hover:bg-gray-800 rounded-lg",
    outline: "border border-gray-300 bg-white hover:bg-gray-100 text-gray-900",
  };
  
  const sizeStyles = {
    default: "h-10 px-4 py-2",
    lg: "h-12 px-6 py-3 text-lg",
  };
  
  return (
    <button 
      className={`rounded-lg ${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Custom Card Components
const Card = ({ children, className = "", ...props }) => {
  return (
    <div className={`rounded-lg border border-gray-200 bg-white text-gray-900 shadow-sm ${className}`} {...props}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = "", ...props }) => {
  return (
    <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

const CardTitle = ({ children, className = "", ...props }) => {
  return (
    <h3 className={`text-xl font-semibold leading-none tracking-tight ${className}`} {...props}>
      {children}
    </h3>
  );
};

const CardDescription = ({ children, className = "", ...props }) => {
  return (
    <p className={`text-sm text-gray-500 ${className}`} {...props}>
      {children}
    </p>
  );
};

const CardContent = ({ children, className = "", ...props }) => {
  return (
    <div className={`p-6 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
};

// Link component (simplified version without Next.js router)
const Link = ({ href, children, className = "", ...props }) => {
  return (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  );
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Video className="h-6 w-6 text-black" />
            <span className="text-xl font-bold">InterviewPro</span>
          </div>
          {/* <nav className="hidden md:flex items-center gap-6">
            <Link href="/features" className="text-sm font-medium text-gray-700 hover:text-blue-600">
              Features
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-gray-700 hover:text-blue-600">
              Pricing
            </Link>
            <Link href="/about" className="text-sm font-medium text-gray-700 hover:text-blue-600">
              About
            </Link>
          </nav> */}
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline">Log in</Button>
            </Link>
            <Link href="/register">
              <Button>Sign up</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-gray-900">Streamline Your Technical Interviews</h1>
          <p className="text-xl text-gray-500 max-w-3xl mx-auto mb-10">
            A comprehensive platform for conducting seamless technical interviews with integrated video calls and live
            coding environments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register?role=candidate">
              <Button size="lg" className="gap-2">
                Join as Candidate <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/register?role=interviewer">
              <Button size="lg" variant="outline" className="gap-2">
                Join as Interviewer <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Video className="h-10 w-10 text-black mb-2" />
                <CardTitle>Real-time Video Interviews</CardTitle>
                <CardDescription>
                  High-quality, low-latency video and audio communication for seamless interviews.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Our platform uses WebRTC technology to provide stable and secure video connections, ensuring a smooth
                  interview experience for both candidates and interviewers.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Code className="h-10 w-10 text-black mb-2" />
                <CardTitle>Live Coding Environment</CardTitle>
                <CardDescription>
                  Integrated code editor with syntax highlighting and real-time execution.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Evaluate technical skills effectively with our Monaco Editor integration, supporting multiple
                  programming languages and providing real-time code execution.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Calendar className="h-10 w-10 text-black mb-2" />
                <CardTitle>Smart Scheduling</CardTitle>
                <CardDescription>Intuitive calendar integration for managing interview appointments.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Easily set availability as an interviewer or book time slots as a candidate with our visual calendar
                  system, eliminating scheduling conflicts.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="bg-blue-50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="bg-blue-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-black" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">1. Create an Account</h3>
                <p className="text-gray-500">
                  Sign up as a candidate, interviewer, or administrator and set up your profile.
                </p>
              </div>
              <div>
                <div className="bg-blue-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-black" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">2. Schedule Interviews</h3>
                <p className="text-gray-500">
                  Interviewers set availability, and candidates book preferred time slots.
                </p>
              </div>
              <div>
                <div className="bg-blue-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video className="h-8 w-8 text-black" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">3. Conduct Interviews</h3>
                <p className="text-gray-500">
                  Join the interview room with video, audio, and live coding capabilities.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Video className="h-6 w-6 text-black" />
                <span className="text-xl font-bold">InterviewPro</span>
              </div>
              <p className="text-slate-400">Streamlining technical interviews with cutting-edge technology.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/features" className="text-slate-400 hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-slate-400 hover:text-white">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/testimonials" className="text-slate-400 hover:text-white">
                    Testimonials
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-slate-400 hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="text-slate-400 hover:text-white">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-slate-400 hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy" className="text-slate-400 hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-slate-400 hover:text-white">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>© {new Date().getFullYear()} InterviewPro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}