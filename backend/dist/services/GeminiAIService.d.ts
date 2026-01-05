import { ReceiptData, Insight, ParsedExpense } from "../types";
import { IExpense } from "../models/Expense";
declare class GeminiAIService {
    private genAI;
    private model;
    constructor();
    /**
     * Extract receipt data from image using OCR
     */
    extractReceiptData(imageBuffer: Buffer): Promise<ReceiptData>;
    /**
     * Categorize expense from description
     */
    categorizeExpense(description: string): Promise<string>;
    /**
     * Generate AI insights from spending data (Premium feature)
     */
    generateInsights(expenses: IExpense[]): Promise<Insight[]>;
    /**
     * Parse voice transcript to expense data
     */
    parseVoiceTranscript(transcript: string): Promise<ParsedExpense>;
    /**
     * Parse voice transcript to todo data (description + time + reminder)
     */
    parseTodoVoiceTranscript(transcript: string): Promise<{
        description: string;
        startTime?: string;
        reminderTime?: string;
    }>;
}
declare const _default: GeminiAIService;
export default _default;
//# sourceMappingURL=GeminiAIService.d.ts.map