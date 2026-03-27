const Message = require("../model/MessageModel");

// SEND MESSAGE
const sendMessage = async (req, res) => {
    try {
        const { receiver, text } = req.body;

        // Ensure receiver and text are provided
        if (!receiver || !text) {
            return res.status(400).json({ message: "Receiver and text are required" });
        }

        // תצור את המסר החדש עם השולח (המשתמש הנוכחי), המקבל והטקסט
        const message = new Message({
            sender: req.user.id,  // ההמשתמש הנוכחי הוא השולח
            receiver,             // המשתמש שמקבל את ההודעה
            text,                 // התוכן של ההודעה
        });

        // לשמור את ההודעה במסד הנתונים ולשלוח אותה בחזרה בתגובה
        await message.save();
        res.status(201).json(message);  
    } catch (error) {
        res.status(500).json({ message: error.message });  // לתפוס ולהחזיר כל שגיאה
    }
};

// לקבל את כל ההודעות בין המשתמש הנוכחי למשתמש אחר
const getMessages = async (req, res) => {
    try {
        const { userId } = req.params;  // לקבל את מזהה המשתמש השני מהפרמטרים של הבקשה
        const senderId = req.user.id;  // לקבל את מזהה המשתמש הנוכחי מהאובייקט של הבקשה (שנוצר על ידי האמצעי אימות)

        // למצוא את כל ההודעות שבהן המשתמש הנוכחי הוא השולח והמשתמש השני הוא המקבל, או להפך
        const messages = await Message.find({
            $or: [
                { sender: senderId, receiver: userId },  // להודעות שבהן המשתמש הנוכחי הוא השולח והמשתמש השני הוא המקבל
                { sender: userId, receiver: senderId },  // להודעות שבהן המשתמש השני הוא השולח והמשתמש הנוכחי הוא המקבל
            ]
        }).sort({ createdAt: 1 }); 

        res.status(200).json(messages);  
    } catch (error) {
        res.status(500).json({ message: error.message });  
    }
};

// לסמן את כל ההודעות ממשתמש מסוים כ"נראה"
const markMessagesAsSeen = async (req, res) => {
    try {
        const { userId } = req.params;  // לקבל את מזהה המשתמש השני מהפרמטרים של הבקשה

        // לעדכן את כל ההודעות שבהן המשתמש הנוכחי הוא המקבל והמשתמש השני הוא השולח, ולסמן אותן כ"נראה"
        await Message.updateMany(
            { receiver: req.user.id, sender: userId, seen: false },
            { seen: true }
        );

        res.status(200).json({ message: "Messages marked as seen" });  // להחזיר תגובה שמאשרת שההודעות סומנו כ"נראה"
    } catch (error) {
        res.status(500).json({ message: error.message });  
    }
};

module.exports = { sendMessage, getMessages, markMessagesAsSeen };
