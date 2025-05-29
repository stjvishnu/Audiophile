import mongoose from "mongoose";
import User from "./userModel.js";
import Category from "./categoryModel.js";
import Variants from "./variantModel.js"

const productSchema = new mongoose.Schema({
  name:{
    type:String,
    required:true,
  },
  category:{
    type:mongoose.Types.ObjectId,
    ref:"Category",
    required:true,
  },
  subCategory:{
    type: String,
    enum:["Beginner","Intermediate","Advanced"],
    required:true,
  },
  brand:{
    type:String,
    required: true,
  },
  price:{
    type:Number,
    required:true,
  },
  stock:{
    type:Number,
    required:true
  },
  discount:{
    type:Number,
    required:true
  },
  discountedPrice:{
    type:Number,
    required:true
  },
  description1:{
    type:String,
    required:true
  },
  description2:{
    type:String,
  
  },
  isDeleted:{
    type:Boolean,
    default:false,
  },
  isActive:{
    type:Boolean,
    required:true,
  },
  productImages :{
    type:[String],
    required : true
  },
  productsDetails:{
    driver: String,
    driverConfiguration: String,
    impedance: String,
    plug: String,
    microphone: String,
  },
  variants : [{
    type : mongoose.Types.ObjectId,
    ref : "Variants",
    default:[],
  }],
},
{
  timestamps:true,
},

)

const product = mongoose.model('Products',productSchema)

export default product;

