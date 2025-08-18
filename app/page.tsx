import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BookOpen,
  Target,
  Brain,
  Award,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Globe,
  Bot,
  FileText,
  Layers,
  Phone,
  Mail,
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-primary p-2 rounded-lg">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">Xed21</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Login
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-accent/5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 animate-pulse">
            <Bot className="h-16 w-16 text-primary" />
          </div>
          <div className="absolute top-40 right-20 animate-bounce">
            <Brain className="h-12 w-12 text-accent" />
          </div>
          <div className="absolute bottom-40 left-1/4 animate-pulse">
            <FileText className="h-14 w-14 text-primary" />
          </div>
          <div className="absolute bottom-20 right-1/3 animate-bounce">
            <Layers className="h-10 w-10 text-accent" />
          </div>
        </div>

        <div className="container mx-auto text-center max-w-6xl relative z-10">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-primary/10 p-3 rounded-full animate-pulse">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-6xl font-bold text-foreground mb-6 leading-tight">
            AI-Powered Assessment
            <span className="text-primary block">Question Generation</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
            Generate high-quality, curriculum-aligned assessment questions instantly using advanced AI. Perfect for
            educators creating tests, quizzes, and practice materials for Indian education boards.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/auth/signup">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg group"
              >
                Start Generating Questions
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-4 text-lg border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
              >
                Login to Dashboard
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">10K+</div>
              <div className="text-sm text-muted-foreground">Questions Generated</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">500+</div>
              <div className="text-sm text-muted-foreground">Active Educators</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">1000+</div>
              <div className="text-sm text-muted-foreground">Topics (Grade 1-12)</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-card">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Powerful Features for Educators</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform provides everything you need to create comprehensive, high-quality assessment
              questions aligned with Indian educational standards.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-background">
              <CardHeader>
                <Brain className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-xl">AI-Powered Generation</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  Advanced AI creates contextually appropriate questions based on your curriculum requirements
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-background">
              <CardHeader>
                <FileText className="h-12 w-12 text-accent mb-4" />
                <CardTitle className="text-xl">Multiple Question Types</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  Generate MCQs, fill-in-blanks, true/false, matching, and multi-select questions
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-background">
              <CardHeader>
                <Award className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-xl">Bloom's Taxonomy</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  Questions aligned with all cognitive levels from remembering to creating
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-background">
              <CardHeader>
                <Target className="h-12 w-12 text-accent mb-4" />
                <CardTitle className="text-xl">Indian Education Boards</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  Support for NCERT, CBSE, ICSE, and state boards with grade-wise content
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-background">
              <CardHeader>
                <Globe className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-xl">Multiple Export Formats</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  Export questions as PDF, Word documents, or CSV files with detailed explanations
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-background">
              <CardHeader>
                <CheckCircle className="h-12 w-12 text-accent mb-4" />
                <CardTitle className="text-xl">Detailed Explanations</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  Each question includes comprehensive explanations for all options
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Question Types */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-foreground mb-6 text-center">6 Question Types Supported</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                "Multiple Choice (Single)",
                "Multiple Select",
                "Fill in the Blanks",
                "In-Line Choice",
                "Matching",
                "True/False",
              ].map((type, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-accent" />
                  <span className="text-foreground font-medium">{type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground">
              Pay only for what you use with our flexible coin-based system
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="border-2 border-muted">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Starter</CardTitle>
                <div className="text-4xl font-bold text-primary">₹100</div>
                <div className="text-lg text-accent font-semibold">200 coins</div>
                <CardDescription>Perfect for trying out the platform</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-primary relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Professional</CardTitle>
                <div className="text-4xl font-bold text-primary">₹500</div>
                <div className="text-lg text-accent font-semibold">1100 coins</div>
                <div className="text-sm text-green-600 font-medium">100 bonus coins included!</div>
                <CardDescription>Best value for regular users</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-muted">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Premium</CardTitle>
                <div className="text-4xl font-bold text-primary">₹1000</div>
                <div className="text-lg text-accent font-semibold">2300 coins</div>
                <div className="text-sm text-green-600 font-medium">300 bonus coins included!</div>
                <CardDescription>For heavy users and institutions</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="text-center space-y-2 text-muted-foreground">
            <p>Bloom's taxonomy-based pricing: 5-25 coins per question • New users get 500 free coins</p>
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="font-semibold text-foreground">
                🎉 Introductory Offer: ₹0.5 = 1 coin (normally ₹1 = 1 coin)
              </p>
              <p className="text-sm">
                Valid for first 1000 users • 18% bonus on recharges above ₹1000 • Minimum recharge ₹100
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary to-accent text-black">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Assessment Creation?</h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of educators who are already using Xed21 to create better assessments
          </p>
          <Link href="/auth/signup">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 px-10 py-5 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              Start Free with 500 Coins
              <Sparkles className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 bg-card">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Get in Touch</h2>
          <p className="text-xl text-muted-foreground mb-8">Have questions or need support? We're here to help.</p>

          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-3">
              <Mail className="h-6 w-6 text-primary" />
              <div>
                <div className="font-semibold">Email</div>
                <div className="text-muted-foreground">contact@xed21.com</div>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <Phone className="h-6 w-6 text-primary" />
              <div>
                <div className="font-semibold">Phone</div>
                <div className="text-muted-foreground">+91 9435358512</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-sidebar text-sidebar-foreground py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="bg-sidebar-primary p-2 rounded-lg">
                <BookOpen className="h-5 w-5 text-sidebar-primary-foreground" />
              </div>
              <span className="text-2xl font-bold">Xed21</span>
            </div>
            <p className="text-lg font-medium text-muted-foreground">Next-Gen Assessment Intelligence</p>
          </div>
          <div className="border-t border-sidebar-border pt-8 text-center">
            <p className="text-muted-foreground">
              © 2025 Xed21. All rights reserved. | Empowering educators with intelligent assessment tools.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
