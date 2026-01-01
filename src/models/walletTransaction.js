import mongoose from "mongoose";

const walletTransactionSchema = new mongoose.Schema({
  walletId: {
    type: mongoose.Types.ObjectId,
    ref: "Wallet",
    required: true
  },
  type: {
    type: String,
    enum: ["credit", "debit"],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  userName:{
    type:String,
    default:null,
  },
  orderId: {
    type: String,
    default: null
  },
  balanceAfter: {  // new extra field
    type: Number,
    required: true
  }
}, { timestamps: true });

const WalletTransaction = mongoose.model("WalletTransaction", walletTransactionSchema);

export default WalletTransaction