const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema(
    {
        semesterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Semester",
            required: true,
        },
        // Added for specific grouping
        branch: {
            type: String,
            required: true,
            trim: true,
        },
        // Added for specific grouping
        section: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
        },
        // Renamed to clarify range
        effectiveFrom: {
            type: Date,
            required: true,
        },
        // Added to define a specific weekly period
        effectiveTo: {
            type: Date,
            required: true,
        },
        schedule: [
            {
                day: {
                    type: String,
                    required: true,
                },
                // Add these fields to the 'periods' object inside the schema
                periods: [
                    {
                        period: { type: Number, required: true },
                        startTime: { type: String, required: true }, // e.g., "09:00"
                        endTime: { type: String, required: true },   // e.g., "10:00"
                        subject: { type: String, required: true },
                        faculty: { type: String, required: true },
                        roomNumber: { type: String, default: "TBA" },
                    },
                ],
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Indexing for faster queries when filtering by class
timetableSchema.index({ semesterId: 1, branch: 1, section: 1, effectiveFrom: 1 });

module.exports = mongoose.model("Timetable", timetableSchema);