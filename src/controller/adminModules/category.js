import  mongoose  from 'mongoose'
import Category from '../../models/categoryModel.js';
import Products from '../../models/productModel.js'
import { HTTP_STATUS,RESPONSE_MESSAGES } from '../../utils/constants.js'
const getCategory = async (req,res)=>{
  try{

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page -1) * limit;
    
    const totalCategories = await Category.countDocuments();
    const totalPages = Math.ceil(totalCategories/limit);


    const categories = await Category.find().sort({createdAt:-1}).skip(skip).limit(limit);
    res.status(HTTP_STATUS.OK).render('admin/categories.ejs',{categories,layout:"layouts/admin-dashboard-layout",pageTitle :"Category",currentPage:page,totalPages:totalPages})
  }
  catch(err){
    console.log("Error in getCategory",err);
  
  }

  
}


//-------------- add Category ---------------------------

/**
 * Create a new category document in the Category Scheme
 * 
 * @param {Object} req - Express request object that holds fomr data
 * @param {Object} res - Express response object 
 * 
 */

const addCategory = async (req,res)=>{

  try{
    const {name}= req.body;
   const categoryExist= await Category.findOne({name});
   if(categoryExist){
    return res.status(HTTP_STATUS.BAD_REQUEST).json({message:'Category Already Exists'});
   }
    const category = new Category({name}) //create a new document
    await category.save(); //save the document to collection the tha model is mapped to
    res.status(HTTP_STATUS.OK).json({message:"New Category Added"})
  }catch(err){
    console.log('Add Category',err);
    res.status(HTTP_STATUS.BAD_REQUEST).json({message:"Error in Adding Category"})
  }

} 

//-------------------------------------------------------



const editCategory = async (req,res)=>{
  try{
    const categoryId = req.params.id;
    const {name}  = req.body; 
    const categoryExists = await Category.findOne({name});
    if(categoryExists){
      return res.status(HTTP_STATUS.CONFLICT).json({message:'Category Already Exists'})
    }
    const category = await Category.findById(categoryId);
    if(!category){
      res.status(HTTP_STATUS.NOT_FOUND).json({message:"This category didn't exist"})
    }
    await Category.findByIdAndUpdate(categoryId,{name},{new:true, runValidators: true });
    
  
    res.status(HTTP_STATUS.OK).json({message:"Category updated"})
  }
  catch(err){
    console.log("Error in editCategory",err);
    res.json({message:"Error in editing category"});
  }
 
}


//-------------------------------------------------------

//-------- Delete Category ------------------------------

/**
 * Soft deleting a category by setting 'isDeleted'  field to true
 * 
 * @async
 * @function deleteCategory
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {string} req.params.currentCategoryId - The Id of the category to delete.
 * @returns {Promise<void>} Sends a JSON response with the status message
 * 
 * @description
 * This function performs a soft delete operation on a category.
 * 1.Extracts category ID from the request parameters.
 * 2.Find the category by ID using Mongoose's 'findById.
 * 3.If the category is found,sets its 'isDeleted' property to 'true' and saves the document.
 * 4.Sends a JSON response indicating the result.
 * 
 */


//whle deleting category ,delete products under stock less than 5

const deleteCategory = async(req,res)=>{
  try{
    const categoryId = req.params.id;
    if(!mongoose.Types.ObjectId.isValid(categoryId)){
      return res.status(HTTP_STATUS.BAD_REQUEST).json({message:'Invalid Category ID'})
    }
    const category = await Category.findById(categoryId);
    if(!category){
      res.json({message:"Category not found"});
    }

    
    await Category.findByIdAndUpdate(categoryId,{isDeleted:true})
    await Products.updateMany({category:categoryId},{isDeleted:true})
    res.status(HTTP_STATUS.OK).json({message:"Category Deleted Successfully"})
  } 
  catch(err){
    console.log("Delete Category",err);
    res.status(HTTP_STATUS.BAD_REQUEST).json({message:"Error in deleting Category"})
  }
 
}


const restoreCategory = async(req,res)=>{
  try{
    const categoryId = req.params.id;
    if(!mongoose.Types.ObjectId.isValid(categoryId)){
      return res.status(HTTP_STATUS.BAD_REQUEST).json({message:'Invalid Category ID'})
    }
    const category = await Category.findById(categoryId);
    if(!category){
      res.json({message:"Category not found"});
    }
    await Category.findByIdAndUpdate(categoryId,{isDeleted:false})
    await Products.updateMany({category:categoryId},{isDeleted:false})
    res.status(HTTP_STATUS.OK).json({message:"Category Restored Successfully"})
  }
  catch(err){
    console.log("Restore Category",err);
    res.status(HTTP_STATUS.BAD_REQUEST).json({message:"Error in Restoring Category"})
  }
 
}









const blockCategory = async (req,res)=>{
  try{
    const categoryId=req.params.id;
    if(!mongoose.Types.ObjectId.isValid(categoryId)){
      return res.status(HTTP_STATUS.BAD_REQUEST).json({message:'Invalid Category ID'})
    }
    const category = Category.findById(categoryId);
    if(!category){
      return res.status(HTTP_STATUS.BAD_REQUEST).json({message:"Category Doesn't Exist"})
    }
    await Category.findByIdAndUpdate(categoryId,{isActive:false})
    await Products.updateMany({category:categoryId},{isActive:false})
    res.status(HTTP_STATUS.OK).json({message:'Category blocked successfully'})
  }catch(err){
    console.log('Block Category',err);
    res.status(HTTP_STATUS.BAD_REQUEST).json({message:"Error in Blocking Category"})
  }
}

const unblockCategory = async (req,res)=>{
  try{
    const categoryId=req.params.id;
    if(!mongoose.Types.ObjectId.isValid(categoryId)){
      return res.status(HTTP_STATUS.BAD_REQUEST).json({message:'Invalid Category ID'})
    }
    const category = Category.findById(categoryId);
    if(!category){
      return res.status(HTTP_STATUS.BAD_REQUEST).json({message:"Category Doesn't Exist"})
    }
    await Category.findByIdAndUpdate(categoryId,{isActive:true})
    await Products.updateMany({category:categoryId},{isActive:true})
    res.status(HTTP_STATUS.OK).json({message:'Category blocked successfully'})
  }catch(err){
    console.log('Block Category',err);
    res.status(HTTP_STATUS.BAD_REQUEST).json({message:"Error in Blocking Category"})
  }
}

export default {
  getCategory,
  addCategory,
  editCategory,
  deleteCategory,
  restoreCategory,
  blockCategory,
  unblockCategory
}