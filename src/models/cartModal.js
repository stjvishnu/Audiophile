import mongoose from 'mongoose';
import User from "./userModel.js";

const cartSchema = new mongoose.Schema({
  userId:{
    type:mongoose.Types.ObjectId,
    ref:'User',
    required:true,
    unique:true,
  },
  items:[{
    productId:{
      type:mongoose.Types.ObjectId,
      ref:'Products',
      required: true
    },
    variantId:{
      type:String,
      required:true
    },
    category:{
      type:String,
      required:true
    },
    quantity:{
      type:Number,
      required:true,
      min:1,
      default:1
    },
    currentPrice:{
      type:Number,
      required:true,
    },
    totalPrice:{
      type:Number,
      required:true,
    }
  }]
},{timestamps:true})

const Cart= mongoose.model('Cart',cartSchema)

export default Cart