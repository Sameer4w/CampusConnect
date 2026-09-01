const asyncHandler =
  require("express-async-handler");

const Event =
  require("../models/Event");

// =====================================================
// CONSTANTS
// =====================================================

const MAX = {
  title: 200,
  description: 5000,
  organizerName: 200,
  location: 300,
  meetingUrl: 500,
  imageUrl: 500,
  tag: 50,
  tags: 20,
};

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

// =====================================================
// HELPERS
// =====================================================

const hasOwn =
  (object, key) =>
    Object.prototype.hasOwnProperty.call(
      object,
      key
    );

// =====================================================
// VALIDATE STRING
// =====================================================

const validateString =
  (
    value,
    fieldName,
    maxLength,
    required = false
  ) => {
    if (
      value === undefined ||
      value === null
    ) {
      if (
        required
      ) {
        throw new Error(
          `${fieldName} is required`
        );
      }

      return "";
    }

    if (
      typeof value !==
      "string"
    ) {
      throw new Error(
        `${fieldName} must be a string`
      );
    }

    const trimmed =
      value.trim();

    if (
      required &&
      !trimmed
    ) {
      throw new Error(
        `${fieldName} is required`
      );
    }

    if (
      trimmed.length >
      maxLength
    ) {
      throw new Error(
        `${fieldName} cannot exceed ${maxLength} characters`
      );
    }

    return trimmed;
  };

// =====================================================
// NORMALIZE STRING ARRAY
// =====================================================

const normalizeStringArray =
  (
    values,
    fieldName,
    maxItems
  ) => {
    if (
      !Array.isArray(
        values
      )
    ) {
      throw new Error(
        `${fieldName} must be an array`
      );
    }

    if (
      values.length >
      maxItems
    ) {
      throw new Error(
        `${fieldName} cannot contain more than ${maxItems} items`
      );
    }

    const seen =
      new Set();

    return values
      .map(
        (value) => {
          if (
            typeof value !==
            "string"
          ) {
            throw new Error(
              `${fieldName} items must be strings`
            );
          }

          const trimmed =
            value.trim();

          if (
            trimmed.length >
            MAX.tag
          ) {
            throw new Error(
              `${fieldName} items cannot exceed ${MAX.tag} characters`
            );
          }

          return trimmed;
        }
      )
      .filter(
        (value) =>
          value.length > 0
      )
      .filter(
        (value) => {
          const normalized =
            value.toLowerCase();

          if (
            seen.has(
              normalized
            )
          ) {
            return false;
          }

          seen.add(
            normalized
          );

          return true;
        }
      );
  };

// =====================================================
// VALIDATE DATE
// =====================================================

const parseDate =
  (
    value,
    fieldName,
    required = false
  ) => {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      if (
        required
      ) {
        throw new Error(
          `${fieldName} is required`
        );
      }

      return null;
    }

    const date =
      new Date(
        value
      );

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      throw new Error(
        `${fieldName} must be a valid date`
      );
    }

    return date;
  };

// =====================================================
// VALIDATE CAPACITY
// =====================================================

const validateCapacity =
  (value) => {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return null;
    }

    const capacity =
      Number(
        value
      );

    if (
      !Number.isInteger(
        capacity
      ) ||
      capacity < 1
    ) {
      throw new Error(
        "Capacity must be a positive integer"
      );
    }

    return capacity;
  };

// =====================================================
// CREATE EVENT
// RECRUITER / ADMIN
// =====================================================

