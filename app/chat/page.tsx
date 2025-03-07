"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { Mic, MicOff, Send, Bus, ArrowLeft, Calendar, MapPin, User } from "lucide-react"
import { cn } from "@/lib/utils"

// Types for our chat messages
type MessageType = {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
}

// Update the BookingStep type to match the new flow
type BookingStep = "name" | "destination" | "date" | "seat" | "phone" | "confirmation"

// Types for booking steps
// type BookingStep = "destination" | "date" | "time" | "passengers" | "payment" | "confirmation"

export default function ChatPage() {
  // Update the initial state and messages
  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: "1",
      content: "Hi there! I'm your BusGo assistant. To get started with your booking, may I know your name?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  // const [currentStep, setCurrentStep] = useState<BookingStep>("destination")
  const [currentStep, setCurrentStep] = useState<BookingStep>("name")
  // const [bookingDetails, setBookingDetails] = useState({
  //   from: "",
  //   to: "",
  //   date: "",
  //   time: "",
  //   passengers: 1,
  // })
  const [bookingDetails, setBookingDetails] = useState({
    name: "",
    from: "",
    to: "",
    date: "",
    seatPreference: "",
    phone: "",
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Simulate bot typing and response
  // const simulateBotResponse = (userMessage: string) => {
  const simulateBotResponse = (userMessage: string) => {
    setIsTyping(true)

    // Determine response based on current step
    let botResponse = ""
    let nextStep: BookingStep = currentStep

    setTimeout(() => {
      switch (currentStep) {
        case "name":
          // Extract name from user message
          const nameMatch = userMessage.match(/(?:(?:my|the|this|is)\s+name\s+is\s+)?([A-Za-z]+(?:\s+[A-Za-z]+)?)/i)
          if (nameMatch) {
            const name = nameMatch[1].trim()
            setBookingDetails((prev) => ({ ...prev, name }))
            botResponse = `Nice to meet you, ${name}! Where would you like to travel from and to?`
            nextStep = "destination"
          } else {
            botResponse = "I didn't quite catch your name. Could you please tell me your name?"
          }
          break

        case "destination":
          // Extract potential destinations from user message
          if (userMessage.toLowerCase().includes("from") && userMessage.toLowerCase().includes("to")) {
            const fromMatch = userMessage.match(/from\s+([a-zA-Z\s]+)\s+to/i)
            const toMatch = userMessage.match(/to\s+([a-zA-Z\s]+)/i)

            if (fromMatch && toMatch) {
              const from = fromMatch[1].trim()
              const to = toMatch[1].trim()

              setBookingDetails((prev) => ({ ...prev, from, to }))
              botResponse = `Great! I've got you traveling from ${from} to ${to}. When would you like to travel?`
              nextStep = "date"
            } else {
              botResponse = "I didn't quite catch that. Could you specify your departure and destination cities?"
            }
          } else {
            botResponse =
              "Could you please tell me your departure city and destination? For example: 'I want to travel from New York to Boston'"
          }
          break

        case "date":
          // Look for date information
          if (userMessage.toLowerCase().includes("tomorrow")) {
            const tomorrow = new Date()
            tomorrow.setDate(tomorrow.getDate() + 1)
            const dateStr = tomorrow.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })

            setBookingDetails((prev) => ({ ...prev, date: dateStr }))
            botResponse = `Got it! You're traveling on ${dateStr}. Do you have any seat preferences? (Window, Aisle, or No preference)`
            nextStep = "seat"
          } else if (userMessage.toLowerCase().includes("today")) {
            const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })

            setBookingDetails((prev) => ({ ...prev, date: today }))
            botResponse = `Got it! You're traveling today (${today}). Do you have any seat preferences? (Window, Aisle, or No preference)`
            nextStep = "seat"
          } else {
            // Try to extract a date
            const dateMatch = userMessage.match(/(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?/)
            if (dateMatch) {
              const month = Number.parseInt(dateMatch[1])
              const day = Number.parseInt(dateMatch[2])
              const year = dateMatch[3] ? Number.parseInt(dateMatch[3]) : new Date().getFullYear()

              const dateObj = new Date(year, month - 1, day)
              const dateStr = dateObj.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })

              setBookingDetails((prev) => ({ ...prev, date: dateStr }))
              botResponse = `Got it! You're traveling on ${dateStr}. Do you have any seat preferences? (Window, Aisle, or No preference)`
              nextStep = "seat"
            } else {
              botResponse =
                "I need to know when you'd like to travel. You can say something like 'tomorrow', 'next Friday', or a specific date."
            }
          }
          break

        case "seat":
          // Look for seat preference
          if (userMessage.toLowerCase().includes("window")) {
            setBookingDetails((prev) => ({ ...prev, seatPreference: "Window" }))
            botResponse =
              "Perfect! I've noted your preference for a window seat. Could you please provide your phone number for booking confirmation?"
            nextStep = "phone"
          } else if (userMessage.toLowerCase().includes("aisle")) {
            setBookingDetails((prev) => ({ ...prev, seatPreference: "Aisle" }))
            botResponse =
              "Perfect! I've noted your preference for an aisle seat. Could you please provide your phone number for booking confirmation?"
            nextStep = "phone"
          } else if (
            userMessage.toLowerCase().includes("no preference") ||
            userMessage.toLowerCase().includes("any") ||
            userMessage.toLowerCase().includes("doesn't matter")
          ) {
            setBookingDetails((prev) => ({ ...prev, seatPreference: "No Preference" }))
            botResponse =
              "Got it! I've noted that you don't have a specific seat preference. Could you please provide your phone number for booking confirmation?"
            nextStep = "phone"
          } else {
            botResponse = "Do you prefer a window seat, an aisle seat, or do you have no preference?"
          }
          break

        case "phone":
          // Look for phone number
          const phoneMatch = userMessage.match(
            /(\d{3}[-.\s]??\d{3}[-.\s]??\d{4}|$$\d{3}$$\s*\d{3}[-.\s]??\d{4}|\d{10})/g,
          )
          if (phoneMatch) {
            const phone = phoneMatch[0].replace(/[^\d]/g, "")
            setBookingDetails((prev) => ({ ...prev, phone }))

            botResponse = `Thank you, ${bookingDetails.name}! I've found several options for ${bookingDetails.from} to ${bookingDetails.to} on ${bookingDetails.date} with a ${bookingDetails.seatPreference.toLowerCase()} seat:

1. Departure: 8:00 AM - Arrival: 10:30 AM - $45
2. Departure: 11:30 AM - Arrival: 2:00 PM - $38
3. Departure: 3:00 PM - Arrival: 5:30 PM - $42

Which option would you prefer?`
            nextStep = "confirmation"
          } else {
            botResponse =
              "I need your phone number to complete the booking. Please provide a valid 10-digit phone number."
          }
          break

        case "confirmation":
          // Look for option selection
          if (userMessage.match(/option\s*1|first\s*option|8:00|8\s*am/i)) {
            botResponse = `Perfect! Your booking is confirmed. Here's your trip summary:

Name: ${bookingDetails.name}
From: ${bookingDetails.from}
To: ${bookingDetails.to}
Date: ${bookingDetails.date}
Departure: 8:00 AM
Seat Preference: ${bookingDetails.seatPreference}
Phone: ${bookingDetails.phone}

Your e-ticket has been sent to your phone. Thank you for booking with BusGo!`

            // Reset for a new booking
            nextStep = "name"
          } else if (userMessage.match(/option\s*2|second\s*option|11:30|11:30\s*am/i)) {
            botResponse = `Perfect! Your booking is confirmed. Here's your trip summary:

Name: ${bookingDetails.name}
From: ${bookingDetails.to}
To: ${bookingDetails.to}
Date: ${bookingDetails.date}
Departure: 11:30 AM
Seat Preference: ${bookingDetails.seatPreference}
Phone: ${bookingDetails.phone}

Your e-ticket has been sent to your phone. Thank you for booking with BusGo!`

            // Reset for a new booking
            nextStep = "name"
          } else if (userMessage.match(/option\s*3|third\s*option|3:00|3\s*pm/i)) {
            botResponse = `Perfect! Your booking is confirmed. Here's your trip summary:

Name: ${bookingDetails.name}
From: ${bookingDetails.from}
To: ${bookingDetails.to}
Date: ${bookingDetails.date}
Departure: 3:00 PM
Seat Preference: ${bookingDetails.seatPreference}
Phone: ${bookingDetails.phone}

Your e-ticket has been sent to your phone. Thank you for booking with BusGo!`

            // Reset for a new booking
            nextStep = "name"
          } else {
            botResponse =
              "Please select one of the available options (1, 2, or 3), or let me know if you'd like to see more options."
          }
          break
      }

      setCurrentStep(nextStep)

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: botResponse,
          sender: "bot",
          timestamp: new Date(),
        },
      ])

      setIsTyping(false)
      speakBotResponse(botResponse)
    }, 1500)
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!inputValue.trim()) return

    // Add user message
    const newMessage: MessageType = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, newMessage])
    setInputValue("")

    // Simulate bot response
    simulateBotResponse(inputValue)
  }

  // Toggle voice input
  // const toggleListening = () => {
  const toggleListening = () => {
    if (!isListening) {
      setIsListening(true)
      // In a real app, we would initialize the Web Speech API here
      // For this demo, we'll just simulate listening
      setTimeout(() => {
        setIsListening(false)
        // Simulate a voice message
        const voiceMessages = [
          "My name is John Smith",
          "I want to travel from New York to Boston",
          "I want to travel next Friday",
          "I prefer a window seat",
          "My phone number is 555-123-4567",
          "I'll take the first option",
        ]

        // Pick a message based on the current step
        let stepIndex = 0
        switch (currentStep) {
          case "name":
            stepIndex = 0
            break
          case "destination":
            stepIndex = 1
            break
          case "date":
            stepIndex = 2
            break
          case "seat":
            stepIndex = 3
            break
          case "phone":
            stepIndex = 4
            break
          case "confirmation":
            stepIndex = 5
            break
        }

        setInputValue(voiceMessages[stepIndex])
      }, 2000)
    } else {
      setIsListening(false)
    }
  }

  // Add this function to simulate speech recognition with visual feedback
  // Add this right after the toggleListening function
  const startSpeechRecognition = () => {
    // In a real app, this would use the Web Speech API
    // For this demo, we're simulating the experience
    // This would be the actual implementation in a production app:
    /*
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        setInputValue(transcript);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
        if (inputValue) {
          handleSubmit(new Event('submit') as any);
        }
      };
      
      recognition.start();
    } else {
      alert('Speech recognition is not supported in your browser.');
    }
    */
  }

  // Add this function to simulate speech synthesis for bot responses
  // Add this right after the startSpeechRecognition function
  const speakBotResponse = (text: string) => {
    // In a real app, this would use the Web Speech API
    // For this demo, we're just simulating the experience
    // This would be the actual implementation in a production app:
    /*
    const synth = window.speechSynthesis;
    if (synth) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1;
      utterance.pitch = 1;
      synth.speak(utterance);
    }
    */
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Bus className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-lg">BusGo Assistant</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Help
            </Button>
            <Avatar className="h-8 w-8 bg-blue-100">
              <User className="h-4 w-4 text-blue-600" />
            </Avatar>
          </div>
        </div>
      </header>

      {/* Booking Progress */}
      <div className="bg-white border-b border-gray-200 py-3 px-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <div
              className={cn("flex flex-col items-center", currentStep === "name" ? "text-blue-600" : "text-gray-400")}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center mb-1",
                  currentStep === "name" ? "bg-blue-600 text-white" : "bg-gray-200",
                )}
              >
                <User className="h-4 w-4" />
              </div>
              <span className="text-xs">Name</span>
            </div>
            <div
              className={cn(
                "flex-1 h-1 mx-1",
                currentStep === "destination" || currentStep === "date" ? "bg-blue-600" : "bg-gray-200",
              )}
            ></div>
            <div
              className={cn(
                "flex flex-col items-center",
                currentStep === "destination" || currentStep === "date" ? "text-blue-600" : "text-gray-400",
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center mb-1",
                  currentStep === "destination" || currentStep === "date" ? "bg-blue-600 text-white" : "bg-gray-200",
                )}
              >
                <MapPin className="h-4 w-4" />
              </div>
              <span className="text-xs">Destination</span>
            </div>
            <div className={cn("flex-1 h-1 mx-1", currentStep === "date" ? "bg-blue-600" : "bg-gray-200")}></div>
            <div
              className={cn("flex flex-col items-center", currentStep === "date" ? "text-blue-600" : "text-gray-400")}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center mb-1",
                  currentStep === "date" ? "bg-blue-600 text-white" : "bg-gray-200",
                )}
              >
                <Calendar className="h-4 w-4" />
              </div>
              <span className="text-xs">Date</span>
            </div>
            <div className={cn("flex-1 h-1 mx-1", currentStep === "seat" ? "bg-blue-600" : "bg-gray-200")}></div>
            <div
              className={cn("flex flex-col items-center", currentStep === "seat" ? "text-blue-600" : "text-gray-400")}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center mb-1",
                  currentStep === "seat" ? "bg-blue-600 text-white" : "bg-gray-200",
                )}
              >
                <div className="text-xs font-bold">S</div>
              </div>
              <span className="text-xs">Seat</span>
            </div>
            <div
              className={cn(
                "flex-1 h-1 mx-1",
                currentStep === "phone" || currentStep === "confirmation" ? "bg-blue-600" : "bg-gray-200",
              )}
            ></div>
            <div
              className={cn(
                "flex flex-col items-center",
                currentStep === "phone" || currentStep === "confirmation" ? "text-blue-600" : "text-gray-400",
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center mb-1",
                  currentStep === "phone" || currentStep === "confirmation" ? "bg-blue-600 text-white" : "bg-gray-200",
                )}
              >
                <div className="text-xs font-bold">📱</div>
              </div>
              <span className="text-xs">Phone</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="container mx-auto max-w-3xl">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={cn("flex", message.sender === "user" ? "justify-end" : "justify-start")}>
                <div className="flex items-start max-w-[80%]">
                  {message.sender === "bot" && (
                    <div className="mr-2 mt-1">
                      <Avatar className="h-8 w-8 bg-blue-100">
                        <Bus className="h-4 w-4 text-blue-600" />
                      </Avatar>
                    </div>
                  )}
                  <Card className={cn("p-3", message.sender === "user" ? "bg-blue-600 text-white" : "bg-white")}>
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className={cn("text-xs mt-1", message.sender === "user" ? "text-blue-100" : "text-gray-400")}>
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </Card>
                  {message.sender === "user" && (
                    <div className="ml-2 mt-1">
                      <Avatar className="h-8 w-8 bg-blue-100">
                        <User className="h-4 w-4 text-blue-600" />
                      </Avatar>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start max-w-[80%]">
                  <div className="mr-2 mt-1">
                    <Avatar className="h-8 w-8 bg-blue-100">
                      <Bus className="h-4 w-4 text-blue-600" />
                    </Avatar>
                  </div>
                  <Card className="p-3 bg-white">
                    <div className="flex space-x-1">
                      <div
                        className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area with Enhanced Microphone */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="container mx-auto max-w-3xl">
          {/* Central Microphone */}
          <div className="flex flex-col items-center mb-4">
            <button
              onClick={toggleListening}
              className={cn(
                "relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300",
                isListening
                  ? "bg-red-500 shadow-lg shadow-red-200"
                  : "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200",
              )}
            >
              {isListening ? (
                <>
                  <MicOff className="h-8 w-8 text-white" />
                  {/* Audio wave animation */}
                  <div className="absolute -inset-4 flex items-center justify-center">
                    <div className="absolute w-24 h-24 rounded-full border-4 border-red-400 opacity-75 animate-ping"></div>
                    <div
                      className="absolute w-28 h-28 rounded-full border-4 border-red-300 opacity-50 animate-ping"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                    <div
                      className="absolute w-32 h-32 rounded-full border-4 border-red-200 opacity-30 animate-ping"
                      style={{ animationDelay: "600ms" }}
                    ></div>
                  </div>
                </>
              ) : (
                <Mic className="h-8 w-8 text-white" />
              )}
            </button>
            <p className="mt-2 text-sm text-gray-500">{isListening ? "Listening... Tap to stop" : "Tap to speak"}</p>
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={isListening ? "Listening..." : "Or type your message..."}
                disabled={isListening}
                className="pr-10"
              />
              {inputValue && (
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </div>

            {!inputValue && !isListening && (
              <Button type="button" className="bg-blue-600 hover:bg-blue-700">
                Quick Options
              </Button>
            )}
          </form>

          {!inputValue && !isListening && (
            <div className="flex flex-wrap gap-2 mt-3">
              {currentStep === "name" && (
                <Button variant="outline" size="sm" onClick={() => setInputValue("My name is John Smith")}>
                  My name is John Smith
                </Button>
              )}
              {currentStep === "destination" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInputValue("I want to travel from New York to Boston")}
                >
                  New York to Boston
                </Button>
              )}
              {currentStep === "date" && (
                <>
                  <Button variant="outline" size="sm" onClick={() => setInputValue("I want to travel tomorrow")}>
                    Tomorrow
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setInputValue("Next Friday")}>
                    Next Friday
                  </Button>
                </>
              )}
              {currentStep === "seat" && (
                <>
                  <Button variant="outline" size="sm" onClick={() => setInputValue("Window seat")}>
                    Window seat
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setInputValue("Aisle seat")}>
                    Aisle seat
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setInputValue("No preference")}>
                    No preference
                  </Button>
                </>
              )}
              {currentStep === "phone" && (
                <Button variant="outline" size="sm" onClick={() => setInputValue("555-123-4567")}>
                  555-123-4567
                </Button>
              )}
              {currentStep === "confirmation" && (
                <>
                  <Button variant="outline" size="sm" onClick={() => setInputValue("Option 1")}>
                    Option 1
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setInputValue("Option 2")}>
                    Option 2
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setInputValue("Option 3")}>
                    Option 3
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

