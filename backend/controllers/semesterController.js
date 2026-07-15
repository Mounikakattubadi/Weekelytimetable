const Semester = require("../models/Semester");

// Create Semester
const createSemester = async (req, res) => {
  try {
    const semester = await Semester.create(req.body);

    res.status(201).json({
      success: true,
      data: semester,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Semesters
const getSemesters = async (req, res) => {
  try {
    const semesters = await Semester.find();

    res.status(200).json({
      success: true,
      count: semesters.length,
      data: semesters,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createSemester,
  getSemesters,
};