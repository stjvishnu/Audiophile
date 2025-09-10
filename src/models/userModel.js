import mongoose from "mongoose";

// Declare the Schema of the Mongo model
const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        
    }, 
    lastName:{
      type:String,
      required:true,
      
  },
    email:{
        type:String,
        required:true,
        lowercase:true,
        
    },
    mobile:{
        type:String,
        default:null,
        
       
    },
    password:{
        type:String,
        default:null,
    },
    otp:{
        type:String
    },
    otpExpiry:{
        type:Date
    },
    isActive:{
        type: Boolean,
        default:true
    },
    googleID:{
        type : String,
    }
  
});

const user=mongoose.model("User",userSchema)

//Export the model
export default user;