const express = require("express");

const {
  markAttendance,
  getAttendance,
} = require("../controllers/attendanceController");

const router = express.Router();

router.post("/", markAttendance);
router.get("/", getAttendance);

module.exports = router;