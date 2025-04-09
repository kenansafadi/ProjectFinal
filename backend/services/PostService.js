const Post = require("../model/postModel");

const createPost = async ({ userId, content, image }) => {
    const newPost = new Post({ user: userId, content, image });
    return newPost.save();
};

const getPaginatedPosts = async (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const posts = await Post.find()
        .populate("user", "username profilePic")
        .populate("comments.user", "username profilePic") // ✅ make sure this is included

        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const totalPosts = await Post.countDocuments();
    return { posts, totalPosts };
};

module.exports = { createPost, getPaginatedPosts };
