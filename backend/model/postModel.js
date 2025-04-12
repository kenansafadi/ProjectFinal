const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
   {
      userId: { type: String, required: true },
      title: { type: String, required: true },
      content: { type: String, required: true },
      image: { type: String, default: null },
      likes: [{ type: String, required: true, default: [] }],
      comments: [
         {
            userId: { type: String, required: true },
            text: { type: String, required: true },
            createdAt: { type: Date, default: Date.now },
            author_name: { type: String, required: true },
            replies: [
               {
                  userId: { type: String, required: true },
                  text: { type: String, required: true },
                  createdAt: { type: Date, default: Date.now },
                  author_name: { type: String, required: true },
               },
            ],
         },
      ],
   },
   { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
