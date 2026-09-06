import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Denormalized so the frontend doesn't need to look up usernames per message.
    username: {
      type: String,
      required: true,
    },
    // Denormalized the same way as username, so the frontend can show
    // each sender's role without a separate lookup.
    role: {
      type: String,
      enum: ["staff", "resident", "committee"],
      required: true,
    },
    text: {
      type: String,
      required: [true, "Message text is required"],
      trim: true,
      maxlength: 2000,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;