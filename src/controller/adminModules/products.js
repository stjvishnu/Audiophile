import  mongoose  from 'mongoose'
import Category from '../../models/categoryModel.js'
import Products from '../../models/productModel.js'
import { HTTP_STATUS,RESPONSE_MESSAGES } from '../../utils/constants.js'





const getSingleProduct = async (req, res) => {
  console.log('Call inside getsingleProduct');
  console.log(req.params.id);
  try {
    const product = await Products.findById(req.params.id).populate('category','name');
    console.log('product in edit backedn ',product);
    if (!product) return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Product not found" });
    res.status(HTTP_STATUS.OK).json(product); // send product as JSON for modal
  } catch (error) {
    console.error(error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Server Error" });
  }
};

const getProducts = async (req,res)=>{
  
  try{
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page -1) * limit;
    
    const totalProducts = await Products.countDocuments();
    const totalPages = Math.ceil(totalProducts/limit);

    
    const products = await Products.find().populate('category','name').sort({createdAt:-1}).skip(skip).limit(limit);
    
  
    res.status(HTTP_STATUS.OK).render('admin/products.ejs',{products,layout:"layouts/admin-dashboard-layout",pageTitle :"Products",currentPage:page,totalPages:totalPages})
  }
  catch(err){
    console.error(err)
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send('Error occured') //later better error handling
  }
}

//Add Products

const addProducts = async (req,res)=>{
  console.log('Call Inside Add');

  const formData = req.body;
  console.log(formData);
  const images = req.files;
  try{
    // Basic Validation

    // validate Product exist or not
    const productExits = await Products.findOne({name:formData.name})
    if(productExits){
      return res.status(HTTP_STATUS.CONFLICT).json({message:'Same Product Exists'});
    }

    //validate category
    const categoryDoc = await Category.findOne({name:formData.category});
    if(!categoryDoc){
        return res.status(HTTP_STATUS.BAD_REQUEST).json({message:'Product category not found'});
       }
      const categoryId=categoryDoc._id;
    
  

    //validate subCategory
    const validSubCategories = ['beginner','intermediate','advanced'];
    if(!validSubCategories.includes(formData.subCategory)){
      return res.status(HTTP_STATUS.BAD_REQUEST).json({success:false,message:'Invalid Subcategory, Must be Beginner,Intermediate,Advanced'})
    }





    const variants=[];

    const variantCount = Math.max(...images.map(file => parseInt(file.fieldname.split('-')[1])));
    
    for(let i=1;i<=variantCount;i++){
     
      const productImages = images.filter(file=>file.fieldname.startsWith(`variant-${i}-image`)).map(file=>file.path)
      

      variants.push({
        sku:formData[`variant-${i}-sku`],
        attributes : {
          color:formData[`variant-${i}-color`],
          plug:formData[`variant-${i}-plug`],
          mic:formData[`variant-${i}-mic`],
          stock: parseInt(formData[`variant-${i}-stock`]),
          price: parseFloat(formData[`variant-${i}-price`]),
          discount: parseFloat(formData[`variant-${i}-discount`]),
          productImages,
          isActive:formData[`variant-${i}-isActive`]
        }
      })
    }

    const productData = {
      name: formData.name,
      category :categoryId,
      subCategory : formData.subCategory,
      brand : formData.brand,
      isActive:formData.isActive,
      description1 : formData.description1,
      description2 : formData.description2,
    
      productDetails : {
        driver: formData.driver,
        driverConfiguration : formData.driverConfiguration,
        impedance : formData.impedance,
        soundSignature : formData.soundSignature,
        mic: formData.microphone,
      },
      variants,
    };
    const product = new Products(productData);
    await product.save()

    console.log('hit here')
  
    res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.CREATED,product:product})
    

  }catch(err){
    console.log(err);
    res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST})
  }

}




//------------------------------------------


//Edit Products

