const express =
  require("express");

const {
  protect,
} =
  require("../middleware/authMiddleware");

const {
  getMyNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
} =
  require("../controllers/notificationController");

// =====================================================
// ROUTER
// =====================================================

const router =
  express.Router();

// =====================================================
// GET MY NOTIFICATIONS
// =====================================================

// GET /api/notifications

router.get(
  "/",
  protect,
  getMyNotifications
);

// =====================================================
// GET UNREAD NOTIFICATION COUNT
// =====================================================

// GET /api/notifications/unread-count
//
// IMPORTANT:
// This route must come before "/:id".

router.get(
  "/unread-count",
  protect,
  getUnreadNotificationCount
);

// =====================================================
// MARK ALL NOTIFICATIONS AS READ
// =====================================================

// PUT /api/notifications/read-all
//
// IMPORTANT:
// This route must come before "/:id".

router.put(
  "/read-all",
  protect,
  markAllNotificationsAsRead
);

// =====================================================
// DELETE ALL NOTIFICATIONS
// =====================================================

// DELETE /api/notifications

router.delete(
  "/",
  protect,
  deleteAllNotifications
);

// =====================================================
// MARK ONE NOTIFICATION AS READ
// =====================================================

// PUT /api/notifications/:id/read

router.put(
  "/:id/read",
  protect,
  markNotificationAsRead
);

// =====================================================
// DELETE ONE NOTIFICATION
// =====================================================

// DELETE /api/notifications/:id

router.delete(
  "/:id",
  protect,
  deleteNotification
);

// =====================================================
// EXPORT
// =====================================================

module.exports =
  router;