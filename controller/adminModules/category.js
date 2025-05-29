import Category from '../../models/categoryModel.js';

const getCategory = async (req,res)=>{
  try{
    const categories = await Category.find({})
  res.render('admin/categories.ejs',{categories,layout:"layouts/admin-dashboard-layout",pageTitle :"Category"})
  }
  catch(err){
    console.log("Error in getCategory",err);
  
  }

  
}

const addCategory = async (req,res)=>{
  const data = req.body;
  const category = new Category(data)
  await category.save();
  const categoryData = await Category.find({});
  console.log(categoryData);
  res.json({message:"success"})
} 

const editCategory = async (req,res)=>{

  try{
    const id = req.params.id;
    const updatedData  = req.body;
    const category = await Category.findById(id);
    if(!category){
      res.json({message:"This category didn't exist"})
    }
    await Category.findByIdAndUpdate(id,updatedData,{new:true, runValidators: true });
    
  
    res.json({message:"Category updated"})
  }
  catch(err){
    console.log("Error in editCategory",err);
    res.json({message:"Error in editing category"});
  }
 
}

const deleteCategory = async(req,res)=>{
  try{
    const id = req.params.id;
    const category = await Category.findById(id);
    if(!category){
      res.json({message:"Category not found"});
    }
    await Category.findByIdAndDelete(id)
    res.json({message:"Deletion Successfull"})
  }
  catch(err){
    console.log("error in delete category",err);
    res.json({message:"Erro in deleting"})
  }
 
}

export default {
  getCategory,
  addCategory,
  editCategory,
  deleteCategory,
}