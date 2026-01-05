import { WeeklySummary } from '../types';
declare class EmailService {
    private transporter;
    private templatesPath;
    constructor();
    /**
     * Render an EJS email template
     */
    private renderTemplate;
    /**
     * Send email verification email
     */
    sendVerificationEmail(to: string, name: string, verificationLink: string): Promise<void>;
    /**
     * Send welcome email to new user
     */
    sendWelcomeEmail(to: string, name: string): Promise<void>;
    /**
     * Send password reset email
     */
    sendPasswordResetEmail(to: string, name: string, resetLink: string): Promise<void>;
    /**
     * Send weekly summary email (Premium feature)
     */
    sendWeeklySummary(to: string, name: string, stats: WeeklySummary): Promise<void>;
}
declare const _default: EmailService;
export default _default;
//# sourceMappingURL=emailService.d.ts.map