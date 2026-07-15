const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema(
  {
    semesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Semester",
      required: true,
    },

    effectiveFrom: {
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
            period: {
              type: Number,
              required: true,
            },

            subject: {
              type: String,
              required: true,
            },

            faculty: {
              type: String,
              required: true,
            },
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Timetable", timetableSchema);