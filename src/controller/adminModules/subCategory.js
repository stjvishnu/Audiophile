import SubCategory  from "../../models/subCategoryModel.js";
import Category from "../../models/categoryModel.js";

const getSubCategory = async (req,res)=>{

  try{
    const subCategories = await SubCategory.find({}).populate("parentCategory","name")
    console.log(subCategories);
    res.json({message:"sucess",data:subCategories});
  }
  catch(err){
    console.log("Error in getSubCategory",err);
    return res.json({message:"Error in getting subCategories"})
  }
  
}

const addSubCategory = async (req,res)=>{
  try{
    const {name,parentCategory} = req.body;
    
    
    const CategoryExists = await Category.findOne({name:parentCategory});
    console.log(CategoryExists)
  
    if(!CategoryExists){
      return res.json({message:"Category not found"})
    }

    const subCategory =  new SubCategory({name,parentCategory : CategoryExists._id});
   await subCategory.save();
    const subCategoryData = await SubCategory.findById(subCategory._id).populate("parentCategory","name _id")
    console.log(subCategoryData)
   res.json({message:'subcategory added successfully'})


  }
  catch(err){
    console.log("erron in addSubCategory",err);
    return res.json({message:'subcategory couldnot be added'})
  }
}

const editSubCategory = async (req,res)=>{

  try{
    const {id} =req.params;
    console.log(id)
    const {name,parentCategory} = req.body;
    const subcategoryexits=await SubCategory.findById(id);
    if(!subcategoryexits){
     return res.json({message:"Category not found"})
    }
    
    const parentCategoryExists = await Category.findOne({name:parentCategory})
    if(!parentCategoryExists){
      return res.json({message : "Category doesn't exist"});
    }
    const subCategoryUpdated={name,parentCategory:parentCategoryExists._id};
    await SubCategory.findByIdAndUpdate(id,subCategoryUpdated,{
      new: true,
      runValidators: true,
    })
  
    res.json({message:"Category succesfully updated"})
  }
  catch(err){
    console.log("Error in edit SubCategory",err)
    res.json({message:"Category succesfully updated"})
  }

}

const deleteSubCategory = async (req,res)=>{

  try{
    const {id} = req.params;
    //check if category exist
    const subCategoryExits = SubCategory.findById(id);
    if(!subCategoryExits){
      return res.json({message:"Subcategory Doesn't exist"});
    }
  await SubCategory.findByIdAndDelete(id);
   res.json({message:"SubCategory Successfully deleted"})
  }
  catch(err){
    console.log("Error in deleteSubCategory",err)
  }


}
export default{
  getSubCategory ,
  addSubCategory,
  editSubCategory,
  deleteSubCategory,
}