const mongoose =
  require("mongoose");

const activitySchema =
  new mongoose.Schema(
    {
      type: {
        type: String,
        required: true,
        trim: true,
      },

      message: {
        type: String,
        required: true,
        trim: true,
      },

      user: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",

        default: null,
      },

      metadata: {
        type: Object,

        default: {},
      },
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "Activity",
    activitySchema
  );