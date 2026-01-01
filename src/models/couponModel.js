import mongoose from 'mongoose'

const couponSchema = new mongoose.Schema({
  code:{
    type:String,
    required:true,
    unique:true,
    uppercase:true,
  },
  discountType:{
    type:String,
    enum:['percentage','fixed'],
    required:true
  },
  description:{
    type:String,
    required:true
  },
  discountValue:{
    type:Number,
    required:true
  },
  minPurchase:{
    type:Number,
    required:true
  },
  maxDiscount:{
    type:Number,
    required:true
  },
  validFrom:{
    type:Date,
    required:true
  },
  validTo:{
    type:Date,
    required:true
  },
  usageLimit:{
    type:Number,
    required:true,
    default:1
  },
  isActive:{
    type:Boolean,
    required:true
  },
  isDelete:{
    type:Boolean,
    required:false
  },
  usedBy: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    usedAt: { type: Date, default: Date.now }
  }]
  
},{timestamps:true})

const Coupon = mongoose.model('Coupon',couponSchema)

export default Coupon