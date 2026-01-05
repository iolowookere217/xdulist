declare class ReminderService {
    private isRunning;
    /**
     * Start the reminder scheduler
     * Checks every minute for todos that need reminders
     */
    start(): void;
    /**
     * Check for todos that need reminders
     */
    private checkReminders;
    /**
     * Send reminder for a todo
     */
    private sendReminder;
    /**
     * Stop the reminder scheduler
     */
    stop(): void;
}
declare const _default: ReminderService;
export default _default;
//# sourceMappingURL=ReminderService.d.ts.map