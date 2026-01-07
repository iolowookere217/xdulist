import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import sgMail from "@sendgrid/mail";
import { WeeklySummary } from "../types";

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private sendGridEnabled = false;
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
    // Verify transporter immediately and disable it if verification fails to
    // avoid connection timeouts bubbling up during request handling.
    if (this.transporter) {
      this.transporter
        .verify()
        .then(() => console.log("✅ Email transporter verified"))
        .catch((err) => {
          console.error(
            "⚠️  Email transporter verification failed, disabling email sending:",
            err
          );
          this.transporter = null;
        });
    else
    // Setup SendGrid if API key present
    if (process.env.SENDGRID_API_KEY) {
      try {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        this.sendGridEnabled = true;
        console.log("✅ SendGrid API configured");
      } catch (err) {
        console.error("⚠️  Failed to configure SendGrid:", err);
        this.sendGridEnabled = false;
      }
    }
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
    const html = await this.renderTemplate("verification-email", {
      userName: name,
      verificationLink,
    });
    await this.sendMail({ to, subject: "Verify Your Email - MoneyMata", html });
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const dashboardUrl = process.env.FRONTEND_URL
      ? `${process.env.FRONTEND_URL}/home`
      : "http://localhost:3000/home";
    const html = await this.renderTemplate("welcome-email", {
      userName: name,
      dashboardUrl,
    });
    await this.sendMail({ to, subject: "Welcome to MoneyMata!", html });
  }

  async sendPasswordResetEmail(
    to: string,
    name: string,
    resetLink: string
  ): Promise<void> {
    const html = await this.renderTemplate("password-reset-email", {
      userName: name,
      resetUrl: resetLink,
    });
    await this.sendMail({ to, subject: "Reset Your Password - MoneyMata", html });
  }

  async sendWeeklySummary(
    to: string,
    name: string,
    stats: WeeklySummary
  ): Promise<void> {
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
    await this.sendMail({
      to,
      subject: "Your Weekly Spending Summary - MoneyMata",
      html,
    });
  }

  private async sendMail(opts: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    const from = process.env.EMAIL_FROM || "MoneyMata <noreply@moneymata.com>";
    if (this.sendGridEnabled) {
      try {
        await sgMail.send({
          to: opts.to,
          from,
          subject: opts.subject,
          html: opts.html,
        } as any);
        return;
      } catch (err) {
        console.error("Failed to send email via SendGrid:", err);
        // fallthrough to SMTP if available
      }
    }

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from,
          to: opts.to,
          subject: opts.subject,
          html: opts.html,
        });
        return;
      } catch (err) {
        console.error("Failed to send email via SMTP transporter:", err);
        return;
      }
    }

    console.log("Email not sent (no provider configured)");
  }
}

export default new EmailService();
