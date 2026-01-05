import { GoogleGenerativeAI } from "@google/generative-ai";
import { ReceiptData, Insight, ParsedExpense } from "../types";
import { IExpense } from "../models/Expense";
import { InternalServerError } from "../utils/errors";

class GeminiAIService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey)
      console.warn("⚠️  GEMINI_API_KEY not set. AI features will be disabled.");
    this.genAI = new GoogleGenerativeAI(apiKey || "dummy-key");
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  }

  async extractReceiptData(imageBuffer: Buffer): Promise<ReceiptData> {
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
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch)
        throw new Error("Could not extract JSON from AI response");
      const data = JSON.parse(jsonMatch[0]);
      return data;
    } catch (error) {
      console.error("Gemini OCR error:", error);
      throw new InternalServerError("Failed to process receipt");
    }
  }

  async categorizeExpense(description: string): Promise<string> {
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
    } catch (error) {
      console.error("Gemini categorization error:", error);
      return "other";
    }
  }

  async generateInsights(expenses: IExpense[]): Promise<Insight[]> {
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
[ { "type": "pattern", "title": "Spending Pattern", "description": "Brief description of a spending pattern you noticed" }, { "type": "recommendation", "title": "Recommendation", "description": "Brief actionable recommendation to improve spending" }, { "type": "alert", "title": "Alert", "description": "Brief alert about unusual or noteworthy spending" } ]

Be specific, concise, and helpful. Return ONLY the JSON array.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch)
        throw new Error("Could not extract JSON from AI response");
      const insights = JSON.parse(jsonMatch[0]);
      return insights.slice(0, 3);
    } catch (error) {
      console.error("Gemini insights error:", error);
      return [
        {
          type: "pattern",
          title: "Spending Pattern",
          description:
            "Your spending shows consistent activity. Add more expenses for detailed insights.",
        },
        {
          type: "recommendation",
          title: "Track More",
          description:
            "Track more expenses to get personalized recommendations.",
        },
        {
          type: "alert",
          title: "No Alerts",
          description: "No unusual spending detected yet.",
        },
      ];
    }
  }

  async parseVoiceTranscript(transcript: string): Promise<ParsedExpense> {
    try {
      const prompt = `Parse this spoken expense description: "${transcript}"

Extract the following in JSON format:
{
  "description": "what was purchased (string)",
  "amount": amount spent (number, extract only the number),
  "category": "best matching category from: groceries, transport, dining, entertainment, utilities, healthcare, shopping, travel, education, subscriptions, other"
}

Return ONLY the JSON object, no additional text.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch)
        throw new Error("Could not extract JSON from AI response");
      const data = JSON.parse(jsonMatch[0]);
      return data;
    } catch (error) {
      console.error("Gemini voice parsing error:", error);
      return {
        description: transcript,
        amount: undefined,
        category: undefined,
      };
    }
  }

  async parseTodoVoiceTranscript(
    transcript: string
  ): Promise<{
    description: string;
    startTime?: string;
    reminderTime?: string;
  }> {
    try {
      const prompt = `Parse this spoken todo description: "${transcript}"

Extract the following in JSON format:
{
  "description": "the activity/task description (string)",
  "startTime": "the time in 24-hour HH:MM format (string), or null if no time mentioned",
  "reminderTime": "the reminder time in 24-hour HH:MM format (string), or null if no reminder mentioned"
}

IMPORTANT INSTRUCTIONS FOR RELATIVE REMINDER TIMES: ... Return ONLY the JSON object, no additional text.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch)
        throw new Error("Could not extract JSON from AI response");
      const data = JSON.parse(jsonMatch[0]);
      return {
        description: data.description || transcript,
        startTime: data.startTime || undefined,
        reminderTime: data.reminderTime || undefined,
      };
    } catch (error) {
      console.error("Gemini todo voice parsing error:", error);
      return {
        description: transcript,
        startTime: undefined,
        reminderTime: undefined,
      };
    }
  }
}

export default new GeminiAIService();
