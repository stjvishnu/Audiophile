import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },

  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,

  amount: Number,
  currency: String,

  status: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending",
  },
});

const payment = mongoose.model('payment',paymentSchema)

export default payment
