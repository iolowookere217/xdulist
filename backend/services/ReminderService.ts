import cron from "node-cron";
import { Todo } from "../models/Todo";

class ReminderService {
  private isRunning = false;

  start() {
    if (this.isRunning) {
      console.log("⚠️  Reminder service is already running");
      return;
    }
    cron.schedule("* * * * *", async () => {
      await this.checkReminders();
    });
    this.isRunning = true;
    console.log("✅ Reminder service started");
  }

  private async checkReminders() {
    try {
      const now = new Date();
      const todosNeedingReminders = await Todo.find({
        reminderDate: { $lte: now },
        reminderSent: false,
        isCompleted: false,
      }).populate("userId", "email fullName");
      if (todosNeedingReminders.length === 0) return;
      console.log(
        `📬 Found ${todosNeedingReminders.length} todos needing reminders`
      );
      for (const todo of todosNeedingReminders) {
        await this.sendReminder(todo);
      }
    } catch (error) {
      console.error("Error checking reminders:", error);
    }
  }

  private async sendReminder(todo: any) {
    try {
      console.log(
        `📬 Sending reminder for: "${todo.description}" to user ${todo.userId.email}`
      );
      todo.reminderSent = true;
      await todo.save();
      console.log(`✅ Reminder sent for: "${todo.description}"`);
    } catch (error) {
      console.error(`Failed to send reminder for todo ${todo._id}:`, error);
    }
  }

  stop() {
    this.isRunning = false;
    console.log("🛑 Reminder service stopped");
  }
}

export default new ReminderService();
