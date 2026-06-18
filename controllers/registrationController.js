const Registration = require("../models/Registration");
const Event = require("../models/Event");

// Logged-in users only
const registerForEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "registrationCount",
    );
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    if (new Date(event.date) < new Date()) {
      return res
        .status(400)
        .json({ success: false, message: "Cannot register for a past event" });
    }

    const registrationCount = await Registration.countDocuments({
      event: req.params.id,
    });
    if (registrationCount >= event.capacity) {
      return res
        .status(400)
        .json({ success: false, message: "Event is fully booked" });
    }

    // Check if already registered
    const existing = await Registration.findOne({
      event: req.params.id,
      user: req.user._id,
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You are already registered for this event",
      });
    }

    const registration = await Registration.create({
      event: req.params.id,
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Successfully registered for the event",
      registration,
    });
  } catch (error) {
    next(error);
  }
};

// Cancel registration (logged-in user)
const cancelRegistration = async (req, res, next) => {
  try {
    const registration = await Registration.findOneAndDelete({
      event: req.params.id,
      user: req.user._id,
    });

    if (!registration) {
      return res
        .status(404)
        .json({ success: false, message: "Registration not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Registration cancelled successfully" });
  } catch (error) {
    next(error);
  }
};

// Admin only
const getAttendees = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    const registrations = await Registration.find({ event: req.params.id })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: registrations.length,
      attendees: registrations.map((r) => ({
        _id: r._id,
        user: r.user,
        registeredAt: r.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// Get events the logged-in user is registered for
const getMyRegistrations = async (req, res, next) => {
  try {
    const registrations = await Registration.find({ user: req.user._id })
      .populate({
        path: "event",
        populate: { path: "createdBy", select: "name" },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: registrations.length,
      registrations,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerForEvent,
  cancelRegistration,
  getAttendees,
  getMyRegistrations,
};
