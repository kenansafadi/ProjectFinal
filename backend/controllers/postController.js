const Post = require("../model/postModel");

const createPost = async (req, res) => {
   try {
      const { title, content } = req.body;

      const payload = {
         title,
         content,
         userId: req.user.id,
      };

      if (req.file) {
         payload.image = `/uploads/${req.file.filename}`;
      }

      const post = new Post(payload);
      await post.save();

      res.status(201).json({ message: 'Post created successfully', status: 201 });
   } catch (error) {
      res.status(500).json({ message: 'Server Error', status: 500 });
   }
};

const getPosts = async (req, res) => {
   try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const { posts, totalPosts } = await require("../services/PostService").getPaginatedPosts(page, limit);
      res.status(200).json({ posts, totalPosts });
   } catch (error) {
      res.status(500).json({ message: error.message });
   }
};

const likePost = async (req, res) => {
   try {
      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).json({ message: "Post not found" });

      if (post.likes.includes(req.user.id)) {
         post.likes = post.likes.filter(id => id.toString() !== req.user.id);
      } else {
         post.likes.push(req.user.id);
      }

      await post.save();
      res.status(200).json(post);
   } catch (error) {
      res.status(500).json({ message: error.message });
   }
};

const addComment = async (req, res) => {
   try {
      const { text } = req.body;
      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).json({ message: "Post not found" });

      post.comments.push({ user: req.user.id, text });
      await post.save();

      res.status(201).json({ message: "Comment added", post });
   } catch (error) {
      res.status(500).json({ message: error.message });
   }
};

const deletePost = async (req, res) => {
   try {
      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).json({ message: "Post not found" });

      if (String(post.userId) !== req.user.id) {
         return res.status(403).json({ message: "You are not authorized to delete this post" });
      }

      await Post.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: "Post deleted successfully" });
   } catch (error) {
      res.status(500).json({ message: error.message });
   }
};

module.exports = { createPost, getPosts, deletePost, likePost, addComment };
