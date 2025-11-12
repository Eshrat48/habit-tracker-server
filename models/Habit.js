// models/Habit.js

const mongoose = require('mongoose');

// Define valid categories based on requirements [cite: 82, 157]
const categories = ['Morning', 'Work', 'Fitness', 'Evening', 'Study'];

const HabitSchema = new mongoose.Schema({
    // Habit Details (User Input) [cite: 79, 80, 81, 83]
    title: {
        type: String,
        required: [true, 'Habit title is required.'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters.'],
    },
    description: {
        type: String,
        required: [true, 'Description is required.'],
        maxlength: [500, 'Description cannot be more than 500 characters.'],
    },
    category: {
        type: String,
        required: [true, 'Category is required.'],
        enum: categories, // Enforce one of the allowed categories
    },
    reminderTime: {
        type: String, // Stored as a string (e.g., "18:00")
        required: [true, 'Reminder time is required.'],
    },
    image: {
        type: String, // URL of the uploaded image (optional) [cite: 84]
    },

    // User/Creator Information (Read-only) [cite: 85, 86]
    userName: {
        type: String,
        required: true,
    },
    userEmail: {
        type: String,
        required: true,
        unique: false,
    },
    
    // Tracking and Public Status
    isPublic: {
        type: Boolean,
        default: true, // Defaulting to public, as most habits will be public for "Browse Public Habits" [cite: 107]
    },
    completionHistory: {
        // Array to store timestamps when the habit was completed (for streak calculation) [cite: 118, 147]
        type: [Date],
        default: [],
    },
    
}, {
    // Automatically adds createdAt and updatedAt fields
    // 'createdAt' is crucial for sorting the 6 newest public habits [cite: 44]
    timestamps: true,
});

module.exports = mongoose.model('Habit', HabitSchema);