const Post = require("../model/postModel");
const postServices = require("../services/PostService");
const User = require("../model/usersModel");
const io = require('socket.io');  // Assuming socket.io is configured

// CREATE POST
const createPost = async (req, res) => {
    try {
        const { content, image } = req.body;
        const newPost = new Post({
            user: req.user.id,
            content,
            image,
        });

        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET POSTS
const getPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const { posts, totalPosts } = await postServices.getPaginatedPosts(page, limit);

        res.status(200).json({ posts, totalPosts });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// LIKE / UNLIKE POST
const likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        // Check if the post is already liked by the current user
        if (post.likes.includes(req.user.id)) {
            post.likes = post.likes.filter(id => id.toString() !== req.user.id);
            res.status(204).json({ message: "Post unliked" });
        } else {
            post.likes.push(req.user.id);

            // Send notification to the post owner
            const user = await User.findById(post.user);
            if (user) {
                io.to(user._id.toString()).emit("receiveNotification", {
                    message: `${req.user.username} liked your post.`,
                    link: `/posts/${post._id}`
                });
            }

            res.status(200).json({ message: "Post liked" });
        }

        await post.save(); // Save the updated post
        res.status(200).json(post);  // Return the updated post

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ADD COMMENT TO POST
const addComment = async (req, res) => {
    try {
        const { text } = req.body;
        const post = await Post.findById(req.params.id);

        if (!post) return res.status(404).json({ message: "Post not found" });

        const comment = {
            user: req.user.id,
            text,
        };

        post.comments.push(comment);
        await post.save();

        // Send notification to the post owner
        const user = await User.findById(post.user);
        if (user) {
            io.to(user._id.toString()).emit("receiveNotification", {
                message: `${req.user.username} commented on your post.`,
                link: `/posts/${post._id}`
            });
        }

        res.status(201).json({ message: "Comment added", post });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// SHARE POST
const sharePost = async (req, res) => {
    try {
        const originalPost = await Post.findById(req.params.id);

        if (!originalPost) return res.status(404).json({ message: "Original post not found" });

        const newPost = new Post({
            user: req.user.id, // current user sharing the post
            content: originalPost.content,
            image: originalPost.image,
        });

        await newPost.save();

        // Send notification to the original post owner
        const user = await User.findById(originalPost.user);
        if (user) {
            io.to(user._id.toString()).emit("receiveNotification", {
                message: `${req.user.username} shared your post.`,
                link: `/posts/${originalPost._id}`
            });
        }

        res.status(201).json({ message: "Post shared successfully", post: newPost });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE POST
const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        // Check if the logged-in user is the owner of the post
        if (post.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized to delete this post" });
        }

        await post.remove();


        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createPost, getPosts, deletePost, likePost, addComment, sharePost };