const createEvent =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const {
        title,
        description,
        type,
        organizerName,
        mode,
        location,
        meetingUrl,
        startDate,
        endDate,
        registrationDeadline,
        capacity,
        status,
        tags,
        imageUrl,
      } =
        req.body || {};

      // -----------------------------------------------
      // REQUIRED FIELDS
      // -----------------------------------------------

      const cleanTitle =
        validateString(
          title,
          "Title",
          MAX.title,
          true
        );

      const cleanDescription =
        validateString(
          description,
          "Description",
          MAX.description,
          true
        );

      const cleanOrganizerName =
        validateString(
          organizerName,
          "Organizer name",
          MAX.organizerName,
          true
        );

      // -----------------------------------------------
      // ENUM VALIDATION
      // -----------------------------------------------

      const cleanType =
        type === undefined
          ? "other"
          : validateString(
              type,
              "Event type",
              50,
              true
            ).toLowerCase();

      if (
        !Event.TYPES.includes(
          cleanType
        )
      ) {
        res.status(400);

        throw new Error(
          `Event type must be one of: ${Event.TYPES.join(
            ", "
          )}`
        );
      }

      const cleanMode =
        mode === undefined
          ? "On-site"
          : validateString(
              mode,
              "Event mode",
              50,
              true
            );

      if (
        !Event.MODES.includes(
          cleanMode
        )
      ) {
        res.status(400);

        throw new Error(
          `Event mode must be one of: ${Event.MODES.join(
            ", "
          )}`
        );
      }

      const allowedStatuses = [
        "draft",
        "published",
        "cancelled",
        "completed",
      ];

      const cleanStatus =
        status === undefined
          ? "draft"
          : validateString(
              status,
              "Status",
              50,
              true
            ).toLowerCase();

      if (
        !allowedStatuses.includes(
          cleanStatus
        )
      ) {
        res.status(400);

        throw new Error(
          `Status must be one of: ${allowedStatuses.join(
            ", "
          )}`
        );
      }

      // -----------------------------------------------
      // LOCATION / MEETING URL
      // -----------------------------------------------

      const cleanLocation =
        validateString(
          location,
          "Location",
          MAX.location
        );

      const cleanMeetingUrl =
        validateString(
          meetingUrl,
          "Meeting URL",
          MAX.meetingUrl
        );

      // -----------------------------------------------
      // DATE VALIDATION
      // -----------------------------------------------

      const parsedStartDate =
        parseDate(
          startDate,
          "Start date",
          true
        );

      const parsedEndDate =
        parseDate(
          endDate,
          "End date",
          true
        );

      const parsedRegistrationDeadline =
        parseDate(
          registrationDeadline,
          "Registration deadline"
        );

      if (
        parsedEndDate <=
        parsedStartDate
      ) {
        res.status(400);

        throw new Error(
          "Event end date must be after the start date."
        );
      }

      if (
        parsedRegistrationDeadline &&
        parsedRegistrationDeadline >
          parsedStartDate
      ) {
        res.status(400);

        throw new Error(
          "Registration deadline cannot be after the event start date."
        );
      }

      // -----------------------------------------------
      // MODE-SPECIFIC VALIDATION
      // -----------------------------------------------

      if (
        cleanMode ===
          "On-site" &&
        !cleanLocation
      ) {
        res.status(400);

        throw new Error(
          "Location is required for an on-site event."
        );
      }

      if (
        cleanMode ===
          "Online" &&
        !cleanMeetingUrl
      ) {
        res.status(400);

        throw new Error(
          "Meeting URL is required for an online event."
        );
      }

      // -----------------------------------------------
      // OPTIONAL FIELDS
      // -----------------------------------------------

      const cleanCapacity =
        validateCapacity(
          capacity
        );

      const cleanTags =
        tags === undefined
          ? []
          : normalizeStringArray(
              tags,
              "Tags",
              MAX.tags
            );

      const cleanImageUrl =
        validateString(
          imageUrl,
          "Image URL",
          MAX.imageUrl
        );

      // -----------------------------------------------
      // CREATE EVENT
      // -----------------------------------------------

      const event =
        await Event.create({
          title:
            cleanTitle,

          description:
            cleanDescription,

          type:
            cleanType,

          organizer:
            req.user._id,

          organizerName:
            cleanOrganizerName,

          mode:
            cleanMode,

          location:
            cleanLocation,

          meetingUrl:
            cleanMeetingUrl,

          startDate:
            parsedStartDate,

          endDate:
            parsedEndDate,

          registrationDeadline:
            parsedRegistrationDeadline,

          capacity:
            cleanCapacity,

          status:
            cleanStatus,

          tags:
            cleanTags,

          imageUrl:
            cleanImageUrl,
        });

      res.status(201).json({
        success:
          true,

        message:
          "Event created successfully.",

        event,
      });
    }
  );

// =====================================================
// GET ALL EVENTS
// PUBLIC / AUTHENTICATED
// =====================================================

