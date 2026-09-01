const Activity =
  require(
    "../models/Activity"
  );

const createActivity =
  async ({
    type,
    message,
    user = null,
    metadata = {},
  }) => {
    try {
      await Activity.create({
        type,
        message,
        user,
        metadata,
      });
    } catch (
      error
    ) {
      console.error(
        "Activity creation failed:",
        error.message
      );
    }
  };

module.exports =
  createActivity;