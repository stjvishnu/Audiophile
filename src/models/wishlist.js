import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({
  user:{
    type:mongoose.Types.ObjectId,
    ref:'User',
    required:true,
    unique:true
  },
  items:[{
    productId:{
      type:mongoose.Types.ObjectId,
      ref:'Products',
    },
    variantId:{
      type:String,
      required:true
    }
    
  }],
},{timestamps:true})

const wishlist = mongoose.model('Wishlist',wishlistSchema)

export default wishlist

