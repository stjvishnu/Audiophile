import mongoose from "mongoose";

// Declare the Schema of the Mongo model
const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        unique:true,
        
    }, 
    lastName:{
      type:String,
      required:true,
      
  },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        
    },
    mobile:{
        type:String,
        required:true,
        
       
    },
    password:{
        type:String,
        required:true,
    },
  
});

const user=mongoose.model("User",userSchema)

//Export the model
export default user;