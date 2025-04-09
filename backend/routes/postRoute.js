const express = require("express");
const { createPost, getPosts, deletePost, likePost, addComment, sharePost } = require("../controllers/postController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post("/", authMiddleware, createPost); // Create a post
router.get("/", getPosts); // Get all posts
router.delete("/:id", authMiddleware, deletePost); // Delete a post
router.put("/:id/like", authMiddleware, likePost); // Like/unlike a post
router.post("/:id/comment", authMiddleware, addComment);
router.post("/:id/share", authMiddleware, sharePost); // Add this here

module.exports = router;
