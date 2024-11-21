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
    reviewerName: {
      type: String,
    },
    profilePic: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
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

reviewSchema.pre("save", async function (next) {
  if (!this.reviewerName || !this.profilePic) {
    try {
      const user = await mongoose
        .model("User")
        .findById(this.reviewBy)
        .populate("basicInfo");
      if (user && user.basicInfo) {
        if (!this.reviewerName) {
          if (user.basicInfo.displayName) {
            this.reviewerName = user.basicInfo.displayName;
          } else if (user.basicInfo.firstName) {
            this.reviewerName =
              user.basicInfo.firstName +
              (user.basicInfo.lastName ? " " + user.basicInfo.lastName : "");
          } else {
            this.reviewerName = "Anonymous";
          }
        }

        if (!this.profilePic && user.basicInfo.profilePic) {
          this.profilePic = user.basicInfo.profilePic;
        }
      } else {
        this.reviewerName = this.reviewerName || "Anonymous";
      }
    } catch (error) {
      console.error("Error setting reviewer details:", error);
      this.reviewerName = this.reviewerName || "Anonymous";
    }
  }
  next();
});
reviewSchema.set("toObject", { virtuals: true });
reviewSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Review", reviewSchema);
