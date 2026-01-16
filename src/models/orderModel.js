import mongoose from 'mongoose';
import Counter from '../models/counterModal.js'

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
    itemStatus:{
      type:String,
      enum:['delivered','cancelled','return-requested','return-rejected','returned'],
    },
    itemReturnReason:{
      type:String,
    },
    categoryName:{
      type:String,
      required:true
    },
    brandName:{
      type:String,
      required:true
    },
    
    productName:String,
    productImage:String,
    productColor:String,
    sku:String,
    priceAtPurchase:Number,
    quantity:Number,
    totalPrice:Number,
    offerApplied:Boolean,
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
    enum:['pending','paid','not_paid','failed','refunded'],
    default:'pending'
  }
},
orderNumber:{
  type:String,
  unique:true
},
orderStatus:{
  type:String,
  enum:['processing','shipped','out for delivery','delivered','cancelled','returned','partial-return'],
  default:'processing'
},
reason:{
  type:String,
  default:null
},
deliveryCharge:Number,
subTotal:Number,
discount:Number,
total:Number,
finalPayableAmount:Number,
couponApplied:Boolean,
couponDiscount:Number,
},
{timestamps:true});

// Pre-save middleware
orderSchema.pre('save', async function (next) {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'orderId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    this.orderNumber = `AID-${counter.seq}`;
  }

  next();
});

const order = mongoose.model('order',orderSchema)

 export default order