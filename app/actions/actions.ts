'use server'; // Mark this file as server-only

import { GoogleGenerativeAI } from '@google/generative-ai';
import dataManager from '../../lib/dataManager';

// Configure Gemini API
const API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDl-nEytKjUk8hyHcoQPvlOrbsKDmt9JUk';
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Types for conversation history
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Process conversation with Gemini
export async function processConversation(history: Message[], message: string): Promise<{
  response: string;
  bookingReady: boolean;
  updatedHistory: Message[];
}> {
  const systemPrompt = `
    You are a helpful bus ticket reservation assistant. Your goal is to help customers book bus tickets.
    You need to collect:
    1. Customer's name
    2. Phone number
    3. Destination
    4. Travel date
    5. Seat preference (window/aisle/any number)
    Be friendly and conversational. Say 'BOOKING_READY' when all info is collected.
  `;

  const messages = [systemPrompt, ...history.map((entry) => entry.content), message];

  try {
    const response = await model.generateContent(messages);
    const responseText = response.response.text();
    const updatedHistory = [...history, { role: 'assistant', content: responseText } as Message];
    const bookingReady = responseText.includes('BOOKING_READY');
    return {
      response: responseText.replace('BOOKING_READY', ''),
      bookingReady,
      updatedHistory,
    };
  } catch (e) {
    console.error(`Gemini API error: ${e}`);
    const errorResponse = 'Sorry, I had trouble understanding that. Could you try again?';
    const updatedHistory = [...history, { role: 'assistant', content: errorResponse } as Message];
    return { response: errorResponse, bookingReady: false, updatedHistory };
  }
}

// Handle booking logic
export async function handleBooking(history: Message[]): Promise<string> {
  const info = await dataManager.extractInfo(history);

  const destination = info.destination || '';
  const routes = dataManager.getRouteByDestination(destination);
  if (!routes.length) {
    return `No routes found for ${destination}`;
  }

  const route = routes[0];
  const travelDate = info.travel_date || '';
  const seats = dataManager.getAvailableSeats(route.id, travelDate);
  if (!seats.length) {
    return 'No seats available.';
  }

  const seatPref = info.seat_preference || '';
  let seatNumber = seats[0];
  if (seatPref.toLowerCase().includes('window')) {
    const windowSeats = seats.filter((s) => s % 4 === 0 || s % 4 === 1);
    seatNumber = windowSeats[0] || seats[0];
  } else if (seatPref.toLowerCase().includes('aisle')) {
    const aisleSeats = seats.filter((s) => s % 4 === 2 || s % 4 === 3);
    seatNumber = aisleSeats[0] || seats[0];
  }

  const [reservationId, reservation] = await dataManager.createReservation(
    info.name || 'Unknown',
    info.phone || 'Unknown',
    route.id,
    travelDate,
    seatNumber
  );

  const confirmation = `
Booking Confirmed!
- Passenger: ${reservation.name}
- From: ${route.origin}
- To: ${route.destination}
- Date: ${travelDate}
- Departure: ${route.departure_time}
- Seat: ${seatNumber}
- Price: $${route.price}
- Reservation ID: ${reservationId}
  `.trim();

  return confirmation;
}