const getEvents =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const {
        type,
        mode,
        status,
        organizer,
        search,
        upcoming,
        page = 1,
        limit = DEFAULT_LIMIT,
      } =
        req.query;

      const query =
        {};

      // -----------------------------------------------
      // FILTERS
      // -----------------------------------------------

      if (
        type
      ) {
        query.type =
          type;
      }

      if (
        mode
      ) {
        query.mode =
          mode;
      }

      if (
        status
      ) {
        query.status =
          status;
      }

      if (
        organizer
      ) {
        query.organizer =
          organizer;
      }

      if (
        upcoming ===
        "true"
      ) {
        query.startDate = {
          $gte:
            new Date(),
        };
      }

      // -----------------------------------------------
      // SEARCH
      // -----------------------------------------------

      if (
        search &&
        typeof search ===
          "string" &&
        search.trim()
      ) {
        const searchRegex =
          new RegExp(
            search.trim(),
            "i"
          );

        query.$or = [
          {
            title:
              searchRegex,
          },
          {
            description:
              searchRegex,
          },
          {
            organizerName:
              searchRegex,
          },
          {
            tags:
              searchRegex,
          },
        ];
      }

      // -----------------------------------------------
      // PAGINATION
      // -----------------------------------------------

      const parsedPage =
        Math.max(
          1,
          Number(
            page
          ) || 1
        );

      const parsedLimit =
        Math.min(
          MAX_LIMIT,
          Math.max(
            1,
            Number(
              limit
            ) ||
              DEFAULT_LIMIT
          )
        );

      const skip =
        (
          parsedPage - 1
        ) *
        parsedLimit;

      // -----------------------------------------------
      // FETCH EVENTS
      // -----------------------------------------------

      const [
        events,
        total,
      ] =
        await Promise.all([
          Event.find(
            query
          )
            .populate(
              "organizer",
              "name email"
            )
            .sort({
              startDate:
                1,
            })
            .skip(
              skip
            )
            .limit(
              parsedLimit
            ),

          Event.countDocuments(
            query
          ),
        ]);

      const totalPages =
        Math.ceil(
          total /
            parsedLimit
        );

      res.status(200).json({
        success:
          true,

        count:
          events.length,

        total,

        page:
          parsedPage,

        totalPages,

        hasNextPage:
          parsedPage <
          totalPages,

        hasPreviousPage:
          parsedPage >
          1,

        events,
      });
    }
  );

// =====================================================
// GET SINGLE EVENT
// =====================================================

const getEventById =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const event =
        await Event.findById(
          req.params.id
        )
          .populate(
            "organizer",
            "name email"
          )
          .populate(
            "registrations",
            "name email"
          );

      if (
        !event
      ) {
        res.status(404);

        throw new Error(
          "Event not found."
        );
      }

      res.status(200).json({
        success:
          true,

        event,
      });
    }
  );

// =====================================================
// UPDATE EVENT
// ORGANIZER OWNER / ADMIN
// =====================================================

