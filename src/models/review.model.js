const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    reviewBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual to format the createdAt date
reviewSchema.virtual("formattedDate").get(function () {
  const now = new Date();
  const diff = now - this.createdAt;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
});

// Ensure virtual fields are included when converting to JSON

reviewSchema.virtual("reviewerName").get(async function () {
  try {
    const User = mongoose.model("User");
    const reviewer = await User.findById(
      this.reviewBy,
      "basicInfo.firstName basicInfo.lastName basicInfo.displayName"
    );

    if (!reviewer) return "Unknown User";

    if (reviewer.basicInfo.displayName) {
      return reviewer.basicInfo.displayName;
    }

    const firstName = reviewer.basicInfo.firstName || "";
    const lastName = reviewer.basicInfo.lastName || "";
    return `${firstName} ${lastName}`.trim() || "Anonymous";
  } catch (error) {
    console.error("Error fetching reviewer name:", error);
    return "Error Fetching Name";
  }
});

reviewSchema.set("toJSON", { virtuals: true });

reviewSchema.set("toObject", { virtuals: true });
reviewSchema.set("toJSON", { virtuals: true, getters: true });

module.exports = mongoose.model("Review", reviewSchema);
