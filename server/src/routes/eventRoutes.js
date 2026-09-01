const express =
  require("express");

const {
  protect,
  requireRole,
} =
  require("../middleware/authMiddleware");

const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelEventRegistration,
  getMyRegisteredEvents,
  getMyOrganizedEvents,
  getEventParticipants,
} =
  require("../controllers/eventController");

// =====================================================
// ROUTER
// =====================================================

const router =
  express.Router();

// =====================================================
// PUBLIC / GENERAL ROUTES
// =====================================================

// -----------------------------------------------------
// GET ALL EVENTS
//
// GET /api/events
// -----------------------------------------------------

router.get(
  "/",
  getEvents
);

// =====================================================
// STUDENT ROUTES
// =====================================================

// -----------------------------------------------------
// GET MY REGISTERED EVENTS
//
// GET /api/events/my/registered
// -----------------------------------------------------

router.get(
  "/my/registered",
  protect,
  requireRole(
    "student"
  ),
  getMyRegisteredEvents
);

// -----------------------------------------------------
// REGISTER FOR EVENT
//
// POST /api/events/:id/register
// -----------------------------------------------------

router.post(
  "/:id/register",
  protect,
  requireRole(
    "student"
  ),
  registerForEvent
);

// -----------------------------------------------------
// CANCEL EVENT REGISTRATION
//
// DELETE /api/events/:id/register
// -----------------------------------------------------

router.delete(
  "/:id/register",
  protect,
  requireRole(
    "student"
  ),
  cancelEventRegistration
);

// =====================================================
// EVENT ORGANIZER ROUTES
// =====================================================

// -----------------------------------------------------
// GET MY ORGANIZED EVENTS
//
// GET /api/events/my/organized
// -----------------------------------------------------

router.get(
  "/my/organized",
  protect,
  requireRole(
    "recruiter",
    "admin"
  ),
  getMyOrganizedEvents
);

// -----------------------------------------------------
// CREATE EVENT
//
// POST /api/events
// -----------------------------------------------------

router.post(
  "/",
  protect,
  requireRole(
    "recruiter",
    "admin"
  ),
  createEvent
);

// -----------------------------------------------------
// GET EVENT PARTICIPANTS
//
// GET /api/events/:id/participants
// -----------------------------------------------------

router.get(
  "/:id/participants",
  protect,
  requireRole(
    "recruiter",
    "admin"
  ),
  getEventParticipants
);

// -----------------------------------------------------
// UPDATE EVENT
//
// PUT /api/events/:id
// -----------------------------------------------------

router.put(
  "/:id",
  protect,
  requireRole(
    "recruiter",
    "admin"
  ),
  updateEvent
);

// -----------------------------------------------------
// DELETE EVENT
//
// DELETE /api/events/:id
// -----------------------------------------------------

router.delete(
  "/:id",
  protect,
  requireRole(
    "recruiter",
    "admin"
  ),
  deleteEvent
);

// =====================================================
// SINGLE EVENT
//
// GET /api/events/:id
//
// Must come after "/my/..." routes.
// =====================================================

router.get(
  "/:id",
  getEventById
);

// =====================================================
// EXPORT
// =====================================================

module.exports =
  router;