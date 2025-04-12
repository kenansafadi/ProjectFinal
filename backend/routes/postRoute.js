const express = require("express");
const { createPost, getPosts, deletePost, likePost, addComment, sharePost } = require("../controllers/postController");
const authMiddleware = require("../middleware/auth");
const Post = require('../model/postModel');

const router = express.Router();

router.post('/', authMiddleware, createPost);

router.put('/:id', authMiddleware, async (req, res) => {
   try {
      const { id } = req.params;
      const { title, content } = req.body;
      const post = await Post.findById(id);
      post.title = title;
      post.content = content;
      await post.save();
      res.json({ message: 'Post updated successfully' });
   } catch (error) {
      res.status(400).json({ message: 'Failed to update post', status: 400 });
   }
});

router.get('/mine', authMiddleware, async (req, res) => {
   try {
      const user = req.user;
      const posts = await Post.find({ userId: user.id });
      res.json(posts || []);
   } catch (error) {
      res.status(400).json({ message: 'Failed to get posts', status: 400 });
   }
});

router.get('/', async (req, res) => {
   const posts = await Post.find();
   res.json(posts || []);
});

router.get('/:id/comments', async (req, res) => {
   const { id } = req.params;
   const post = await Post.findById(id);
   res.json(post.comments || []);
});

router.post('/:id/delete', authMiddleware, async (req, res) => {
   try {
      const { id } = req.params;
      await Post.findByIdAndDelete(id);
      res.json({ message: 'Post deleted successfully' });
   } catch (error) {
      res.status(400).json({ message: 'Failed to delete post', status: 400 });
   }
});

router.post('/:id/like', authMiddleware, async (req, res) => {
   try {
      const { id } = req.params;
      const { isLiked } = req.body;
      const user = req.user;

      const post = await Post.findById(id);
      if (!post) {
         return res.status(404).json({ message: 'Post not found', status: 400 });
      }

      if (isLiked) {
         if (!post.likes.includes(user.id)) {
            post.likes.push(user.id);
         }
      } else {
         post.likes = post.likes.filter((id) => id !== user.id);
      }
      await post.save();

      res.json({ message: 'Post liked successfully' });
   } catch (error) {
      console.log(error);
      res.status(400).json({ message: 'Failed to like post', status: 400 });
   }
});

router.post('/:id/comment', authMiddleware, async (req, res) => {
   try {
      const { id } = req.params;
      const { comment, author_name } = req.body;
      console.log(req.body);
      const user = req.user;
      const post = await Post.findById(id);
      if (!post) {
         return res.status(400).json({ message: 'Post not found' });
      }
      post.comments.push({ userId: user.id, text: comment, author_name, replies: [] });
      await post.save();
      res.json({ message: 'Comment added successfully' });
   } catch (error) {
      res.status(400).json({ message: 'Failed to add comment', status: 400 });
   }
});

router.post('/:id/:commentId/reply', authMiddleware, async (req, res) => {
   try {
      const { id, commentId } = req.params;
      const { comment, author_name } = req.body;

      const user = req.user;
      console.log(user);

      const post = await Post.findById(id);
      if (!post) {
         return res.status(400).json({ message: 'Post not found' });
      }

      post.comments
         .find((c) => c._id.equals(commentId))
         .replies.push({ userId: user.id, text: comment, author_name });

      await post.save();
      res.json({ message: 'Reply added successfully' });
   } catch (error) {
      console.log(error);
      res.status(400).json({ message: 'Failed to add reply', status: 400 });
   }
});

router.post('/:id/share', async (req, res) => {
   const { id } = req.params;
   const { userId } = req.body;
   const post = await Post.findById(id);
   if (!post) {
      return res.status(404).json({ message: 'Post not found' });
   }
   post.shares.push(userId);
   await post.save();
   res.json({ message: 'Post shared successfully' });
});

module.exports = router;
