import  mongoose  from 'mongoose'
import Category from '../../models/categoryModel.js'
import Products from '../../models/productModel.js'


const getProducts = async (req,res)=>{
  try{
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page -1) * limit;
    
    const totalProducts = await Products.countDocuments();
    const totalPages = Math.ceil(totalProducts/limit);

    
    const products = await Products.find().populate('category','name').sort({createdAt:-1}).skip(skip).limit(limit);
  
    res.status(200).render('admin/products.ejs',{products,layout:"layouts/admin-dashboard-layout",pageTitle :"Products",currentPage:page,totalPages:totalPages})
  }
  catch(err){
    console.error(err)
    res.status(400).send('Error occured') //later better error handling
  }
}

//Add Products

const addProducts = async (req,res) =>{
  console.log('hii')
  console.log(req.body)

  // try{

  //   const imageFilesArray =req.files

  //   const imageArray = imageFilesArray.map((file)=>{
  //     return file.path;
  //   })

  //   const {name,category,subCategory,brand,price,stock,discount,description1,description2, productImages,productsDetails,variants,isDeleted,isActive} = req.body

  //   const categoryExist = await Category.findOne({name:category})

  //   //validating fields

  //   if(!name || 
  //     !category || 
  //     !subCategory || 
  //     !brand || 
  //     !isDeleted || 
  //     !isActive || 
  //     discount === undefined ||
  //     price === undefined || 
  //     stock == undefined){
  //     throw new Error ("Missing Fields Required") //later return res.render
  //   }

  //   //validating category

  //   if(!categoryExist){
  //     return res.status(400).json({message:"Invalid Category"});
  //   }

  //   //validating subCategory

  //   const validSubCategories = Products.schema.path('subCategory').enumValues;
  //   if(!validSubCategories.includes(subCategory)){
  //     return res.status(400).json({message:`subCategory doesn't exits, must be on of ${validSubCategories}.join(',') `})
  //   }

  //   //validating price
  //   if(price<0 || isNaN(price)){
  //     return res.status(400).json({message:"Price should be positive"});
  //   }

  //   //validating stock
  //   if(stock<0 || isNaN(stock)){
  //     return res.status(400).json({message:"Stock can't be negative"});
  //   }

  //   const discountedPrice = price - (price * discount / 100)
    
  //   const newProduct = new Products({
  //     name,
  //     category:categoryExist._id,
  //     subCategory,
  //     brand,
  //     price,
  //     stock,
  //     discountedPrice,
  //     discount,
  //     isActive,
  //     isDeleted,
  //     productImages:imageArray,
  //   })
  //   await newProduct.save();
  //   res.status(200).json({message:"Product Added Successfully"})

  // }
  // catch(err){
  //   res.json({message:"Error in Adding Products"})
  //   console.log("error in adding products",err);
  // }
}


//Edit Products

const editProducts =async (req,res)=>{
  try{
    const id = req.params.id;
    const editProduct=req.body;
    const product = await Products.findById(id);
    if(!product){
      res.status(400).json({message:"Product Doesn't Exist"})
    }

    //validate required fields 
    if(!editProduct.name || 
      !editProduct.category || 
      !editProduct.subCategory || 
      editProduct.price === undefined ||
      editProduct.stock == undefined){
      throw new Error ("Missing Fields Required") //later return res.render
    }


    //validate category
    const categoryExist = await Category.findOne({name:editProduct.category})

    if(!categoryExist){
      return res.status(400).json({message:"Invalid Category"});
    }

    //validate subCategory

    const validSubCategories = Products.schema.path('subCategory').enumValues;
    if(!validSubCategories.includes(editProduct.subCategory)){
      return res.status(200).json( {message:`Invalid Sub Category , must be on of : ${validSubCategories.join(',')}`
      })
    }

    //validate price

    if(editProduct.price<0 || isNaN(price)){
        return res.status(400).json({message:"Missing required fields"});
    }

    //stock validation 
    if(editProduct.stock<0 || isNaN(stock)){
      return res.status(400).json({message:"Stock can't be negative"});
    }

    //product object 
    const updateProduct = {
      name:editProduct.name,
      category:categoryExist._id,
      subCategory:editProduct.subCategory,
      brand:editProduct.brand,
      price:editProduct.price,
      stock:editProduct.stock,

    }

    //update product
    await Products.findByIdAndUpdate(id,updateProduct,{new:true, runValidators: true })
    
    res.status(200).json({message:"Product Edited Success Fully"})
   

  }
  catch(err){
    res.status(400).json({message:"Error in Updating Product",error: err})
    console.log("Error in Editing Product",err)
  }
}

//Hard Delete Products

const deleteProducts = async (req,res)=>{
  try{
    const id = req.params.id;
    if(!mongoose.Types.ObjectId.isValid(id)){
      return res.status(200).json({message:"Invalid Product ID"})
    }
    await Products.findByIdAndDelete(id)
    res.status(200).json({message:"Product Successfully Deleted"})
  }
  catch(err){
    console.log("Error in Deleting Products",err)
    res.status(400).json({message:"Error in deleting product",error:err})
  }
}

//Soft Delete Products

const softDeleteProducts =  async (req,res)=>{
  try{
    const id = req.params.id;
    if(!mongoose.Types.ObjectId.isValid(id)){
      return res.status(400).json({message:"Invalid ID"})
    }
 const product= await Products.findById(id)
 if(!product){
  return res.status(400).json({message:"Product Doesn't Exist"})
 }
 await Products.findByIdAndUpdate(id,{isDeleted:true})
 res.json({message:"Product Soft Deleted"})
  }
  catch(err){
    res.status(400).json({message:"Error in Soft Delete"})
    console.error(err)
  }
}

const restoreSoftDeleteProducts = async (req,res)=>{
  try{
    const id = req.params.id;

    if(!mongoose.Types.ObjectId.isValid(id)){
      return res.status(400).json({message:"Invalid ID"})
    }
    const product = await Products.findById(id);
    if(!product){
      return res.status(400).json({message:"Product Doesn't Exist"})
    }

    await Products.findByIdAndUpdate(id,{isDeleted:false})
    res.status(200).json({message:"Product Restored Successfully"})
  }
  catch(err){

  }
}

export default{
  getProducts,
  addProducts,
  editProducts,
  deleteProducts,
  softDeleteProducts
}