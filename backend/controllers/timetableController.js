const Timetable = require("../models/Timetable");

// Create Timetable
const createTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.create(req.body);

    res.status(201).json({
      success: true,
      data: timetable,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Timetables
const getTimetables = async (req, res) => {
  try {
    const timetables = await Timetable.find().populate("semesterId");

    res.status(200).json({
      success: true,
      count: timetables.length,
      data: timetables,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createTimetable,
  getTimetables,
};