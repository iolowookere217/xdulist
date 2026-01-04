import cron from 'node-cron';
import { Todo } from '../models/Todo';

class ReminderService {
  private isRunning = false;

  /**
   * Start the reminder scheduler
   * Checks every minute for todos that need reminders
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️  Reminder service is already running');
      return;
    }

    // Run every minute
    cron.schedule('* * * * *', async () => {
      await this.checkReminders();
    });

    this.isRunning = true;
    console.log('✅ Reminder service started');
  }

  /**
   * Check for todos that need reminders
   */
  private async checkReminders() {
    try {
      const now = new Date();

      // Find todos where:
      // 1. Reminder date is in the past or now
      // 2. Reminder has not been sent yet
      // 3. Todo is not completed
      const todosNeedingReminders = await Todo.find({
        reminderDate: { $lte: now },
        reminderSent: false,
        isCompleted: false
      }).populate('userId', 'email fullName');

      if (todosNeedingReminders.length === 0) {
        return;
      }

      console.log(`📬 Found ${todosNeedingReminders.length} todos needing reminders`);

      // Process each todo
      for (const todo of todosNeedingReminders) {
        await this.sendReminder(todo);
      }
    } catch (error) {
      console.error('Error checking reminders:', error);
    }
  }

  /**
   * Send reminder for a todo
   */
  private async sendReminder(todo: any) {
    try {
      console.log(`📬 Sending reminder for: "${todo.description}" to user ${todo.userId.email}`);

      // TODO: Implement actual notification sending
      // Options:
      // 1. Send email notification
      // 2. Send push notification (if mobile app exists)
      // 3. Send in-app notification (store in database)

      // For now, just log and mark as sent
      // You can integrate with email service here:
      // await emailService.sendTodoReminder(
      //   todo.userId.email,
      //   todo.userId.fullName,
      //   todo.description,
      //   todo.startTime
      // );

      // Mark reminder as sent
      todo.reminderSent = true;
      await todo.save();

      console.log(`✅ Reminder sent for: "${todo.description}"`);
    } catch (error) {
      console.error(`Failed to send reminder for todo ${todo._id}:`, error);
    }
  }

  /**
   * Stop the reminder scheduler
   */
  stop() {
    this.isRunning = false;
    console.log('🛑 Reminder service stopped');
  }
}

export default new ReminderService();
