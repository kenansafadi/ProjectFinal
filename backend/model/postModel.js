const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        content: { type: String, required: true },
        image: { type: String },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        shares: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // ✅ new field
        comments: [
            {
                user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                text: { type: String, required: true },
                createdAt: { type: Date, default: Date.now }
            }
        ]
    },
    { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
