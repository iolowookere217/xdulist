"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Todo = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const todoSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true
});
// Calculate reminder date before saving
todoSchema.pre('save', function (next) {
    if (this.isModified('startTime') || this.isModified('reminderTime') || this.isNew) {
        const now = new Date();
        // Use reminderTime if provided, otherwise calculate 30 minutes before startTime
        let timeToUse;
        if (this.reminderTime) {
            timeToUse = this.reminderTime;
        }
        else {
            // Calculate 30 minutes before startTime
            const [hours, minutes] = this.startTime.split(':').map(Number);
            const totalMinutes = hours * 60 + minutes - 30;
            const reminderHours = Math.floor(totalMinutes / 60);
            const reminderMinutes = totalMinutes % 60;
            timeToUse = `${String(reminderHours).padStart(2, '0')}:${String(reminderMinutes).padStart(2, '0')}`;
        }
        const [hours, minutes] = timeToUse.split(':').map(Number);
        // Create date for today with the specified time
        const reminderDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
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
exports.Todo = mongoose_1.default.model('Todo', todoSchema);
//# sourceMappingURL=Todo.js.map