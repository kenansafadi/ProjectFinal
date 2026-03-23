const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
   {
      userId: {
         type: String,
         required: true,
      },
      text: {
         type: String,
         required: true,
      },
      message: {
         type: String,
         required: false,
      },
      read: {
         type: Boolean,
         default: false,
      },
      sender_name: {
         type: String,
         required: true,
      },
      senderId: {
         type: String,
         required: false,
      },
      type: {
         type: String,
         required: false,
         default: 'notification',
      },
   },
   { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
