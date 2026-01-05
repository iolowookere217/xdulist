"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generative_ai_1 = require("@google/generative-ai");
const errors_1 = require("../utils/errors");
class GeminiAIService {
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.warn("⚠️  GEMINI_API_KEY not set. AI features will be disabled.");
        }
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey || "dummy-key");
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    }
    /**
     * Extract receipt data from image using OCR
     */
    async extractReceiptData(imageBuffer) {
        try {
            const imagePart = {
                inlineData: {
                    data: imageBuffer.toString("base64"),
                    mimeType: "image/jpeg",
                },
            };
            const prompt = `Analyze this receipt image and extract the following information in JSON format:
      {
        "vendorName": "name of the merchant/vendor",
        "totalAmount": total amount as a number,
        "date": "transaction date in YYYY-MM-DD format",
        "items": [{"name": "item name", "price": price as number}],
        "category": "best matching category from: groceries, transport, dining, entertainment, utilities, healthcare, shopping, travel, education, subscriptions, other",
        "currency": "currency code (NGN, USD, or GBP)"
      }

      Return ONLY the JSON object, no additional text.`;
            const result = await this.model.generateContent([prompt, imagePart]);
            const response = await result.response;
            const text = response.text();
            // Clean and parse JSON
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error("Could not extract JSON from AI response");
            }
            const data = JSON.parse(jsonMatch[0]);
            return data;
        }
        catch (error) {
            console.error("Gemini OCR error:", error);
            throw new errors_1.InternalServerError("Failed to process receipt");
        }
    }
    /**
     * Categorize expense from description
     */
    async categorizeExpense(description) {
        try {
            const prompt = `Based on this expense description: "${description}"

      Choose the best matching category from this list:
      groceries, transport, dining, entertainment, utilities, healthcare, shopping, travel, education, subscriptions, other

      Return ONLY the category name, nothing else.`;
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const category = response.text().trim().toLowerCase();
            const validCategories = [
                "groceries",
                "transport",
                "dining",
                "entertainment",
                "utilities",
                "healthcare",
                "shopping",
                "travel",
                "education",
                "subscriptions",
                "other",
            ];
            return validCategories.includes(category) ? category : "other";
        }
        catch (error) {
            console.error("Gemini categorization error:", error);
            return "other";
        }
    }
    /**
     * Generate AI insights from spending data (Premium feature)
     */
    async generateInsights(expenses) {
        try {
            const expenseSummary = expenses.map((e) => ({
                amount: e.amount,
                category: e.category,
                description: e.description,
                date: e.date,
            }));
            const prompt = `Analyze these recent expenses and provide 3 insights:

${JSON.stringify(expenseSummary, null, 2)}

Generate insights in this exact JSON format:
[
  {
    "type": "pattern",
    "title": "Spending Pattern",
    "description": "Brief description of a spending pattern you noticed"
  },
  {
    "type": "recommendation",
    "title": "Recommendation",
    "description": "Brief actionable recommendation to improve spending"
  },
  {
    "type": "alert",
    "title": "Alert",
    "description": "Brief alert about unusual or noteworthy spending"
  }
]

Be specific, concise, and helpful. Return ONLY the JSON array.`;
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            // Clean and parse JSON
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                throw new Error("Could not extract JSON from AI response");
            }
            const insights = JSON.parse(jsonMatch[0]);
            return insights.slice(0, 3); // Ensure only 3 insights
        }
        catch (error) {
            console.error("Gemini insights error:", error);
            // Return default insights if AI fails
            return [
                {
                    type: "pattern",
                    title: "Spending Pattern",
                    description: "Your spending shows consistent activity. Add more expenses for detailed insights.",
                },
                {
                    type: "recommendation",
                    title: "Track More",
                    description: "Track more expenses to get personalized recommendations.",
                },
                {
                    type: "alert",
                    title: "No Alerts",
                    description: "No unusual spending detected yet.",
                },
            ];
        }
    }
    /**
     * Parse voice transcript to expense data
     */
    async parseVoiceTranscript(transcript) {
        try {
            const prompt = `Parse this spoken expense description: "${transcript}"

Extract the following in JSON format:
{
  "description": "what was purchased (string)",
  "amount": amount spent (number, extract only the number),
  "category": "best matching category from: groceries, transport, dining, entertainment, utilities, healthcare, shopping, travel, education, subscriptions, other"
}

Examples:
"I spent fifty dollars on groceries" -> {"description": "groceries", "amount": 50, "category": "groceries"}
"Paid 20 pounds for taxi" -> {"description": "taxi", "amount": 20, "category": "transport"}
"Bought lunch for 15" -> {"description": "lunch", "amount": 15, "category": "dining"}

Return ONLY the JSON object, no additional text.`;
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            // Clean and parse JSON
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error("Could not extract JSON from AI response");
            }
            const data = JSON.parse(jsonMatch[0]);
            return data;
        }
        catch (error) {
            console.error("Gemini voice parsing error:", error);
            // Return partial data
            return {
                description: transcript,
                amount: undefined,
                category: undefined,
            };
        }
    }
    /**
     * Parse voice transcript to todo data (description + time + reminder)
     */
    async parseTodoVoiceTranscript(transcript) {
        try {
            const prompt = `Parse this spoken todo description: "${transcript}"

Extract the following in JSON format:
{
  "description": "the activity/task description (string)",
  "startTime": "the time in 24-hour HH:MM format (string), or null if no time mentioned",
  "reminderTime": "the reminder time in 24-hour HH:MM format (string), or null if no reminder mentioned"
}

IMPORTANT INSTRUCTIONS FOR RELATIVE REMINDER TIMES:
- If the user says "remind me X minutes/mins before", "X mins before", "X minutes earlier", etc., you MUST calculate the actual reminder time by subtracting that duration from the start time.
- If the user says "remind me 10 mins before" and start time is 11:00, then reminderTime should be "10:50"
- If the user says "remind me 30 minutes before" and start time is 14:30, then reminderTime should be "14:00"
- If the user says "remind me 1 hour before" and start time is 18:00, then reminderTime should be "17:00"

Examples:
"go to church by 10am" -> {"description": "go to church", "startTime": "10:00", "reminderTime": null}
"go to church by 11am remind me 10 mins before" -> {"description": "go to church", "startTime": "11:00", "reminderTime": "10:50"}
"meeting at 2:30pm, remind me 15 minutes before" -> {"description": "meeting", "startTime": "14:30", "reminderTime": "14:15"}
"meeting at 2:30pm, remind me at 2pm" -> {"description": "meeting", "startTime": "14:30", "reminderTime": "14:00"}
"call mom at five, remind me at 4:30" -> {"description": "call mom", "startTime": "17:00", "reminderTime": "16:30"}
"buy groceries" -> {"description": "buy groceries", "startTime": null, "reminderTime": null}
"doctor appointment at 9:15 in the morning, remind me 30 mins before" -> {"description": "doctor appointment", "startTime": "09:15", "reminderTime": "08:45"}
"gym at 6pm remind me 1 hour before" -> {"description": "gym", "startTime": "18:00", "reminderTime": "17:00"}
"lunch at 1pm, remind me 20 minutes earlier" -> {"description": "lunch", "startTime": "13:00", "reminderTime": "12:40"}

CALCULATION RULES:
- Always convert times to 24-hour format (HH:MM)
- When calculating relative times, subtract minutes/hours from start time
- Handle time wraparound (e.g., "meeting at 00:30, remind me 1 hour before" -> reminderTime: "23:30" previous day, but just return "23:30")
- Look for keywords: "remind me", "reminder", "alert me", "notify me", "before", "earlier", "mins", "minutes", "hour", "hours"

Return ONLY the JSON object, no additional text.`;
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            // Clean and parse JSON
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error("Could not extract JSON from AI response");
            }
            const data = JSON.parse(jsonMatch[0]);
            return {
                description: data.description || transcript,
                startTime: data.startTime || undefined,
                reminderTime: data.reminderTime || undefined,
            };
        }
        catch (error) {
            console.error("Gemini todo voice parsing error:", error);
            // Return partial data
            return {
                description: transcript,
                startTime: undefined,
                reminderTime: undefined,
            };
        }
    }
}
exports.default = new GeminiAIService();
//# sourceMappingURL=GeminiAIService.js.map