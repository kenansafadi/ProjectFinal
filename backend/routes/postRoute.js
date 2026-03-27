const express = require("express");
const { createPost, getPosts, deletePost, likePost, addComment } = require("../controllers/postController");
const authMiddleware = require("../middleware/auth");
const upload = require('../middleware/upload');
const Post = require('../model/postModel');

const router = express.Router();

router.post('/', authMiddleware, upload.single('image'), createPost);

router.get('/mine', authMiddleware, async (req, res) => {
   try {
      const user = req.user;
      const posts = await Post.find({ userId: user.id })
         .populate('userId', 'username profilePicture')
         .sort({ createdAt: -1 });

      const formattedPosts = posts.map(p => {
         const postObj = p.toObject();
         return { ...postObj, author: postObj.userId };
      });
      res.json(formattedPosts);
   } catch (error) {
      res.status(400).json({ message: 'Failed to get posts', status: 400 });
   }
});

router.get('/:id', async (req, res) => {
   try {
      const post = await Post.findById(req.params.id)
         .populate('userId', 'username profilePicture');
      if (!post) return res.status(404).json({ message: 'Post not found' });
      const postObj = post.toObject();
      res.json({ ...postObj, author: postObj.userId });
   } catch (error) {
      res.status(400).json({ message: 'Failed to fetch post' });
   }
});

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



router.get('/', async (req, res) => {
   try {
      const token = req.headers.authorization?.split(' ')[1];
      const jwt = require('jsonwebtoken');
      let userId = null;

      if (token) {
         try { userId = jwt.verify(token, process.env.JWT_SECRET)?.id; } catch { /* expired/invalid */ }
      }

      if (!userId) {
         const posts = await Post.find()
            .populate('userId', 'username profilePicture')
            .sort({ createdAt: -1 });
         return res.json({ posts: posts.map(p => ({ ...p.toObject(), author: p.toObject().userId })), suggestions: [] });
      }

      const { User } = require('../model/usersModel');
      const currentUser = await User.findById(userId, 'following');
      const allFollowingIds = (currentUser?.following || []).map(f => f.userId.toString());
      const acceptedFollowingIds = (currentUser?.following || [])
         .filter(f => f.isAccepted)
         .map(f => f.userId.toString());

      const posts = await Post.find({ userId: { $in: [userId, ...acceptedFollowingIds] } })
         .populate('userId', 'username profilePicture')
         .sort({ createdAt: -1 });

      const suggestionsLimit = parseInt(req.query.suggestionsLimit) || 6;

      const suggestions = await User.find(
         { _id: { $nin: [userId, ...allFollowingIds] } },
         'username profilePicture bio'
      ).limit(suggestionsLimit);

      return res.json({
         posts: posts.map(p => ({ ...p.toObject(), author: p.toObject().userId })),
         suggestions,
      });
   } catch (error) {
      res.status(500).json({ message: 'Failed to fetch posts', status: 500 });
   }
});


router.get('/:id/comments', async (req, res) => {
   try {
      const { id } = req.params;
      const post = await Post.findById(id);
      if (!post) return res.status(404).json({ message: 'Post not found' });

      const comments = post.comments || [];
      const userIds = new Set();
      comments.forEach(c => {
         if (c.userId) userIds.add(String(c.userId));
         (c.replies || []).forEach(r => { if (r.userId) userIds.add(String(r.userId)); });
      });

      const { User } = require('../model/usersModel');
      const users = await User.find({ _id: { $in: [...userIds] } }, '_id profilePicture');
      const userMap = {};
      users.forEach(u => { userMap[String(u._id)] = u.profilePicture || null; });

      const enriched = comments.map(c => {
         const cObj = c.toObject ? c.toObject() : { ...c };
         cObj.profilePicture = userMap[String(c.userId)] || null;
         cObj.replies = (cObj.replies || []).map(r => ({
            ...r,
            profilePicture: userMap[String(r.userId)] || null,
         }));
         return cObj;
      });

      res.json(enriched);
   } catch (error) {
      res.status(400).json({ message: 'Failed to fetch comments' });
   }
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
      const { comment, text, author_name } = req.body;
      const actualText = text || comment;
      const user = req.user;
      const post = await Post.findById(id);
      if (!post) {
         return res.status(400).json({ message: 'Post not found' });
      }
      
      const newCommentName = author_name || user?.username || user?.name || "Author";
      post.comments.push({ userId: user.id || user._id, text: actualText, author_name: newCommentName, replies: [] });
      await post.save();
      
      const savedComment = post.comments[post.comments.length - 1];
      
      res.json({ 
         message: 'Comment added successfully', 
         comment: {
            id: savedComment._id,
            _id: savedComment._id,
            author: savedComment.author_name,
            author_name: savedComment.author_name,
            text: savedComment.text
         }
      });
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

router.post('/:id/:commentId/react', authMiddleware, async (req, res) => {
   try {
      const { id, commentId } = req.params;
      const { emoji } = req.body;
      const user = req.user;
      
      const allowedEmojis = ['👍', '❤️', '😂', '😮', '😢'];
      if (!allowedEmojis.includes(emoji)) {
         return res.status(400).json({ message: 'Invalid emoji reaction' });
      }

      const post = await Post.findById(id);
      if (!post) return res.status(404).json({ message: 'Post not found' });

      const comment = post.comments.id(commentId);
      if (!comment) return res.status(404).json({ message: 'Comment not found' });

      if (!comment.reactions) comment.reactions = [];

      const existingReactionIndex = comment.reactions.findIndex(
         (r) => String(r.userId) === String(user.id)
      );

      if (existingReactionIndex !== -1) {
         if (comment.reactions[existingReactionIndex].emoji === emoji) {
            comment.reactions.splice(existingReactionIndex, 1);
         } else {
            comment.reactions[existingReactionIndex].emoji = emoji;
         }
      } else {
         comment.reactions.push({ userId: user.id, emoji });
      }

      await post.save();
      res.json({ message: 'Reaction toggled on comment', reactions: comment.reactions });
   } catch (error) {
      res.status(500).json({ message: 'Failed to react to comment', status: 500 });
   }
});
router.post('/:id/react', authMiddleware, async (req, res) => {
   try {
      const { id } = req.params;
      const { emoji } = req.body;
      const user = req.user;
      
      const allowedEmojis = ['👍', '❤️', '😂', '😮', '😢'];
      if (!allowedEmojis.includes(emoji)) {
         return res.status(400).json({ message: 'Invalid emoji reaction' });
      }

      const post = await Post.findById(id);
      if (!post) return res.status(404).json({ message: 'Post not found' });

      if (!post.reactions) post.reactions = [];

      const existingReactionIndex = post.reactions.findIndex(
         (r) => String(r.userId) === String(user.id)
      );

      if (existingReactionIndex !== -1) {
         if (post.reactions[existingReactionIndex].emoji === emoji) {
            post.reactions.splice(existingReactionIndex, 1);
         } else {
            post.reactions[existingReactionIndex].emoji = emoji;
         }
      } else {
         post.reactions.push({ userId: user.id, emoji });
      }

      await post.save();
      res.json({ message: 'Reaction toggled on post', reactions: post.reactions });
   } catch (error) {
      res.status(500).json({ message: 'Failed to react to post', status: 500 });
   }
});

module.exports = router;
