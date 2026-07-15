const express = require("express");

const {
  createTimetable,
  getTimetables,
} = require("../controllers/timetableController");

const router = express.Router();

router.post("/", createTimetable);
router.get("/", getTimetables);

module.exports = router;