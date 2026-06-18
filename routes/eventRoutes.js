const express = require("express");
const { body } = require("express-validator");
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");
const {
  registerForEvent,
  cancelRegistration,
  getAttendees,
} = require("../controllers/registrationController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Validation rules for event
const eventValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be 3–100 characters"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("date").isISO8601().withMessage("Valid date is required").toDate(),
  body("location").trim().notEmpty().withMessage("Location is required"),
  body("capacity")
    .isInt({ min: 1 })
    .withMessage("Capacity must be a positive number"),
  body("category")
    .optional()
    .isIn(["conference", "workshop", "meetup", "webinar", "other"])
    .withMessage("Invalid category"),
];

// Public routes
router.get("/", getEvents);
router.get("/:id", getEventById);

// Admin only routes
router.post("/", protect, authorize("admin"), eventValidation, createEvent);
router.put("/:id", protect, authorize("admin"), eventValidation, updateEvent);
router.delete("/:id", protect, authorize("admin"), deleteEvent);

// Attendees (admin only)
router.get("/:id/attendees", protect, authorize("admin"), getAttendees);

// Registration (logged-in users)
router.post("/:id/register", protect, registerForEvent);
router.delete("/:id/register", protect, cancelRegistration);

module.exports = router;
