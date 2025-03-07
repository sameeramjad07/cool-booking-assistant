// Speech-to-Text using Web Speech API
export function speechToText() {
    return new Promise((resolve, reject) => {
      // Check if the browser supports the Web Speech API
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.error('Speech recognition not supported in this browser.');
        return reject('Speech recognition is not supported in this browser.');
      }
  
      // Use the appropriate constructor based on browser support
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
  
      recognition.lang = 'en-US'; // Set language
      recognition.interimResults = false; // Only return final results
      recognition.maxAlternatives = 1; // Return one result
  
      console.log('Speak now...');
  
      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        console.log(`Recognized text: ${text}`);
        resolve(text);
      };
  
      recognition.onerror = (event) => {
        console.error(`Error in speech recognition: ${event.error}`);
        reject(`Error: ${event.error}`);
      };
  
      recognition.onend = () => {
        console.log('Speech recognition ended.');
      };
  
      // Start recognition
      recognition.start();
  
      // Optional: Stop after a timeout if no result (e.g., 10 seconds)
      setTimeout(() => {
        recognition.stop();
        reject('Speech recognition timed out.');
      }, 10000);
    });
  }
  
  // Text-to-Speech using Web Speech API
  export function textToSpeech(text) {
    return new Promise((resolve, reject) => {
      // Check if the browser supports the Web Speech API
      if (!('speechSynthesis' in window)) {
        console.error('Text-to-speech not supported in this browser.');
        return reject('Text-to-speech is not supported in this browser.');
      }
  
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US'; // Set language
      utterance.volume = 1.0; // Volume (0.0 to 1.0)
      utterance.rate = 1.0; // Speed (0.1 to 10)
      utterance.pitch = 1.0; // Pitch (0 to 2)
  
      utterance.onend = () => {
        console.log('Text-to-speech completed.');
        resolve(true);
      };
  
      utterance.onerror = (event) => {
        console.error(`Error in text-to-speech: ${event.error}`);
        reject(`Error: ${event.error}`);
      };
  
      // Speak the text
      window.speechSynthesis.speak(utterance);
    });
  }