import { promises as fs } from 'fs';
const { join } = require('path');
const { v4: uuidv4 } = require('uuid');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Configure logging (basic console logging; replace with winston if needed)
const logger = {
  info: (...args) => console.log(new Date().toISOString(), 'INFO', ...args),
  error: (...args) => console.error(new Date().toISOString(), 'ERROR', ...args),
};

// Initialize Gemini API
const API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDl-nEytKjUk8hyHcoQPvlOrbsKDmt9JUk'; // Use env var in production
const genAI = new GoogleGenerativeAI(API_KEY);
const extractionModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); // Adjust model name if needed

class DataManager {
  constructor() {
    this.dataDir = join(process.cwd(), 'data');
    this.ensureDataDir();
    this.busRoutes = this.loadData('bus_routes.json', this.initializeBusRoutes.bind(this));
    this.reservations = this.loadData('reservations.json', () => []);
  }

  async ensureDataDir() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (e) {
      logger.error(`Failed to create data directory: ${e}`);
    }
  }

  async loadData(filename, initializer) {
    const filepath = join(this.dataDir, filename);
    try {
      await fs.access(filepath);
      const data = await fs.readFile(filepath, 'utf8');
      return JSON.parse(data);
    } catch (e) {
      const initialData = initializer();
      await fs.writeFile(filepath, JSON.stringify(initialData, null, 2), 'utf8');
      return initialData;
    }
  }

  initializeBusRoutes() {
    return [
      { id: 'route1', origin: 'New York', destination: 'Boston', departure_time: '08:00', arrival_time: '12:00', price: 45.00 },
      { id: 'route2', origin: 'Boston', destination: 'Washington DC', departure_time: '10:00', arrival_time: '15:30', price: 55.00 },
      { id: 'route3', origin: 'New York', destination: 'Washington DC', departure_time: '09:00', arrival_time: '13:30', price: 50.00 },
    ];
  }

  async saveReservations() {
    const filepath = join(this.dataDir, 'reservations.json');
    await fs.writeFile(filepath, JSON.stringify(this.reservations, null, 2), 'utf8');
  }

  getAvailableSeats(routeId, travelDate) {
    const route = this.busRoutes.find((r) => r.id === routeId);
    if (!route) return [];
    const bookedSeats = this.reservations
      .filter((r) => r.route_id === routeId && r.travel_date === travelDate)
      .map((r) => r.seat_number);
    return Array.from({ length: 40 }, (_, i) => i + 1).filter((seat) => !bookedSeats.includes(seat));
  }

  getRouteByDestination(destination) {
    return this.busRoutes.filter((route) =>
      route.destination.toLowerCase().includes(destination.toLowerCase())
    );
  }

  async createReservation(name, phone, routeId, travelDate, seatNumber) {
    const reservationId = uuidv4();
    const reservation = {
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

  async extractInfo(conversationHistory) {
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

      // Remove Markdown formatting if present
      if (jsonStr.startsWith('```json')) jsonStr = jsonStr.slice(7);
      if (jsonStr.endsWith('```')) jsonStr = jsonStr.slice(0, -3);

      const info = JSON.parse(jsonStr.trim());
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

// Export a singleton instance
const dataManager = new DataManager();
module.exports = dataManager;

// Alternatively, export the class if you want to instantiate it elsewhere
// module.exports = { DataManager };