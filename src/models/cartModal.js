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
      ref:'Product',
      required: true
    },
    variantId:{
      type:String,
      required:true
    },
    quantity:{
      type:Number,
      required:true,
      min:1,
      default:1
    },
  }]
},{timestamps:true})

const Cart= mongoose.model('Cart',cartSchema)

export default Cart