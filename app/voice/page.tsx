"use client";

import { useState, useRef, useEffect } from "react";
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Volume2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { textToSpeech } from '../../lib/speechUtils';
import { processConversation, handleBooking } from '../actions/actions';

// Define the Message type
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function VoicePage() {
  const [history, setHistory] = useState<Message[]>([]);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFirstInteraction, setIsFirstInteraction] = useState(true);
  const [isResponding, setIsResponding] = useState(false);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const responseCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const responseAnimationRef = useRef<number>(0);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [responseWaveformData, setResponseWaveformData] = useState<number[]>([]);

  // Initial message
  useEffect(() => {
    const initialMessage = "Welcome to our Bus Reservation system! I'm here to help you book a ticket. May I know your name and where you'd like to travel to?";
    setHistory([{ role: 'assistant', content: initialMessage }]);
  }, []);

  // Generate waveform data for listening
  useEffect(() => {
    if (listening) {
      const interval = setInterval(() => {
        const newData = Array(50).fill(0).map(() => Math.random() * 0.8 + 0.2);
        setWaveformData(newData);
      }, 100);
      return () => clearInterval(interval);
    } else {
      setWaveformData([]);
    }
  }, [listening]);

  // Generate waveform data for responding
  useEffect(() => {
    if (isResponding) {
      const interval = setInterval(() => {
        const newData = Array(50).fill(0).map(() => Math.random() * 0.8 + 0.2);
        setResponseWaveformData(newData);
      }, 100);
      return () => clearInterval(interval);
    } else {
      setResponseWaveformData([]);
    }
  }, [isResponding]);

  // Draw listening waveform
  useEffect(() => {
    if (!canvasRef.current || waveformData.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const drawWaveform = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const barWidth = width / waveformData.length;
      ctx.fillStyle = '#3b82f6';
      
      waveformData.forEach((value, index) => {
        const barHeight = value * height;
        const x = index * barWidth;
        const y = (height - barHeight) / 2;
        ctx.fillRect(x, y, barWidth - 1, barHeight);
      });
      
      animationRef.current = requestAnimationFrame(drawWaveform);
    };
    
    drawWaveform();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [waveformData]);

  // Draw response waveform
  useEffect(() => {
    if (!responseCanvasRef.current || responseWaveformData.length === 0) return;
    
    const canvas = responseCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const drawWaveform = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const barWidth = width / responseWaveformData.length;
      ctx.fillStyle = '#10b981';
      
      responseWaveformData.forEach((value, index) => {
        const barHeight = value * height;
        const x = index * barWidth;
        const y = (height - barHeight) / 2;
        ctx.fillRect(x, y, barWidth - 1, barHeight);
      });
      
      responseAnimationRef.current = requestAnimationFrame(drawWaveform);
    };
    
    drawWaveform();
    return () => {
      if (responseAnimationRef.current) cancelAnimationFrame(responseAnimationRef.current);
    };
  }, [responseWaveformData]);

  const startListening = async () => {
    if (!browserSupportsSpeechRecognition) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }
    if (bookingComplete || isResponding) return;

    setError(null);

    if (isFirstInteraction) {
      const initialMessage = history[0].content;
      try {
        await textToSpeech(initialMessage);
        setIsFirstInteraction(false);
      } catch (e) {
        console.error(`Initial TTS error: ${e}`);
        setError(`Speech error: ${e instanceof Error ? e.message : 'Unknown error'}`);
      }
    }

    SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
  };

  const stopListening = async () => {
    SpeechRecognition.stopListening();

    const userInput = transcript.trim();
    if (userInput && !bookingComplete) {
      const updatedHistory: Message[] = [...history, { role: 'user', content: userInput }];
      setHistory(updatedHistory);
      resetTranscript();

      setIsResponding(true);
      try {
        const { response, bookingReady, updatedHistory: newHistory } = await processConversation(updatedHistory, userInput);
        setHistory(newHistory);
        await textToSpeech(response);

        if (bookingReady) {
          const confirmation = await handleBooking(newHistory);
          setHistory((prev) => [...prev, { role: 'assistant', content: confirmation } as Message]);
          await textToSpeech(confirmation);
          setBookingComplete(true);
        }
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Sorry, something went wrong. Please try again.';
        console.error(`Processing error: ${errorMessage}`);
        setHistory((prev) => [...prev, { role: 'assistant', content: errorMessage } as Message]);
        await textToSpeech(errorMessage).catch((err: Error) => setError(err.message));
        setError(errorMessage);
      } finally {
        setIsResponding(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col">
      {/* Header */}
      <header className="p-4 border-b border-gray-700">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/chat" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Chat</span>
          </Link>
          <h1 className="text-xl font-bold">Bus Reservation Voice Assistant</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="max-w-3xl w-full mx-auto flex flex-col items-center">
          {/* Microphone */}
          <div className="mb-16 relative">
            <button
              onClick={listening ? stopListening : startListening}
              disabled={isResponding || bookingComplete}
              className={cn(
                "relative w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500",
                listening
                  ? "bg-blue-600 scale-110"
                  : isResponding || bookingComplete
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-gray-800 hover:bg-gray-700"
              )}
            >
              <div
                className={cn(
                  "absolute w-32 h-32 rounded-full transition-all duration-500",
                  listening ? "bg-blue-500" : isResponding || bookingComplete ? "bg-gray-700" : "bg-gray-700"
                )}
              ></div>
              <div
                className={cn(
                  "absolute w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500",
                  listening ? "bg-blue-400" : isResponding || bookingComplete ? "bg-gray-800" : "bg-gray-800"
                )}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={cn(
                    "w-12 h-12 transition-all duration-500",
                    listening ? "text-white animate-pulse" : isResponding || bookingComplete ? "text-gray-400" : "text-white"
                  )}
                >
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" x2="12" y1="19" y2="22"></line>
                </svg>
              </div>
              {listening && (
                <>
                  <div className="absolute inset-0 rounded-full bg-blue-500 opacity-20 animate-ping"></div>
                  <div className="absolute -inset-4 rounded-full bg-blue-500 opacity-10 animate-pulse"></div>
                  <div className="absolute -inset-8 rounded-full bg-blue-500 opacity-5 animate-pulse" style={{ animationDelay: '300ms' }}></div>
                </>
              )}
            </button>
            <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-center w-full">
              <p className={cn(
                "text-lg font-medium transition-all duration-300",
                listening ? "text-blue-400" : isResponding ? "text-green-400" : "text-gray-400"
              )}>
                {listening ? "Listening..." : isResponding ? "Responding..." : "Tap to speak"}
              </p>
            </div>
          </div>

          {/* Transcript and Response */}
          <div className="w-full space-y-8 mt-8">
            {/* User speech visualization */}
            {listening && (
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-white">You</h3>
                    <p className="text-sm text-gray-400">Speaking...</p>
                  </div>
                </div>
                <p className="text-lg text-white mb-4">{transcript || "Start speaking..."}</p>
                <canvas ref={canvasRef} width="700" height="60" className="w-full h-[60px] rounded-lg"></canvas>
              </div>
            )}

            {/* Assistant response visualization */}
            {isResponding && (
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">BusGo Assistant</h3>
                    <p className="text-sm text-gray-400">Speaking...</p>
                  </div>
                </div>
                <p className="text-lg text-white mb-4">{history[history.length - 1].content}</p>
                <canvas ref={responseCanvasRef} width="700" height="60" className="w-full h-[60px] rounded-lg"></canvas>
              </div>
            )}

            {/* Previous conversation */}
            {!listening && !isResponding && history.length > 1 && (
              <div className="space-y-6">
                {history.map((msg, index) => (
                  <div key={index} className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg opacity-90">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        msg.role === 'user' ? "bg-blue-600" : "bg-green-600"
                      )}>
                        {msg.role === 'user' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                        ) : (
                          <Volume2 className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{msg.role === 'user' ? 'You' : 'BusGo Assistant'}</h3>
                      </div>
                    </div>
                    <p className="text-lg text-white">{msg.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Hint text */}
            {!listening && !isResponding && history.length === 1 && (
              <div className="text-center mt-8 max-w-md">
                <p className="text-gray-400 mb-6">
                  Click the microphone to start speaking. I'll listen to your request and help you book your bus ticket.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <p className="text-sm text-gray-300 font-medium mb-2">Try saying:</p>
                    <p className="text-gray-400 text-sm">"I need a ticket from New York to Boston"</p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <p className="text-sm text-gray-300 font-medium mb-2">Or try:</p>
                    <p className="text-gray-400 text-sm">"What buses are available tomorrow?"</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          {error && <p className="text-red-400 mt-4">{error}</p>}
          {bookingComplete && <p className="text-green-400 mt-4">Booking Complete!</p>}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 border-t border-gray-700">
        <div className="container mx-auto flex justify-between items-center">
          <p className="text-gray-400 text-sm">BusGo Voice Assistant</p>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
            onClick={() => {
              setHistory([{ role: 'assistant', content: history[0].content }]);
              setBookingComplete(false);
              setError(null);
              setIsFirstInteraction(true);
            }}
            disabled={listening || isResponding}
          >
            Clear Conversation
          </Button>
        </div>
      </footer>
    </div>
  );
}