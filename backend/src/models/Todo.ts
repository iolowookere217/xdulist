import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITodo extends Document {
  userId: Types.ObjectId;
  description: string;
  startTime: string; // HH:mm format - when the task starts
  reminderTime?: string; // HH:mm format - when to send reminder (optional)
  isCompleted: boolean;
  reminderSent: boolean;
  reminderDate?: Date; // Calculated date/time for reminder
  createdAt: Date;
  updatedAt: Date;
}

const todoSchema = new Schema<ITodo>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [1, 'Description cannot be empty'],
      maxlength: [500, 'Description must not exceed 500 characters']
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      match: [
        /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/,
        'Start time must be in HH:mm format (24-hour)'
      ]
    },
    reminderTime: {
      type: String,
      match: [
        /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/,
        'Reminder time must be in HH:mm format (24-hour)'
      ]
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    reminderSent: {
      type: Boolean,
      default: false
    },
    reminderDate: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Calculate reminder date before saving
todoSchema.pre('save', function (next) {
  if (this.isModified('startTime') || this.isModified('reminderTime') || this.isNew) {
    const now = new Date();

    // Use reminderTime if provided, otherwise calculate 30 minutes before startTime
    let timeToUse: string;
    if (this.reminderTime) {
      timeToUse = this.reminderTime;
    } else {
      // Calculate 30 minutes before startTime
      const [hours, minutes] = this.startTime.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes - 30;
      const reminderHours = Math.floor(totalMinutes / 60);
      const reminderMinutes = totalMinutes % 60;
      timeToUse = `${String(reminderHours).padStart(2, '0')}:${String(reminderMinutes).padStart(2, '0')}`;
    }

    const [hours, minutes] = timeToUse.split(':').map(Number);

    // Create date for today with the specified time
    const reminderDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes,
      0
    );

    // If the time has passed today, set for tomorrow
    if (reminderDate < now) {
      reminderDate.setDate(reminderDate.getDate() + 1);
    }

    this.reminderDate = reminderDate;
  }
  next();
});

// Indexes
todoSchema.index({ userId: 1, isCompleted: 1 });
todoSchema.index({ reminderDate: 1 });
todoSchema.index({ userId: 1, startTime: 1 });

export const Todo = mongoose.model<ITodo>('Todo', todoSchema);
