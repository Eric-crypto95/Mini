import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChatMessageSchema, insertUserPreferencesSchema, insertActiveTimerSchema } from "@shared/schema";
import OpenAI from "openai";

// Initialize OpenAI only if API key is available
let openai: OpenAI | null = null;
const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
if (apiKey) {
  openai = new OpenAI({ apiKey });
}

// Offline response function for when OpenAI API is not available
function getOfflineResponse(message: string, context?: any): string {
  const msg = message.toLowerCase();
  
  if (msg.includes('weather')) {
    return "I'd love to help with weather information! I need an API key to fetch live weather data. You can still use the weather cards that will appear below.";
  }
  
  if (msg.includes('translate')) {
    return "Translation features require an API connection. I can show you the translation interface below where you can set up languages.";
  }
  
  if (msg.includes('timer') || msg.includes('pomodoro')) {
    return "Perfect! I can help with timers right away. Check out the timer interface below.";
  }
  
  if (msg.includes('customize') || msg.includes('glasses') || msg.includes('mini')) {
    return "I love getting makeovers! You can customize my appearance using the settings button in the top right corner.";
  }
  
  if (msg.includes('hello') || msg.includes('hi')) {
    return "Hello! I'm Mini, your cloud assistant. I can help with timers, weather, translations, and more. Try asking for a timer or customizing my look!";
  }
  
  return "I'm working in offline mode right now, but I can still help with timers, show weather interfaces, and you can customize my appearance! What would you like to try?";
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Mock user session - in production, implement proper authentication
  const MOCK_USER_ID = 1;

  // Weather API
  app.get("/api/weather/:location", async (req, res) => {
    try {
      const { location } = req.params;
      const apiKey = process.env.OPENWEATHERMAP_API_KEY || process.env.VITE_OPENWEATHERMAP_API_KEY;
      
      if (!apiKey) {
        // Provide helpful fallback when API key is missing
        return res.json({
          location: location.charAt(0).toUpperCase() + location.slice(1),
          country: "Demo",
          temperature: 22,
          description: "Weather data requires API key - contact support to set up live weather",
          humidity: 50,
          windSpeed: 15,
          condition: "clear",
          isDemo: true
        });
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const weatherData = await response.json();
      
      res.json({
        location: weatherData.name,
        country: weatherData.sys.country,
        temperature: Math.round(weatherData.main.temp),
        description: weatherData.weather[0].description,
        humidity: weatherData.main.humidity,
        windSpeed: Math.round(weatherData.wind.speed * 3.6), // Convert m/s to km/h
        condition: weatherData.weather[0].main.toLowerCase(),
      });
    } catch (error) {
      console.error("Weather API error:", error);
      
      // Fallback weather data on any error
      res.json({
        location: req.params.location.charAt(0).toUpperCase() + req.params.location.slice(1),
        country: "Demo",
        temperature: 20,
        description: "Weather service temporarily unavailable",
        humidity: 50,
        windSpeed: 10,
        condition: "unknown",
        isDemo: true
      });
    }
  });

  // Translation API
  app.post("/api/translate", async (req, res) => {
    try {
      const { text, targetLanguages } = req.body;
      
      if (!text || !targetLanguages) {
        return res.status(400).json({ message: "Text and target languages are required" });
      }

      if (!openai) {
        return res.status(503).json({ 
          message: "Translation service unavailable",
          error: "OpenAI API key not configured"
        });
      }

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a professional translator. Translate the given text to the requested languages. 
            Respond with JSON in this format: { "translations": [{"language": "French", "code": "fr", "flag": "🇫🇷", "text": "translated text", "pronunciation": "phonetic pronunciation"}] }`
          },
          {
            role: "user",
            content: `Translate "${text}" to: ${targetLanguages.join(", ")}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      res.json(result);

    } catch (error) {
      console.error("Translation error:", error);
      res.status(500).json({ 
        message: "Translation failed",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Text-to-speech endpoint (using OpenAI TTS)
  app.post("/api/speak", async (req, res) => {
    try {
      const { text, language } = req.body;
      
      // For now, return a placeholder - in production, implement TTS
      res.json({ 
        message: "Text-to-speech would be implemented here",
        text,
        language 
      });
    } catch (error) {
      console.error("TTS error:", error);
      res.status(500).json({ message: "Text-to-speech failed" });
    }
  });

  // Chat/Conversation AI
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, context } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      if (!openai) {
        // Provide helpful offline responses without OpenAI
        const offlineResponse = getOfflineResponse(message, context);
        await storage.addChatMessage({
          userId: MOCK_USER_ID,
          message,
          response: offlineResponse,
          messageType: context?.type || 'chat',
          metadata: context || {}
        });
        return res.json({ response: offlineResponse });
      }

      // Get user preferences for context
      const userPrefs = await storage.getUserPreferences(MOCK_USER_ID);
      const chatHistory = await storage.getChatHistory(MOCK_USER_ID, 10);

      // Build context for AI
      const contextPrompt = `You are Mini, a friendly and helpful AI companion. You are a cute cloud-shaped assistant with a warm personality.
      ${userPrefs?.name ? `The user's name is ${userPrefs.name}.` : ''}
      ${userPrefs?.conversationMemory ? `Remember: ${JSON.stringify(userPrefs.conversationMemory)}` : ''}
      Recent conversation context: ${chatHistory.slice(-3).map(m => `User: ${m.message}, Mini: ${m.response}`).join('\n')}
      
      Respond naturally and helpfully. Keep responses conversational and friendly. If asked about capabilities, mention weather, timers, translations, and customization.`;

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: contextPrompt },
          { role: "user", content: message }
        ],
        max_tokens: 300,
        temperature: 0.7
      });

      const aiResponse = response.choices[0].message.content || "I'm here to help!";

      // Save chat message
      await storage.addChatMessage({
        userId: MOCK_USER_ID,
        message,
        response: aiResponse,
        messageType: context?.type || 'chat',
        metadata: context || {}
      });

      res.json({ response: aiResponse });

    } catch (error) {
      console.error("Chat error:", error);
      
      // Fallback to offline response for any chat errors
      const fallbackResponse = getOfflineResponse(req.body.message, req.body.context);
      try {
        await storage.addChatMessage({
          userId: MOCK_USER_ID,
          message: req.body.message,
          response: fallbackResponse,
          messageType: req.body.context?.type || 'chat',
          metadata: req.body.context || {}
        });
        res.json({ response: fallbackResponse });
      } catch (storageError) {
        console.error("Storage error:", storageError);
        res.json({ response: fallbackResponse });
      }
    }
  });

  // User preferences
  app.get("/api/preferences", async (req, res) => {
    try {
      const preferences = await storage.getUserPreferences(MOCK_USER_ID);
      res.json(preferences || {
        userId: MOCK_USER_ID,
        name: null,
        favoriteLocation: null,
        preferredLanguages: [],
        miniCustomization: { accessories: [], expression: "happy", style: "fluffy" },
        themePreferences: { preferredTheme: "auto", seasonalThemes: true },
        conversationMemory: { topics: [], preferences: {} }
      });
    } catch (error) {
      console.error("Get preferences error:", error);
      res.status(500).json({ message: "Failed to get preferences" });
    }
  });

  app.post("/api/preferences", async (req, res) => {
    try {
      const validatedData = insertUserPreferencesSchema.parse({
        ...req.body,
        userId: MOCK_USER_ID
      });
      
      const preferences = await storage.upsertUserPreferences(validatedData);
      res.json(preferences);
    } catch (error) {
      console.error("Update preferences error:", error);
      res.status(500).json({ message: "Failed to update preferences" });
    }
  });

  // Timer management
  app.get("/api/timers", async (req, res) => {
    try {
      const timers = await storage.getActiveTimers(MOCK_USER_ID);
      res.json(timers);
    } catch (error) {
      console.error("Get timers error:", error);
      res.status(500).json({ message: "Failed to get timers" });
    }
  });

  app.post("/api/timers", async (req, res) => {
    try {
      const validatedData = insertActiveTimerSchema.parse({
        ...req.body,
        userId: MOCK_USER_ID
      });
      
      const timer = await storage.createTimer(validatedData);
      res.json(timer);
    } catch (error) {
      console.error("Create timer error:", error);
      res.status(500).json({ message: "Failed to create timer" });
    }
  });

  app.patch("/api/timers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const timer = await storage.updateTimer(id, req.body);
      
      if (!timer) {
        return res.status(404).json({ message: "Timer not found" });
      }
      
      res.json(timer);
    } catch (error) {
      console.error("Update timer error:", error);
      res.status(500).json({ message: "Failed to update timer" });
    }
  });

  app.delete("/api/timers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTimer(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Timer not found" });
      }
      
      res.json({ message: "Timer deleted" });
    } catch (error) {
      console.error("Delete timer error:", error);
      res.status(500).json({ message: "Failed to delete timer" });
    }
  });

  // Chat history
  app.get("/api/chat-history", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const history = await storage.getChatHistory(MOCK_USER_ID, limit);
      res.json(history);
    } catch (error) {
      console.error("Get chat history error:", error);
      res.status(500).json({ message: "Failed to get chat history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
