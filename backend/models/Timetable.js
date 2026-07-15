const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema(
    {
        semesterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Semester",
            required: true,
        },
        branch: {
            type: String,
            required: true,
            trim: true,
        },
        section: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
        },
        effectiveFrom: {
            type: Date,
            required: true,
        },
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
                periods: [
                    {
                        period: { type: Number, required: true },
                        // Added date field here
                        date: { type: Date, required: true }, 
                        startTime: { type: String, required: true }, 
                        endTime: { type: String, required: true }, 
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

// Updated index to include the date field if you plan to search by it
timetableSchema.index({ semesterId: 1, branch: 1, section: 1, effectiveFrom: 1 });

module.exports = mongoose.model("Timetable", timetableSchema);