const express = require("express");
const authMiddleware = require("../middleware/auth");
const { User } = require('../model/usersModel');
const { hashPassword } = require('../utils');
const Notification = require('../model/Notification');

const router = express.Router();

router.get('/users', authMiddleware, async (req, res) => {
   try {
      const users = await User.find({}, '_id username');
      res.json(users || []);
   } catch (error) {
      return res.status(400).json({ message: 'Notifications not found', status: 400 });
   }
});

router.get('/followers', authMiddleware, async (req, res) => {
   try {
      const user = req.user;

      const userData = await User.findById(user.id, 'followers');

      if (!userData) {
         return res.status(400).json({ message: 'User not found', status: 400 });
      }

      // const followers = userData.followers.filter((follower) => follower.isAccepted);

      res.json(userData.followers || []);
   } catch (error) {
      return res.status(400).json({ message: 'Followers not found', status: 400 });
   }
});

router.get('/me', authMiddleware, async (req, res) => {
   try {
      const user = req.user;
      const userData = await User.findById(
         user.id,
         'profilePicture username email followers following _id'
      );

      if (!userData) {
         return res.status(400).json({ message: 'User not found', status: 400 });
      }
      res.json(userData || null);
   } catch (error) {
      console.log(error);
      return res.status(400).json({ message: 'User not found', status: 400 });
   }
});

router.put('/update', authMiddleware, async (req, res) => {
   try {
      const authUser = req.user;
      const { name, password } = req.body;
      const user = await User.findById(authUser.id);

      if (!user) {
         return res.status(400).json({ message: 'User not found', status: 400 });
      }

      if (password) {
         user.password = await hashPassword(password);
      }

      if (name) {
         user.name = name;
      }

      await user.save();

      res.json({
         message: 'User updated successfully',
         status: 200,
         data: {
            name: user.name,
         },
      });
   } catch (error) {
      return res.status(400).json({ message: 'User not found', status: 400 });
   }
});

router.get('/:id', authMiddleware, async (req, res) => {
   try {
      const { id } = req.params;
      const user = await User.findById(id);
      res.json(user);
   } catch (error) {
      return res.status(400).json({ message: 'Users not found', status: 400 });
   }
});

router.post('/follow', authMiddleware, async (req, res) => {
   try {
      const user = req.user;
      const { userId, name } = req.body;

      const userData = await User.findById(user.id);

      if (!userData) {
         return res.status(400).json({ message: 'User not found', status: 400 });
      }

      const targetUser = await User.findById(userId);

      if (!targetUser) {
         return res.status(400).json({ message: 'User you want to follow not found', status: 400 });
      }

      if (userData?.following?.some((following) => following.userId == user.id)) {
         return res.status(400).json({ message: 'User already followed', status: 400 });
      }

      if (!userData.following) {
         userData.following = [];
      }

      if (!targetUser.followers) {
         targetUser.followers = [];
      }

      userData.following.push({ userId: userId, name: name, isAccepted: false });
      targetUser.followers.push({ userId: user.id, name: user.username, isAccepted: false });

      const notification = new Notification({
         userId: userId,
         message: `${user.username} sent you a friend request`,
         sender_name: user.username,
         read: false,
         text: `${user.username} sent you a friend request`,
      });

      await userData.save();
      await targetUser.save();
      await notification.save();

      res.json({ message: 'User followed successfully', status: 200 });
   } catch (error) {
      return res.status(400).json({ message: 'Follow failed', status: 400 });
   }
});

router.post('/unfollow', authMiddleware, async (req, res) => {
   try {
      const user = req.user;
      const { userId } = req.body;

      const userData = await User.findById(user.id);
      if (!userData) {
         return res.status(400).json({ message: 'User not found', status: 400 });
      }

      const targetUser = await User.findById(userId);
      if (!targetUser) {
         return res
            .status(400)
            .json({ message: 'User you want to unfollow not found', status: 400 });
      }

      if (!userData.following?.some((following) => following.userId == userId)) {
         return res.status(400).json({ message: 'User not followed', status: 400 });
      }

      userData.following = userData?.following?.filter((following) => following.userId != userId);
      targetUser.followers = targetUser?.followers?.filter(
         (follower) => follower.userId != user.id
      );

      const notification = new Notification({
         userId: userId,
         message: `${user.username} unfollowed you`,
         sender_name: user.username,
         read: false,
         text: `${user.username} unfollowed you`,
      });

      await userData.save();
      await targetUser.save();
      await notification.save();

      res.json({ message: 'User unfollowed successfully', status: 200 });
   } catch (error) {
      console.log(error);
      return res.status(400).json({ message: 'Unfollow failed', status: 500 });
   }
});

router.post('/accept-friend-request', authMiddleware, async (req, res) => {
   try {
      const user = req.user;
      const { userId } = req.body;
      const userData = await User.findById(user.id);
      if (!userData) {
         return res.status(400).json({ message: 'User not found', status: 400 });
      }
      const targetUser = await User.findById(userId);
      if (!targetUser) {
         return res.status(400).json({ message: 'User not found', status: 400 });
      }

      if (!userData.followers?.some((follower) => follower.userId == userId)) {
         return res.status(400).json({ message: 'Friend request not found', status: 400 });
      }

      userData.followers = userData.followers.map((follower) => {
         if (follower.userId == userId) {
            follower.isAccepted = true;
         }
         return follower;
      });

      targetUser.following = targetUser.following.map((follower) => {
         if (follower.userId == user.id) {
            follower.isAccepted = true;
         }
         return follower;
      });

      const notification = new Notification({
         userId: userId,
         message: `${user.username} accepted your friend request`,
         sender_name: user.username,
         read: false,
         text: `${user.username} accepted your friend request`,
      });

      await userData.save();
      await targetUser.save();
      await notification.save();
      return res.status(200).json({ message: 'Friend request accepted', status: 200 });
   } catch (error) {
      return res.status(400).json({ message: 'Friend request not accepted', status: 400 });
   }
});

router.post('/reject-friend-request', authMiddleware, async (req, res) => {
   try {
      const user = req.user;
      const { userId } = req.body;

      const userData = await User.findById(user.id);
      if (!userData) {
         return res.status(400).json({ message: 'User not found', status: 400 });
      }

      const targetUser = await User.findById(userId);
      if (!targetUser) {
         return res
            .status(400)
            .json({ message: 'User you want to unfollow not found', status: 400 });
      }

      userData.followers = userData?.followers?.map((following) => {
         if (following.userId == userId) {
            following.isAccepted = false;
         }
         return following;
      });

      targetUser.following = targetUser?.following?.map((following) => {
         if (following.userId == user.id) {
            following.isAccepted = false;
         }
         return following;
      });

      const notification = new Notification({
         userId: userId,
         message: `${user.username} rejected your friend request`,
         sender_name: user.username,
         read: false,
         text: `${user.username} rejected your friend request`,
      });

      await userData.save();
      await targetUser.save();
      await notification.save();

      res.json({ message: 'Friend request rejected successfully', status: 200 });
   } catch (error) {
      return res.status(400).json({ message: 'Friend request not rejected', status: 400 });
   }
});

module.exports = router;
