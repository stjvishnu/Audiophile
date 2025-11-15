import mongoose from "mongoose";

const addressSchema =  new mongoose.Schema({
  userId:{type:mongoose.Types.ObjectId,ref:'User',required:true},
  name:{type:String,required:true},
  mobile:{type:Number,required:true},
  pincode:{type:Number,required:true},
  locality:{type:String,required:true},
  streetName:{type:String,required:true},
  houseName:{type:String,required:true},
  city:{type:String,required:true},
  state:{type:String,required:true},
  landmark:{type:String},
  isDefault:{type:Boolean,default:false}
},
{timestamps:true},
)

const address = mongoose.model('Address',addressSchema)

export default address