const editProducts = async (req, res) => {
  console.log('Call Inside edit');
  console.log('req.body',req.body);
  const formData = req.body;
  console.log('formdata');
  const images = req.files;
  const productId=req.params.id;
  console.log('before try');
  try{
    // Basic Validation

    // validate Product exist or not
    console.log('1');
    const productExits = await Products.findById(productId)
    if(!productExits){
      return res.status(HTTP_STATUS.BAD_REQUEST).json({message:'Product not found'});
    }
    console.log('2');

    //validate category
    const categoryDoc = await Category.findOne({name:formData.category});
    if(!categoryDoc){
        return res.status(HTTP_STATUS.BAD_REQUEST).json({message:'Product category not found'});
       }
      const categoryId=categoryDoc._id;
  
    console.log('3');
    //validate subCategory
    const validSubCategories = ['beginner','itermediate','advanced'];
    if(!validSubCategories.includes(formData.subCategory)){
      return res.status(HTTP_STATUS.BAD_REQUEST).json({success:false,message:'Invalid Subcategory, Must be Beginner,Intermediate,Advanced'})
    }

    console.log('4');
    const imgUrls=Object.keys(formData).filter((key)=>key.includes('image')&&key.startsWith('variant-'));
    

    imgUrls.forEach((key)=>{
      images.push({
        fieldname:key,
        path:formData[key]
      })
    })

console.log('images',images);

    console.log('5');
    const variants=[];

    const variantCount = Math.max(...images.map(file => parseInt(file.fieldname.split('-')[1])));
    console.log('6');
    for(let i=1;i<=variantCount;i++){
     console.log('7');
      const productImages = images.filter((file)=>file.fieldname.startsWith(`variant-${i}-image`))
      .sort((a,b)=>{
        const numA = parseInt(a.fieldname.split('image')[1]);
        const numB = parseInt(b.fieldname.split('image')[1]);
        return numA-numB
        
      })
      .map(file=>file.path)

      console.log('productImagres',productImages);
      
      console.log('8');
      variants.push({
        sku:formData[`variant-${i}-sku`],
        attributes : {
          color:formData[`variant-${i}-color`],
          plug:formData[`variant-${i}-plug`],
          mic:formData[`variant-${i}-mic`],
          stock: parseInt(formData[`variant-${i}-stock`]),
          price: parseFloat(formData[`variant-${i}-price`]),
          discount: parseFloat(formData[`variant-${i}-discount`]),
          productImages,
          isActive:formData[`variant-${i}-isActive`]
        }
      })
    }

    console.log('hello');
    console.log('variants',variants);

    const productData = {
      name: formData.name,
      category :categoryId,
      subCategory : formData.subCategory,
      brand : formData.brand,
      isActive:formData.isActive,
      description1 : formData.description1,
      description2 : formData.description2,
    
      productDetails : {
        driver: formData.driver,
        driverConfiguration : formData.driverConfiguration,
        impedance : formData.impedance,
        soundSignature : formData.soundSignature,
        mic: formData.microphone,
      },
      variants,
    };
    console.log('9');
    const updatedProduct = await Products.findByIdAndUpdate(productId,productData,{ new: true, runValidators: true });

    if(!updatedProduct){
     return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST})
    }
  
    res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.CREATED,product:updatedProduct})
    

  }catch(err){
    console.log(err);
    res.status(HTTP_STATUS.BAD_REQUEST).json({ message: RESPONSE_MESSAGES.BAD_REQUEST,error:err})
  }

}

//Hard Delete Products

const deleteProducts = async (req,res)=>{
  try{
    const id = req.params.id;
    if(!mongoose.Types.ObjectId.isValid(id)){
      return res.status(HTTP_STATUS.OK).json({message:"Invalid Product ID"})
    }
    await Products.findByIdAndDelete(id)
    res.status(HTTP_STATUS.OK).json({message:"Product Successfully Deleted"})
  }
  catch(err){
    console.log("Error in Deleting Products",err)
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message:"Error in deleting product",error:err})
  }
}

//Soft Delete Products

const softDeleteProducts =  async (req,res)=>{
  try{
    const productId = req.params.id;
    if(!mongoose.Types.ObjectId.isValid(productId)){
      return res.status(HTTP_STATUS.BAD_REQUEST).json({message:"Invalid ID"})
    }
 const product= await Products.findById(productId)
 if(!product){
  return res.status(HTTP_STATUS.NOT_FOUND).json({message:"Product Doesn't Exist"})
 }
 await Products.findByIdAndUpdate(productId,{isDeleted:true})
 res.json({message:"Product Soft Deleted"})
  }
  catch(err){
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message:"Error in Soft Delete"})
    console.error(err)
  }
}


const restoreSoftDeleteProducts = async (req,res)=>{
  try{
    const productId = req.params.id;

    if(!mongoose.Types.ObjectId.isValid(productId)){
      return res.status(HTTP_STATUS.BAD_REQUEST).json({message:"Invalid ID"})
    }
    const product = await Products.findById(productId);
    if(!product){
      return res.status(HTTP_STATUS.NOT_FOUND).json({message:"Product Doesn't Exist"})
    }

    await Products.findByIdAndUpdate(productId,{isDeleted:false})
    res.status(HTTP_STATUS.OK).json({message:"Product Restored Successfully"})
  }
  catch(err){
    console.log(err);
  }
}

const blockProducts= async (req,res)=>{
  try{
    const productId=req.params.id;
    if(!mongoose.Types.ObjectId.isValid(productId)){
      return res.status(HTTP_STATUS.BAD_REQUEST).json({message:'Invalid Id'})
    }
    const product = Products.findById(productId);
    if(!product){
      return res.status(HTTP_STATUS.NOT_FOUND).json({message:"Product doesn't exist"})
    }
    
    await Products.findByIdAndUpdate(productId,{isActive:false})
    res.status(HTTP_STATUS.OK).json({message:'Product Blocked SuccessFully'})
  }catch(err){
    console.error('Error occured in block product',err);
  }
}

const unblockProducts= async (req,res)=>{
  try{
    const productId=req.params.id;
    if(!mongoose.Types.ObjectId.isValid(productId)){
      return res.status(HTTP_STATUS.BAD_REQUEST).json({message:'Invalid Id'})
    }
    const product = Products.findById(productId);
    if(!product){
      return res.status(HTTP_STATUS.NOT_FOUND).json({message:"Product doesn't exist"})
    }
    
    await Products.findByIdAndUpdate(productId,{isActive:true})
    res.status(HTTP_STATUS.OK).json({message:'Product Blocked SuccessFully'})
  }catch(err){
    console.error('Error occured in unblock product',err);
  }
}

const  getCategory = async (req,res)=>{
  try{
    console.log('Call recieved at getCategory');
    const category=await Category.find()
    res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,category:category})
  }catch (err){
    console.log('Error in Get Category in add Modal',err);
  }
}

export default{
  getProducts,
  getSingleProduct,
  addProducts,
  editProducts,
  deleteProducts,
  softDeleteProducts,
  restoreSoftDeleteProducts,
  blockProducts,
  unblockProducts,
  getCategory
}

