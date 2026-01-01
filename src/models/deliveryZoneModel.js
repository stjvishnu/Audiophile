import mongoose from "mongoose";

const deliveryZoneSchema = new mongoose.Schema({
  pincode:{
    type:String,
    required:true,
    trim: true
  },
  charge:{
    type:Number,
    required:true,
    trim: true
  }
})

const DeliveryZone = mongoose.model('DeliveryZone',deliveryZoneSchema)

export default DeliveryZone