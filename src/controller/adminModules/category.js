import  mongoose  from 'mongoose'
import Category from '../../models/categoryModel.js';
import Products from '../../models/productModel.js'
import { HTTP_STATUS,RESPONSE_MESSAGES } from '../../utils/constants.js'


/* ===============================
   CATEGORY CONTROLLERS
   =============================== */


//------------- Get Categories ------------//

/**
 * Fetches paginated list of categories for admin panel
 * @route GET /admin/category
 * @access Admin
 */

const getCategory = async (req,res)=>{
  try{
     // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page -1) * limit;
    
    // Total count for pagination UI
    const totalCategories = await Category.countDocuments();
    const totalPages = Math.ceil(totalCategories/limit);

     // Fetch categories sorted by latest first
    const categories = await Category.find().sort({createdAt:-1}).skip(skip).limit(limit);
    res.status(HTTP_STATUS.OK).render('admin/categories.ejs',{
      categories,
      layout:"layouts/admin-dashboard-layout",
      pageTitle :"Category",
      currentPage:page,
      totalPages:totalPages})
  }
  catch(err){
    console.log("Error in getCategory",err);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message:RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      customMessage:'Request Failed !'
    })
  }  
}


//------------- Add Category ------------//

/**
 * Creates a new category
 * @route POST /admin/category/add
 * @access Admin
 */

const addCategory = async (req,res)=>{
  try{
      const {name}= req.body;
      const categoryName = name.toLowerCase().trim();

      // Validation: empty name
      if(!name || name.trim() === ''){
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          message:RESPONSE_MESSAGES.BAD_REQUEST,
          customMessage:'Category name cannot be empty'
        });
      }

      // Check for duplicate category
      const categoryExist= await Category.findOne({name:categoryName});
      if(categoryExist){
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          message:RESPONSE_MESSAGES.BAD_REQUEST,
          customMessage:'Category Already Exists'
        });
      }

      const category = new Category({name}) //create a new document
      await category.save(); //save the document to collection the tha model is mapped to
      res.status(HTTP_STATUS.OK).json({
        message:RESPONSE_MESSAGES.CREATED,
        customMessage:'Category Created'
      })
  }catch(err){
      console.log('Error in Add Category',err);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        message:RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        customMessage:"Request Failed, try again latee"
      })
  }

} 


//------------- Add Category ------------//



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

const searchCategory = async (req,res)=>{
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page -1) * limit;
  console.log('req.query',req.query);
  console.log('Search Categories');
  try {
    const {searchTerm} = req.query;
    const categories = await Category.find({
      name:{$regex:searchTerm,$options:'i'}
    }).skip(skip).limit(limit)

    if(categories.length==0){
      return res.status(HTTP_STATUS.OK).json([]);
    }
    res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,categories})
  } catch (error) {
    console.log('Error in search category',error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message:RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR});

  }
}



const loadCategories = async (req,res)=>{
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page-1) * limit;
    const totalDocuments = await Category.countDocuments()
    const totalPages = Math.ceil(totalDocuments / limit); 
    const categories = await Category.find({}).sort({createdAt:-1}).skip(skip).limit(limit);
    res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,categories})
  } catch (error) {
    console.log('Error in load Categories',error);
  }
}



export default {
  getCategory,
  addCategory,
  editCategory,
  deleteCategory,
  restoreCategory,
  blockCategory,
  unblockCategory,
  searchCategory,
  loadCategories
}