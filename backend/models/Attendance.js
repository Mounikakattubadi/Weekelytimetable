const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true },
    attendanceDate: { type: Date, required: true },
    timetableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Timetable",
      required: true,
    },
    // ADD THIS FIELD
    semesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Semester",
      required: true,
    },
    subject: { type: String, required: true },
    status: { type: String, enum: ["Present", "Absent"], required: true },
    branch: { type: String }, // Add these if you are saving them directly
    section: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);