const updateEvent =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const event =
        await Event.findById(
          req.params.id
        );

      if (
        !event
      ) {
        res.status(404);

        throw new Error(
          "Event not found."
        );
      }

      // -----------------------------------------------
      // PERMISSION CHECK
      // -----------------------------------------------

      const isOwner =
        event.organizer.toString() ===
        req.user._id.toString();

      const isAdmin =
        req.user.role ===
        "admin";

      if (
        !isOwner &&
        !isAdmin
      ) {
        res.status(403);

        throw new Error(
          "You do not have permission to update this event."
        );
      }

      const body =
        req.body || {};

      // -----------------------------------------------
      // BASIC FIELDS
      // -----------------------------------------------

      if (
        hasOwn(
          body,
          "title"
        )
      ) {
        event.title =
          validateString(
            body.title,
            "Title",
            MAX.title,
            true
          );
      }

      if (
        hasOwn(
          body,
          "description"
        )
      ) {
        event.description =
          validateString(
            body.description,
            "Description",
            MAX.description,
            true
          );
      }

      if (
        hasOwn(
          body,
          "organizerName"
        )
      ) {
        event.organizerName =
          validateString(
            body.organizerName,
            "Organizer name",
            MAX.organizerName,
            true
          );
      }

      // -----------------------------------------------
      // TYPE
      // -----------------------------------------------

      if (
        hasOwn(
          body,
          "type"
        )
      ) {
        const cleanType =
          validateString(
            body.type,
            "Event type",
            50,
            true
          ).toLowerCase();

        if (
          !Event.TYPES.includes(
            cleanType
          )
        ) {
          res.status(400);

          throw new Error(
            `Event type must be one of: ${Event.TYPES.join(
              ", "
            )}`
          );
        }

        event.type =
          cleanType;
      }

      // -----------------------------------------------
      // MODE
      // -----------------------------------------------

      if (
        hasOwn(
          body,
          "mode"
        )
      ) {
        const cleanMode =
          validateString(
            body.mode,
            "Event mode",
            50,
            true
          );

        if (
          !Event.MODES.includes(
            cleanMode
          )
        ) {
          res.status(400);

          throw new Error(
            `Event mode must be one of: ${Event.MODES.join(
              ", "
            )}`
          );
        }

        event.mode =
          cleanMode;
      }

      // -----------------------------------------------
      // LOCATION / MEETING URL
      // -----------------------------------------------

      if (
        hasOwn(
          body,
          "location"
        )
      ) {
        event.location =
          validateString(
            body.location,
            "Location",
            MAX.location
          );
      }

      if (
        hasOwn(
          body,
          "meetingUrl"
        )
      ) {
        event.meetingUrl =
          validateString(
            body.meetingUrl,
            "Meeting URL",
            MAX.meetingUrl
          );
      }

      // -----------------------------------------------
      // DATES
      // -----------------------------------------------

      if (
        hasOwn(
          body,
          "startDate"
        )
      ) {
        event.startDate =
          parseDate(
            body.startDate,
            "Start date",
            true
          );
      }

      if (
        hasOwn(
          body,
          "endDate"
        )
      ) {
        event.endDate =
          parseDate(
            body.endDate,
            "End date",
            true
          );
      }

      if (
        hasOwn(
          body,
          "registrationDeadline"
        )
      ) {
        event.registrationDeadline =
          parseDate(
            body.registrationDeadline,
            "Registration deadline"
          );
      }

      // -----------------------------------------------
      // CAPACITY
      // -----------------------------------------------

      if (
        hasOwn(
          body,
          "capacity"
        )
      ) {
        event.capacity =
          validateCapacity(
            body.capacity
          );
      }

      // -----------------------------------------------
      // STATUS
      // -----------------------------------------------

      if (
        hasOwn(
          body,
          "status"
        )
      ) {
        const allowedStatuses = [
          "draft",
          "published",
          "cancelled",
          "completed",
        ];

        const cleanStatus =
          validateString(
            body.status,
            "Status",
            50,
            true
          ).toLowerCase();

        if (
          !allowedStatuses.includes(
            cleanStatus
          )
        ) {
          res.status(400);

          throw new Error(
            `Status must be one of: ${allowedStatuses.join(
              ", "
            )}`
          );
        }

        event.status =
          cleanStatus;
      }

      // -----------------------------------------------
      // TAGS
      // -----------------------------------------------

      if (
        hasOwn(
          body,
          "tags"
        )
      ) {
        event.tags =
          normalizeStringArray(
            body.tags,
            "Tags",
            MAX.tags
          );
      }

      // -----------------------------------------------
      // IMAGE
      // -----------------------------------------------

      if (
        hasOwn(
          body,
          "imageUrl"
        )
      ) {
        event.imageUrl =
          validateString(
            body.imageUrl,
            "Image URL",
            MAX.imageUrl
          );
      }

      // -----------------------------------------------
      // FINAL VALIDATION
      // -----------------------------------------------

      if (
        event.endDate <=
        event.startDate
      ) {
        res.status(400);

        throw new Error(
          "Event end date must be after the start date."
        );
      }

      if (
        event.registrationDeadline &&
        event.registrationDeadline >
          event.startDate
      ) {
        res.status(400);

        throw new Error(
          "Registration deadline cannot be after the event start date."
        );
      }

      if (
        event.mode ===
          "On-site" &&
        !event.location
      ) {
        res.status(400);

        throw new Error(
          "Location is required for an on-site event."
        );
      }

      if (
        event.mode ===
          "Online" &&
        !event.meetingUrl
      ) {
        res.status(400);

        throw new Error(
          "Meeting URL is required for an online event."
        );
      }

      await event.save();

      res.status(200).json({
        success:
          true,

        message:
          "Event updated successfully.",

        event,
      });
    }
  );

// =====================================================
// DELETE EVENT
// ORGANIZER OWNER / ADMIN
// =====================================================

const deleteEvent =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const event =
        await Event.findById(
          req.params.id
        );

      if (
        !event
      ) {
        res.status(404);

        throw new Error(
          "Event not found."
        );
      }

      const isOwner =
        event.organizer.toString() ===
        req.user._id.toString();

      const isAdmin =
        req.user.role ===
        "admin";

      if (
        !isOwner &&
        !isAdmin
      ) {
        res.status(403);

        throw new Error(
          "You do not have permission to delete this event."
        );
      }

      await event.deleteOne();

      res.status(200).json({
        success:
          true,

        message:
          "Event deleted successfully.",
      });
    }
  );

