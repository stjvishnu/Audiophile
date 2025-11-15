import mongoose from "mongoose";
import User from "./userModel.js";
import Category from "./categoryModel.js";


const productSchema = new mongoose.Schema({

  name:{
    type:String,
    required:true,
  },
  brand:{
    type:String,
    required: true,
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
  isActive:{
    type:Boolean,
    default:true
  },
  description1:{
    type:String,
    required:true,
  },
  description2:{
    type:String,
  
  },
  productDetails:{
    driver: String,
    driverConfiguration: String,
    impedance: String,
    soundSignature : String,
    mic: String,
  },
  variants:[
    {
      sku:{type:String,required:true},
      attributes:{
        color:{type:String,required:true},
        plug:{type:String,required:true},
        mic:{type:Boolean,required:true},
        stock:{type:Number,required:true},
        price:{type:Number,required:true},
        discount:{type:Number,required:true},
        isActive:{type:Boolean,default:true},
        isDeleted:{type:Boolean,default:false},
        productImages :[String],
        isWishlisted:{type:Boolean,default:false }
      },
  
      
    }
  ],
 
  isDeleted:{
    type:Boolean,
    default:false
  }
},
{
  timestamps:true,
},

)

const product = mongoose.model('Products',productSchema)

export default product;

