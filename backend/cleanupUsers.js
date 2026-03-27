require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const { User } = require('./model/usersModel');
const Post = require('./model/postModel');
const Message = require('./model/MessageModel');
const Notification = require('./model/Notification');
const { Auth } = require('./model/authModel');

const targetIdentifiers = process.argv.slice(2);

if (!targetIdentifiers.length) {
   console.log('\n❌ Please provide emails or usernames to delete.');
   console.log('Usage: node cleanupUsers.js <email_or_username1> <email_or_username2> ...\n');
   process.exit(1);
}

const connectDB = async () => {
   try {
      const uri = process.env.CONNECTION_ATLAS || process.env.MONGO_URI;
      if (!uri) {
         throw new Error("CONNECTION_ATLAS or MONGO_URI not found in environment variables.");
      }
      await mongoose.connect(uri, {
         useNewUrlParser: true,
         useUnifiedTopology: true,
      });
      console.log('✅ Connected to MongoDB\n');
   } catch (error) {
      console.error('❌ MongoDB Connection Error:', error);
      process.exit(1);
   }
};

const cleanupUser = async (identifier) => {
   try {
      const user = await User.findOne({
         $or: [{ email: identifier }, { username: identifier }]
      });

      if (!user) {
         console.log(`⚠️ User not found for identifier: ${identifier}`);
         return;
      }

      const userIdObj = user._id;
      const userIdStr = userIdObj.toString();

      console.log(`\n🗑️  Starting cleanup for: ${user.username} (${user.email}) [ID: ${userIdStr}]`);

      // 1. Find all posts created by the user, and remove them from EVERYONE's bookmarks
      const userPosts = await Post.find({ userId: userIdObj }, '_id');
      const userPostIds = userPosts.map(p => p._id.toString());
      if (userPostIds.length > 0) {
         await User.updateMany({}, { $pullAll: { bookmarks: userPostIds } });
      }

      // Delete the actual posts
      const postDeleteResult = await Post.deleteMany({ userId: userIdObj });
      console.log(`  - Deleted ${postDeleteResult.deletedCount} posts (and removed them from bookmarks).`);

      // 2. Remove the user's likes, reactions, and top-level comments from all other posts
      await Post.updateMany({}, { 
         $pull: { 
            likes: userIdStr,
            reactions: { userId: userIdObj },
            comments: { userId: userIdObj }
         } 
      });
      
      // 3. Remove the user's replies and reactions from *inside* other people's comments
      await Post.updateMany(
         {},
         {
            $pull: {
               "comments.$[].reactions": { userId: userIdObj },
               "comments.$[].replies": { userId: userIdObj }
            }
         }
      );

      console.log(`  - Removed likes, comments, and reactions from other posts.`);

      // 5. Delete all messages involving this user (either as sender or receiver)
      const messageDeleteResult = await Message.deleteMany({
         $or: [{ senderId: userIdObj }, { receiverId: userIdObj }]
      });
      console.log(`  - Deleted ${messageDeleteResult.deletedCount} private messages.`);

      // 6. Delete notifications sent to or from this user
      const notifDeleteResult = await Notification.deleteMany({
         $or: [{ userId: userIdStr }, { senderId: userIdStr }]
      });
      console.log(`  - Deleted ${notifDeleteResult.deletedCount} notifications.`);

      // 7. Remove the user from everyone's followers and following lists
      await User.updateMany({}, {
         $pull: {
            followers: { userId: userIdObj },
            following: { userId: userIdObj }
         }
      });
      console.log(`  - Removed from followers/following graphs.`);

      // 8. Delete from the Auth collection
      const authDeleteResult = await Auth.deleteMany({ email: user.email });
      if (authDeleteResult.deletedCount > 0) {
         console.log(`  - Deleted from old Auth schema.`);
      }

      // 9. Finally, delete the User document itself
      await User.findByIdAndDelete(userIdObj);
      console.log(`✅ User ${user.username} deleted entirely.`);

   } catch (error) {
      console.error(`❌ Error cleaning up ${identifier}:`, error.message);
   }
};

const run = async () => {
   await connectDB();
   
   for (const identifier of targetIdentifiers) {
      await cleanupUser(identifier);
   }
   
   console.log('\n🎉 All requested cleanups finished.\n');
   process.exit(0);
};

run();
