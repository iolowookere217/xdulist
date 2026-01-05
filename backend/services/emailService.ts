import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import { WeeklySummary } from "../types";

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private templatesPath: string;

  constructor() {
    this.templatesPath = path.join(__dirname, "../mails");
    const emailConfig = {
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_SECURE === "true",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
      tls: { rejectUnauthorized: false },
    };

    if (process.env.EMAIL_HOST && process.env.EMAIL_USER)
      this.transporter = nodemailer.createTransport(emailConfig);
    else
      console.warn(
        "⚠️  Email credentials not set. Email features will be disabled."
      );
  }

  private async renderTemplate(
    templateName: string,
    data: Record<string, any>
  ): Promise<string> {
    const templatePath = path.join(this.templatesPath, `${templateName}.ejs`);
    return ejs.renderFile(templatePath, data);
  }

  async sendVerificationEmail(
    to: string,
    name: string,
    verificationLink: string
  ): Promise<void> {
    if (!this.transporter) {
      console.log("Email not sent (transporter not configured)");
      return;
    }
    try {
      const html = await this.renderTemplate("verification-email", {
        userName: name,
        verificationLink,
      });
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || "MoneyMata <noreply@moneymata.com>",
        to,
        subject: "Verify Your Email - MoneyMata",
        html,
      });
    } catch (error) {
      console.error("Failed to send verification email:", error);
    }
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    if (!this.transporter) {
      console.log("Email not sent (transporter not configured)");
      return;
    }
    try {
      const dashboardUrl = process.env.FRONTEND_URL
        ? `${process.env.FRONTEND_URL}/home`
        : "http://localhost:3000/home";
      const html = await this.renderTemplate("welcome-email", {
        userName: name,
        dashboardUrl,
      });
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || "MoneyMata <noreply@moneymata.com>",
        to,
        subject: "Welcome to MoneyMata!",
        html,
      });
    } catch (error) {
      console.error("Failed to send welcome email:", error);
    }
  }

  async sendPasswordResetEmail(
    to: string,
    name: string,
    resetLink: string
  ): Promise<void> {
    if (!this.transporter) {
      console.log("Email not sent (transporter not configured)");
      return;
    }
    try {
      const html = await this.renderTemplate("password-reset-email", {
        userName: name,
        resetUrl: resetLink,
      });
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || "MoneyMata <noreply@moneymata.com>",
        to,
        subject: "Reset Your Password - MoneyMata",
        html,
      });
    } catch (error) {
      console.error("Failed to send password reset email:", error);
    }
  }

  async sendWeeklySummary(
    to: string,
    name: string,
    stats: WeeklySummary
  ): Promise<void> {
    if (!this.transporter) {
      console.log("Email not sent (transporter not configured)");
      return;
    }
    try {
      const dashboardUrl = process.env.FRONTEND_URL
        ? `${process.env.FRONTEND_URL}/home`
        : "http://localhost:3000/home";
      const html = await this.renderTemplate("weekly-summary-email", {
        userName: name,
        totalSpent: stats.totalSpent,
        transactionCount: stats.transactionCount,
        topCategory: stats.topCategory,
        weeklyChange: stats.weeklyChange,
        dashboardUrl,
      });
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || "MoneyMata <noreply@moneymata.com>",
        to,
        subject: "Your Weekly Spending Summary - MoneyMata",
        html,
      });
    } catch (error) {
      console.error("Failed to send weekly summary email:", error);
    }
  }
}

export default new EmailService();
