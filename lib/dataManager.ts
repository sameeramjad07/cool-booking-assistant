import { promises as fs } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Configure logging
const logger = {
  info: (...args: any[]) => console.log(new Date().toISOString(), 'INFO', ...args),
  error: (...args: any[]) => console.error(new Date().toISOString(), 'ERROR', ...args),
};

// Initialize Gemini API
const API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDl-nEytKjUk8hyHcoQPvlOrbsKDmt9JUk';
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
  private dataDir: string;
  private busRoutes: BusRoute[];
  private reservations: Reservation[];

  constructor() {
    this.dataDir = join(process.cwd(), 'data');
    // Initialize with default values synchronously
    this.busRoutes = this.initializeBusRoutes();
    this.reservations = [];
    // Load data asynchronously
    this.initializeData();
  }

  private async initializeData(): Promise<void> {
    await this.ensureDataDir();
    this.busRoutes = await this.loadData('bus_routes.json', this.initializeBusRoutes.bind(this));
    this.reservations = await this.loadData('reservations.json', () => []);
  }

  private async ensureDataDir(): Promise<void> {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (e) {
      logger.error(`Failed to create data directory: ${e}`);
    }
  }

  private async loadData<T>(filename: string, initializer: () => T): Promise<T> {
    const filepath = join(this.dataDir, filename);
    try {
      await fs.access(filepath);
      const data = await fs.readFile(filepath, 'utf8');
      return JSON.parse(data) as T;
    } catch (e) {
      const initialData = initializer();
      await fs.writeFile(filepath, JSON.stringify(initialData, null, 2), 'utf8');
      return initialData;
    }
  }

  private initializeBusRoutes(): BusRoute[] {
    return [
      { id: 'route1', origin: 'New York', destination: 'Boston', departure_time: '08:00', arrival_time: '12:00', price: 45.00 },
      { id: 'route2', origin: 'Boston', destination: 'Washington DC', departure_time: '10:00', arrival_time: '15:30', price: 55.00 },
      { id: 'route3', origin: 'New York', destination: 'Washington DC', departure_time: '09:00', arrival_time: '13:30', price: 50.00 },
    ];
  }

  async saveReservations(): Promise<void> {
    const filepath = join(this.dataDir, 'reservations.json');
    await fs.writeFile(filepath, JSON.stringify(this.reservations, null, 2), 'utf8');
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
    await this.saveReservations();
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
    
      // Attempt to extract valid JSON from the response
      jsonStr = jsonStr.trim(); // Remove leading/trailing whitespace
    
      // Remove potential non-JSON parts
      jsonStr = jsonStr.replace(/^```json/, '').replace(/^json/, '').replace(/```$/, '').trim();
    
      // Parse JSON
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