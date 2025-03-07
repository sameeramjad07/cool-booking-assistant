// // Extend Window interface for SpeechRecognition
// interface SpeechRecognition {
//     lang: string;
//     interimResults: boolean;
//     maxAlternatives: number;
//     start(): void;
//     stop(): void;
//     onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
//     onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
//     onend: (() => any) | null;
//   }
  
//   interface SpeechRecognitionConstructor {
//     new (): SpeechRecognition;
//   }
  
//   declare global {
//     interface Window {
//       SpeechRecognition?: SpeechRecognitionConstructor;
//       webkitSpeechRecognition?: SpeechRecognitionConstructor;
//     }
//   }
  
//   // Speech-to-Text using Web Speech API
//   export function speechToText(): Promise<string> {
//     return new Promise((resolve, reject) => {
//       if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
//         console.error('Speech recognition not supported in this browser.');
//         return reject(new Error('Speech recognition is not supported in this browser.'));
//       }
  
//       const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//       const recognition = new SpeechRecognition();
  
//       recognition.lang = 'en-US';
//       recognition.interimResults = false;
//       recognition.maxAlternatives = 1;
  
//       console.log('Speak now...');
  
//       recognition.onresult = (event: SpeechRecognitionEvent) => {
//         const text = event.results[0][0].transcript;
//         console.log(`Recognized text: ${text}`);
//         resolve(text);
//       };
  
//       recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
//         console.error(`Speech recognition error: ${event.error}`);
//         reject(new Error(`Speech recognition error: ${event.error}`));
//       };
  
//       recognition.onend = () => {
//         console.log('Speech recognition ended.');
//       };
  
//       recognition.start();
  
//       setTimeout(() => {
//         recognition.stop();
//         reject(new Error('Speech recognition timed out.'));
//       }, 10000);
//     });
//   }
  
  // Text-to-Speech using Web Speech API
  export function textToSpeech(text: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        return reject(new Error('Text-to-speech not supported in this browser.'));
      }
  
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.volume = 1.0;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
  
      utterance.onend = () => resolve(true);
      utterance.onerror = (event) => reject(new Error(`Text-to-speech error: ${event.error}`));
  
      window.speechSynthesis.cancel(); // Clear any pending speech
      window.speechSynthesis.speak(utterance);
    });
  }