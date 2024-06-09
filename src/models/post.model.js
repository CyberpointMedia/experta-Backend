const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    image: { type: String }, // URL or path to image
    caption: { type: String, trim: true },
    location:{
       type: String
    },
    // location: {
    //   type: {
    //     type: String,
    //     enum: ["Point"],
    //     required: true,
    //   },
    //   coordinates: {
    //     type: [Number],
    //     required: true,
    //   },
    // },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [
      {
        comment: { type: String, trim: true },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    type: {
      type: String,
      enum: ["feed", "post"],
      default: "post",
    },
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);
module.exports = Post;


//  create collection for comments 
// user id--> 
// post id--> 
// comments --> 
// reply id-->