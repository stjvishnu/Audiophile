import mongoose from 'mongoose'

const offerSchema = new mongoose.Schema({
  offerTitle:{
    type:String,
    required:true,
    unique:true
  },
  description:{
    type:String,
    required:true
  },
  offerType:{
    type:String,
    enum:['category','product','festival'],
    required:true
  },
 discountType:{
  type:String,
  enum:['percentage','fixed'],
  required:true
 },
  discountValue:{
    type:Number,
    required:true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  
  targetSku: {
    type: String,
    default: null
  },
  targetName:{
    type: String,
    default: null
  },
  validFrom:{
    type:Date,
    required:true
  },
  validTo:{
    type:Date,
    required:true
  },
  isActive:{
    type:Boolean,
    required:true
  },
  isDelete:{
    type:Boolean,
    required:false
  }
},{timestamps:true})

const Offer = mongoose.model('Offer',offerSchema)

export default Offer