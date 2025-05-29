import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name:{
    type: String,
    require : true,
  },
  subCategory:{
    type:String,
    enum: ["Beginner","Intermediate","Advanced"]
  },
  isActive:{
    type:Boolean,
    default:true
  }
},
  {
    timestamps:true
  }
)

const category = mongoose.model("Category",categorySchema)


export default category;