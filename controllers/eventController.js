const { validationResult } = require("express-validator");
const Event = require("../models/Event");
const Registration = require("../models/Registration");

const getEvents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";
    const category = req.query.category || "";

    let query = {};
    if (search) {
      query.$text = { $search: search };
    }
    if (category) {
      query.category = category;
    }

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate("createdBy", "name email")
      .populate("registrationCount")
      .sort({ date: 1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      count: events.length,
      events,
    });
  } catch (error) {
    next(error);
  }
};

// Public
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("registrationCount");

    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    res.status(200).json({ success: true, event });
  } catch (error) {
    next(error);
  }
};

// Admin only
const createEvent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const event = await Event.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, event });
  } catch (error) {
    next(error);
  }
};

// Admin only
const updateEvent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    let event = await Event.findById(req.params.id);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, event });
  } catch (error) {
    next(error);
  }
};

// Admin only
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    // Also delete all registrations for this event
    await Registration.deleteMany({ event: req.params.id });
    await event.deleteOne();

    res
      .status(200)
      .json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
