import mongoose from "mongoose";
import Category from "./categoryModel.js";

const subCategorySchema = mongoose.Schema({
  name:{
    type: String,
    require:true
  },
  
    parentCategory:{
      type : mongoose.SchemaTypes.ObjectId,
      ref : "Category", // References the Category model
      require: true
    }
  ,
  addon:{
    type: Date,
    default : Date.now,
  },
  updatedOn:{
    type: Date,
    default : Date.now,
  },
  
},
{
  timestamps : true
})

// Middleware to update `updatedOn` before saving
subCategorySchema.pre('save',function (next){
  this.updatedOn = Date.now();
  next();
})

const SubCategory = mongoose.model('SubCategory',subCategorySchema);

export default SubCategory;