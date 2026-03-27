const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
   {
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      text: { type: String, default: '' },
      type: { type: String, enum: ['text', 'image', 'file', 'location', 'post_link'], default: 'text' },
      image: { type: String, default: null },
      fileName: { type: String, default: null },
      fileSize: { type: Number, default: null },
      location: {
         lat: { type: Number },
         lng: { type: Number },
         label: { type: String, default: '' },
      },
      postLink: {
         postId: { type: String, default: null },
         title: { type: String, default: null },
         content: { type: String, default: null },
         image: { type: String, default: null },
      },
      replyTo: {
         _id: { type: mongoose.Schema.Types.ObjectId, default: null },
         text: { type: String, default: null },
         senderName: { type: String, default: null },
         type: { type: String, default: 'text' },
      },
      forwarded: { type: Boolean, default: false },
      originalSenderName: { type: String, default: null },
      isRead: { type: Boolean, default: false },
      sender_name: { type: String, required: true },
      reactions: {
         type: [{ userId: String, emoji: String }],
         default: [],
      },
   },
   { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