// =====================================================
// REGISTER FOR EVENT
// STUDENT ONLY
// =====================================================

const registerForEvent =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const event =
        await Event.findById(
          req.params.id
        );

      if (
        !event
      ) {
        res.status(404);

        throw new Error(
          "Event not found."
        );
      }

      // -----------------------------------------------
      // EVENT MUST BE PUBLISHED
      // -----------------------------------------------

      if (
        event.status !==
        "published"
      ) {
        res.status(400);

        throw new Error(
          "Registration is not available for this event."
        );
      }

      // -----------------------------------------------
      // EVENT MUST NOT HAVE STARTED
      // -----------------------------------------------

      if (
        event.startDate <=
        new Date()
      ) {
        res.status(400);

        throw new Error(
          "Registration is closed because the event has already started."
        );
      }

      // -----------------------------------------------
      // REGISTRATION DEADLINE
      // -----------------------------------------------

      if (
        event.registrationDeadline &&
        event.registrationDeadline <
          new Date()
      ) {
        res.status(400);

        throw new Error(
          "The registration deadline has passed."
        );
      }

      // -----------------------------------------------
      // PREVENT DUPLICATE REGISTRATION
      // -----------------------------------------------

      const alreadyRegistered =
        event.registrations.some(
          (userId) =>
            userId.toString() ===
            req.user._id.toString()
        );

      if (
        alreadyRegistered
      ) {
        res.status(400);

        throw new Error(
          "You are already registered for this event."
        );
      }

      // -----------------------------------------------
      // CAPACITY CHECK
      // -----------------------------------------------

      if (
        event.capacity !==
          null &&
        event.registrations.length >=
          event.capacity
      ) {
        res.status(400);

        throw new Error(
          "This event has reached its maximum capacity."
        );
      }

      // -----------------------------------------------
      // REGISTER STUDENT
      // -----------------------------------------------

      event.registrations.push(
        req.user._id
      );

      await event.save();

      res.status(200).json({
        success:
          true,

        message:
          "Successfully registered for the event.",

        event,
      });
    }
  );

// =====================================================
// CANCEL EVENT REGISTRATION
// STUDENT ONLY
// =====================================================

const cancelEventRegistration =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const event =
        await Event.findById(
          req.params.id
        );

      if (
        !event
      ) {
        res.status(404);

        throw new Error(
          "Event not found."
        );
      }

      const registrationIndex =
        event.registrations.findIndex(
          (userId) =>
            userId.toString() ===
            req.user._id.toString()
        );

      if (
        registrationIndex ===
        -1
      ) {
        res.status(400);

        throw new Error(
          "You are not registered for this event."
        );
      }

      event.registrations.splice(
        registrationIndex,
        1
      );

      await event.save();

      res.status(200).json({
        success:
          true,

        message:
          "Event registration cancelled successfully.",
      });
    }
  );

// =====================================================
// GET MY REGISTERED EVENTS
// STUDENT ONLY
// =====================================================

const getMyRegisteredEvents =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const events =
        await Event.find({
          registrations:
            req.user._id,
        })
          .populate(
            "organizer",
            "name email"
          )
          .sort({
            startDate:
              1,
          });

      res.status(200).json({
        success:
          true,

        count:
          events.length,

        events,
      });
    }
  );

// =====================================================
// GET MY ORGANIZED EVENTS
// ORGANIZER / RECRUITER / ADMIN
// =====================================================

const getMyOrganizedEvents =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const events =
        await Event.find({
          organizer:
            req.user._id,
        })
          .sort({
            createdAt:
              -1,
          });

      res.status(200).json({
        success:
          true,

        count:
          events.length,

        events,
      });
    }
  );

// =====================================================
// GET EVENT PARTICIPANTS
// ORGANIZER OWNER / ADMIN
// =====================================================

const getEventParticipants =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const event =
        await Event.findById(
          req.params.id
        )
          .populate(
            "registrations",
            "name email"
          );

      if (
        !event
      ) {
        res.status(404);

        throw new Error(
          "Event not found."
        );
      }

      const isOwner =
        event.organizer.toString() ===
        req.user._id.toString();

      const isAdmin =
        req.user.role ===
        "admin";

      if (
        !isOwner &&
        !isAdmin
      ) {
        res.status(403);

        throw new Error(
          "You do not have permission to view event participants."
        );
      }

      res.status(200).json({
        success:
          true,

        eventId:
          event._id,

        count:
          event.registrations.length,

        participants:
          event.registrations,
      });
    }
  );

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
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
};