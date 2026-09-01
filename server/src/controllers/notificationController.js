const asyncHandler =
  require("express-async-handler");

const Notification =
  require("../models/Notification");

// =====================================================
// CONSTANTS
// =====================================================

const DEFAULT_LIMIT = 20;

const MAX_LIMIT = 100;

// =====================================================
// HELPERS
// =====================================================

const parsePagination =
  (query) => {
    const requestedPage =
      Number(query.page);

    const requestedLimit =
      Number(query.limit);

    const page =
      Number.isFinite(
        requestedPage
      ) &&
      requestedPage > 0
        ? Math.floor(
            requestedPage
          )
        : 1;

    const limit =
      Number.isFinite(
        requestedLimit
      ) &&
      requestedLimit > 0
        ? Math.min(
            Math.floor(
              requestedLimit
            ),
            MAX_LIMIT
          )
        : DEFAULT_LIMIT;

    return {
      page,
      limit,
      skip:
        (page - 1) *
        limit,
    };
  };

// =====================================================
// GET MY NOTIFICATIONS
// AUTHENTICATED USER
// =====================================================

const getMyNotifications =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const {
        page,
        limit,
        skip,
      } =
        parsePagination(
          req.query
        );

      const filter = {
        recipient:
          req.user._id,
      };

      // -----------------------------------------------
      // OPTIONAL READ FILTER
      // -----------------------------------------------

      if (
        req.query.isRead !==
        undefined
      ) {
        if (
          req.query.isRead ===
          "true"
        ) {
          filter.isRead =
            true;
        } else if (
          req.query.isRead ===
          "false"
        ) {
          filter.isRead =
            false;
        } else {
          res.status(400);

          throw new Error(
            "isRead must be true or false."
          );
        }
      }

      // -----------------------------------------------
      // FETCH NOTIFICATIONS
      // -----------------------------------------------

      const [
        notifications,
        total,
        unreadCount,
      ] =
        await Promise.all([
          Notification.find(
            filter
          )
            .sort({
              createdAt:
                -1,
            })
            .skip(
              skip
            )
            .limit(
              limit
            ),

          Notification.countDocuments(
            filter
          ),

          Notification.countDocuments({
            recipient:
              req.user._id,

            isRead:
              false,
          }),
        ]);

      res.status(200).json({
        success:
          true,

        count:
          notifications.length,

        total,

        unreadCount,

        page,

        totalPages:
          Math.ceil(
            total /
            limit
          ),

        hasNextPage:
          page *
            limit <
          total,

        hasPreviousPage:
          page >
          1,

        notifications,
      });
    }
  );

// =====================================================
// GET UNREAD NOTIFICATION COUNT
// AUTHENTICATED USER
// =====================================================

const getUnreadNotificationCount =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const unreadCount =
        await Notification.countDocuments({
          recipient:
            req.user._id,

          isRead:
            false,
        });

      res.status(200).json({
        success:
          true,

        unreadCount,
      });
    }
  );

// =====================================================
// MARK ONE NOTIFICATION AS READ
// OWNER ONLY
// =====================================================

const markNotificationAsRead =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const notification =
        await Notification.findOne({
          _id:
            req.params.id,

          recipient:
            req.user._id,
        });

      if (
        !notification
      ) {
        res.status(404);

        throw new Error(
          "Notification not found."
        );
      }

      // -----------------------------------------------
      // ALREADY READ
      // -----------------------------------------------

      if (
        notification.isRead
      ) {
        return res
          .status(200)
          .json({
            success:
              true,

            message:
              "Notification is already marked as read.",

            notification,
          });
      }

      // -----------------------------------------------
      // MARK AS READ
      // -----------------------------------------------

      notification.isRead =
        true;

      notification.readAt =
        new Date();

      await notification.save();

      res.status(200).json({
        success:
          true,

        message:
          "Notification marked as read.",

        notification,
      });
    }
  );

// =====================================================
// MARK ALL NOTIFICATIONS AS READ
// AUTHENTICATED USER
// =====================================================

const markAllNotificationsAsRead =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const result =
        await Notification.updateMany(
          {
            recipient:
              req.user._id,

            isRead:
              false,
          },
          {
            $set: {
              isRead:
                true,

              readAt:
                new Date(),
            },
          }
        );

      res.status(200).json({
        success:
          true,

        message:
          "All notifications marked as read.",

        updatedCount:
          result.modifiedCount,
      });
    }
  );

// =====================================================
// DELETE ONE NOTIFICATION
// OWNER ONLY
// =====================================================

const deleteNotification =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const notification =
        await Notification.findOneAndDelete({
          _id:
            req.params.id,

          recipient:
            req.user._id,
        });

      if (
        !notification
      ) {
        res.status(404);

        throw new Error(
          "Notification not found."
        );
      }

      res.status(200).json({
        success:
          true,

        message:
          "Notification deleted successfully.",
      });
    }
  );

// =====================================================
// DELETE ALL MY NOTIFICATIONS
// AUTHENTICATED USER
// =====================================================

const deleteAllNotifications =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const result =
        await Notification.deleteMany({
          recipient:
            req.user._id,
        });

      res.status(200).json({
        success:
          true,

        message:
          "All notifications deleted successfully.",

        deletedCount:
          result.deletedCount,
      });
    }
  );

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  getMyNotifications,

  getUnreadNotificationCount,

  markNotificationAsRead,

  markAllNotificationsAsRead,

  deleteNotification,

  deleteAllNotifications,
};