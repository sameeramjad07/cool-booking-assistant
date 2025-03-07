import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Mic, Bus, Calendar, MapPin, MessageSquare } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="container mx-auto py-6 px-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bus className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-xl text-blue-600">BusGo</span>
        </div>
        <nav className="hidden md:flex gap-8">
          <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors">
            How it works
          </a>
          <a href="#testimonials" className="text-gray-600 hover:text-blue-600 transition-colors">
            Testimonials
          </a>
        </nav>
        <div className="flex gap-2">
          <Link href="/chat">
            <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
              Text Chat
            </Button>
          </Link>
          <Link href="/voice">
            <Button className="bg-blue-600 hover:bg-blue-700">Voice Assistant</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-10 md:mb-0">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Book Bus Tickets with Voice Commands</h1>
          <p className="text-xl text-gray-600 mb-8">
            Our AI assistant makes booking bus tickets as easy as having a conversation. Just speak or type your travel
            plans.
          </p>
          <div className="flex gap-4">
            <Link href="/chat">
              <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 text-lg px-6 py-6">
                <MessageSquare className="mr-2 h-5 w-5" /> Text Chat
              </Button>
            </Link>
            <Link href="/voice">
              <Button className="bg-blue-600 hover:bg-blue-700 text-lg px-6 py-6">
                <Mic className="mr-2 h-5 w-5" /> Voice Assistant
              </Button>
            </Link>
          </div>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <div className="relative w-full max-w-md">
            <div className="absolute -top-6 -left-6 w-64 h-64 bg-blue-100 rounded-full filter blur-3xl opacity-70"></div>
            <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-purple-100 rounded-full filter blur-3xl opacity-70"></div>
            <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="p-6 bg-blue-600 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <Bus className="h-6 w-6" />
                  <h3 className="font-semibold">BusGo Assistant</h3>
                </div>
                <p className="text-blue-100">How can I help with your journey today?</p>
              </div>
              <div className="p-6">
                <div className="bg-blue-50 rounded-lg p-4 mb-4 text-gray-700">
                  I'd like to book a ticket from New York to Boston for tomorrow.
                </div>
                <div className="bg-gray-100 rounded-lg p-4 mb-4 text-gray-700">
                  Great! I can help you book a ticket from New York to Boston for tomorrow. What time would you prefer
                  to depart?
                </div>
                <div className="flex gap-2 mt-4">
                  <div className="flex-1 h-12 bg-gray-100 rounded-full"></div>
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <Mic className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16 text-gray-900">Why Choose Our Booking Assistant</h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Mic className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Voice Commands</h3>
              <p className="text-gray-600">
                Simply speak to our assistant to book tickets, check schedules, or get information.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Calendar className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Easy Scheduling</h3>
              <p className="text-gray-600">Find the perfect departure time with our intuitive scheduling system.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <MapPin className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Route Suggestions</h3>
              <p className="text-gray-600">Get intelligent suggestions for routes, connections, and alternatives.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Book Your Next Journey?</h2>
          <p className="text-blue-100 text-xl mb-8 max-w-2xl mx-auto">
            Experience the easiest way to book bus tickets with our voice-enabled assistant.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/chat">
              <Button variant="outline" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-6 py-6">
                <MessageSquare className="mr-2 h-5 w-5" /> Text Chat
              </Button>
            </Link>
            <Link href="/voice">
              <Button className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-6 py-6">
                <Mic className="mr-2 h-5 w-5" /> Voice Assistant
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center gap-2 mb-4">
                <Bus className="h-6 w-6 text-blue-500" />
                <span className="font-bold text-xl text-white">BusGo</span>
              </div>
              <p className="max-w-xs">Making bus travel simpler with conversational AI booking.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-white font-semibold mb-4">Company</h4>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      About Us
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Careers
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Resources</h4>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Terms of Service
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Connect</h4>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Twitter
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Facebook
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Instagram
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p>&copy; {new Date().getFullYear()} BusGo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

