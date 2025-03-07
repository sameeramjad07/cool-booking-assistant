import { v4 as uuidv4 } from 'uuid';
import { GoogleGenerativeAI } from '@google/generative-ai';
import busRoutesData from './bus_routes.json'; // Import static data

// Configure logging
const logger = {
  info: (...args: any[]) => console.log(new Date().toISOString(), 'INFO', ...args),
  error: (...args: any[]) => console.error(new Date().toISOString(), 'ERROR', ...args),
};

// Initialize Gemini API
const API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDl-nEytKjUk8hyHcoQPvlOrbsKDmt9JUk';
if (!API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in environment variables');
}
const genAI = new GoogleGenerativeAI(API_KEY);
const extractionModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

interface BusRoute {
  id: string;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  price: number;
}

interface Reservation {
  id: string;
  name: string;
  phone: string;
  route_id: string;
  travel_date: string;
  seat_number: number;
  created_at: string;
}

interface ExtractedInfo {
  name: string | null;
  phone: string | null;
  destination: string | null;
  travel_date: string | null;
  seat_preference: string | null;
}

class DataManager {
  private busRoutes: BusRoute[];
  private reservations: Reservation[];

  constructor() {
    this.busRoutes = busRoutesData; // Use imported data
    this.reservations = []; // In-memory storage
  }

  getAvailableSeats(routeId: string, travelDate: string): number[] {
    const route = this.busRoutes.find((r) => r.id === routeId);
    if (!route) return [];
    const bookedSeats = this.reservations
      .filter((r) => r.route_id === routeId && r.travel_date === travelDate)
      .map((r) => r.seat_number);
    return Array.from({ length: 40 }, (_, i) => i + 1).filter((seat) => !bookedSeats.includes(seat));
  }

  getRouteByDestination(destination: string): BusRoute[] {
    return this.busRoutes.filter((route) =>
      route.destination.toLowerCase().includes(destination.toLowerCase())
    );
  }

  async createReservation(
    name: string,
    phone: string,
    routeId: string,
    travelDate: string,
    seatNumber: number
  ): Promise<[string, Reservation]> {
    const reservationId = uuidv4();
    const reservation: Reservation = {
      id: reservationId,
      name,
      phone,
      route_id: routeId,
      travel_date: travelDate,
      seat_number: seatNumber,
      created_at: new Date().toISOString(),
    };
    this.reservations.push(reservation);
    // No saveReservations() call since it's in-memory
    return [reservationId, reservation];
  }

  async extractInfo(conversationHistory: { role: string; content: string }[]): Promise<ExtractedInfo> {
    const conversationText = conversationHistory
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join('\n');
    logger.info(`Conversation sent to Gemini: ${conversationText}`);

    const extractionPrompt = `
      You are an expert information extractor. Given the following conversation between a user and an assistant, extract the booking details into a JSON object with these fields:
      - name (customer's full name)
      - phone (phone number)
      - destination (travel destination)
      - travel_date (date of travel)
      - seat_preference (window, aisle, or specific number)

      Return only the JSON object. If any field is missing or unclear, use null for that field. Do not include any extra text outside the JSON.

      Conversation:
      ${conversationText}
    `;

    try {
      const result = await extractionModel.generateContent(extractionPrompt);
      let jsonStr = result.response.text();
      logger.info(`Gemini raw response: '${jsonStr}'`);
    
      jsonStr = jsonStr.trim()
        .replace(/^```json/, '')
        .replace(/^json/, '')
        .replace(/```$/, '')
        .trim();
    
      const info = JSON.parse(jsonStr) as ExtractedInfo;
      logger.info(`Parsed JSON: ${JSON.stringify(info)}`);
      return info;
    } catch (e) {
      logger.error(`Gemini extraction error: ${e}`);
      return {
        name: null,
        phone: null,
        destination: null,
        travel_date: null,
        seat_preference: null,
      };
    }
  }
}

const dataManager = new DataManager();
export default dataManager;