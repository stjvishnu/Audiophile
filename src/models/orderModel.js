import mongoose from 'mongoose';

const orderSchema =  new mongoose.Schema({
  userId:{
    type: mongoose.Schema.Types.ObjectId,
    ref:'User',
    required:true
  },
  items:[{
    productId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'Product',
      required:true
    },
    variantId:{
      type:String,
      required:true
    },
    productName:String,
    productImage:String,
    sku:String,
    priceAtPurchase:Number,
    quantity:Number,
    totalPrice:Number,
  }
],
shippingAddress:{
  fullName:String,
  mobile:String,
  pincode:String,
  locality:String,
  streetName:String,
  houseName:String,
  city:String,
  state:String,
  landmark:String
},
payment:{
  method:{
    type:String,
    enum:['cod','razorpay','wallet'],
    required:true
  },
  status:{
    type:String,
    enum:['pending','paid','failed','refunded'],
    default:'pending'
  }
},
orderStatus:{
  type:String,
  enum:['processing','shipped','delivered','cancelled','returned'],
  default:'processing'
},
subTotal:Number,
discount:Number,
Total:Number,

},
{timestamps:true});

const order = mongoose.model('order',orderSchema)