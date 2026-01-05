"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const ejs_1 = __importDefault(require("ejs"));
const path_1 = __importDefault(require("path"));
class EmailService {
    constructor() {
        this.transporter = null;
        // Set the path to email templates
        this.templatesPath = path_1.default.join(__dirname, '../mails');
        // Configure email transporter
        const emailConfig = {
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT || '587'),
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            },
            // Add timeout and connection settings
            connectionTimeout: 10000, // 10 seconds
            greetingTimeout: 10000, // 10 seconds
            socketTimeout: 10000, // 10 seconds
            // Ignore TLS errors for development
            tls: {
                rejectUnauthorized: false
            }
        };
        if (process.env.EMAIL_HOST && process.env.EMAIL_USER) {
            this.transporter = nodemailer_1.default.createTransport(emailConfig);
        }
        else {
            console.warn('⚠️  Email credentials not set. Email features will be disabled.');
        }
    }
    /**
     * Render an EJS email template
     */
    async renderTemplate(templateName, data) {
        const templatePath = path_1.default.join(this.templatesPath, `${templateName}.ejs`);
        return ejs_1.default.renderFile(templatePath, data);
    }
    /**
     * Send email verification email
     */
    async sendVerificationEmail(to, name, verificationLink) {
        if (!this.transporter) {
            console.log('Email not sent (transporter not configured)');
            return;
        }
        try {
            const html = await this.renderTemplate('verification-email', {
                userName: name,
                verificationLink
            });
            await this.transporter.sendMail({
                from: process.env.EMAIL_FROM || 'MoneyMata <noreply@moneymata.com>',
                to,
                subject: 'Verify Your Email - MoneyMata',
                html
            });
        }
        catch (error) {
            console.error('Failed to send verification email:', error);
        }
    }
    /**
     * Send welcome email to new user
     */
    async sendWelcomeEmail(to, name) {
        if (!this.transporter) {
            console.log('Email not sent (transporter not configured)');
            return;
        }
        try {
            const dashboardUrl = process.env.FRONTEND_URL
                ? `${process.env.FRONTEND_URL}/home`
                : 'http://localhost:3000/home';
            const html = await this.renderTemplate('welcome-email', {
                userName: name,
                dashboardUrl
            });
            await this.transporter.sendMail({
                from: process.env.EMAIL_FROM || 'MoneyMata <noreply@moneymata.com>',
                to,
                subject: 'Welcome to MoneyMata!',
                html
            });
        }
        catch (error) {
            console.error('Failed to send welcome email:', error);
        }
    }
    /**
     * Send password reset email
     */
    async sendPasswordResetEmail(to, name, resetLink) {
        if (!this.transporter) {
            console.log('Email not sent (transporter not configured)');
            return;
        }
        try {
            const html = await this.renderTemplate('password-reset-email', {
                userName: name,
                resetUrl: resetLink
            });
            await this.transporter.sendMail({
                from: process.env.EMAIL_FROM || 'MoneyMata <noreply@moneymata.com>',
                to,
                subject: 'Reset Your Password - MoneyMata',
                html
            });
        }
        catch (error) {
            console.error('Failed to send password reset email:', error);
        }
    }
    /**
     * Send weekly summary email (Premium feature)
     */
    async sendWeeklySummary(to, name, stats) {
        if (!this.transporter) {
            console.log('Email not sent (transporter not configured)');
            return;
        }
        try {
            const dashboardUrl = process.env.FRONTEND_URL
                ? `${process.env.FRONTEND_URL}/home`
                : 'http://localhost:3000/home';
            const html = await this.renderTemplate('weekly-summary-email', {
                userName: name,
                totalSpent: stats.totalSpent,
                transactionCount: stats.transactionCount,
                topCategory: stats.topCategory,
                weeklyChange: stats.weeklyChange,
                dashboardUrl
            });
            await this.transporter.sendMail({
                from: process.env.EMAIL_FROM || 'MoneyMata <noreply@moneymata.com>',
                to,
                subject: 'Your Weekly Spending Summary - MoneyMata',
                html
            });
        }
        catch (error) {
            console.error('Failed to send weekly summary email:', error);
        }
    }
}
exports.default = new EmailService();
//# sourceMappingURL=emailService.js.map