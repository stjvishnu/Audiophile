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
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product); // send product as JSON for modal
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
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
    
  
    res.status(200).render('admin/products.ejs',{products,layout:"layouts/admin-dashboard-layout",pageTitle :"Products",currentPage:page,totalPages:totalPages})
  }
  catch(err){
    console.error(err)
    res.status(400).send('Error occured') //later better error handling
  }
}

//Add Products

const addProducts = async (req,res)=>{
  console.log('Call inside postTest');
  console.log(req.body)
  console.log(req.files)
  const formData = req.body;
  const images = req.files;
  try{

      //check if the product already exists
      console.log(formData.name)
       const productExists =  await Products.findOne({name:formData.name})
      if(productExists){
       return res.status(HTTP_STATUS.CONFLICT).json(RESPONSE_MESSAGES.CONFLICT);
      }

      console.log(formData.category)
      //validate category
      const categoryDoc = await Category.findOne({name:formData.category});
      if(!categoryDoc){
          return res.status(HTTP_STATUS.BAD_REQUEST).json({message:'Product category not found'});
         }
        const categoryId=categoryDoc._id;
    

      //validate subCategory
      const validSubCategories = ['Beginner','Intermediate','Advanced'];
      if(!validSubCategories.includes(formData.subCategory)){
        return res.status(HTTP_STATUS.BAD_REQUEST).json({success:false,message:'Invalid Subcategory, Must be Beginner,Intermediate,Advanced'})
      }

    const variants = []; //variant array
    const variantCount = Math.max(...Object.keys(formData).filter(key=>key.startsWith('variant-')).map(key=>parseInt(key.split('-')[1])))
    console.log(variantCount);

    for(let i=1;i<=variantCount;i++){
      const productImg=images.filter(file=>file.fieldname.startsWith(`variant-${i}-image`)).map(file=>file.path)
     

      variants.push({
        sku:formData[`variant-${i}-sku`],
        attributes : {
          color:formData[`variant-${i}-color`],
          plug:formData[`variant-${i}-plug`],
          mic:formData[`variant-${i}-mic`],
          stock: parseInt(formData[`variant-${i}-stock`]),
          price: parseFloat(formData[`variant-${i}-price`]),
          discount: parseFloat(formData[`variant-${i}-discount`]),
          productImages : productImg,
        }
      })
    }
  

    const productData = {
      name: formData.name,
      category :categoryId,
      subCategory : formData.subCategory,
      brand : formData.brand,
      description1 : formData.description1,
      description2 : formData.description2,
      productDetails : {
        driver: formData.driver,
        driverConfiguration : formData.driverConfiguration,
        impedence : formData.impedence,
        soundSignature : formData.soundSignature,
        plug:formData.plug,
        microphone : formData.microphone,
      },
      variants,
      isActive : true,
      isDeleted:false,
    };

    const product = new Products(productData);
    await product.save();

    res.status(200).json({message:'Product created successfully',product})

  }catch(err){
    console.log('error in creating product',err)
    res.status(500).json({message:'Server Error'})
  }
}




//------------------------------------------


//Edit Products

const editProducts = async (req, res) => {
  console.log('request hits');
  console.log('Form data received:', req.body);

  try {
    const productId = req.params.id;
    console.log(productId);
    const {
      name,
      category,
      subCategory,
      brand,
      price,
      stock,
      discount,
      discountedPrice,
      description1,
      description2,
      driver,
      driverConfig,
      impedance,
      plug,
      microphone,
      isActive,
    } = req.body;

    // Get categoryId
    let categoryId;
    const categoryDoc = await Category.findOne({ name: category });
    if (categoryDoc) categoryId = categoryDoc._id;

    // Handle uploaded images (if any)
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => ({
        url: file.path,
        public_id: file.filename,
      }));
    }

    // Build update object
    const updateData = {
      name,
      category: categoryId,
      subCategory,
      brand,
      price: parseFloat(price),
      stock: parseInt(stock),
      discount: discount ? parseInt(discount) : null,
      discountedPrice: discountedPrice ? parseFloat(discountedPrice) : null,
      description1,
      description2: description2 || null,
      productsDetails: {
        driver: driver || null,
        driverConfiguration: driverConfig || null,
        impedance: impedance || null,
        plug: plug || null,
        microphone: microphone || null
      },
      microphone: microphone || null,
      isActive: isActive === 'true',
    };

    // If new images uploaded, replace old images
    if (imageUrls.length > 0) updateData.productImages = imageUrls;

    const updatedProduct = await Products.findByIdAndUpdate(productId, updateData, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct
    });

  } catch (err) {
    console.error("Error editing product:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

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
    const productId = req.params.id;
    if(!mongoose.Types.ObjectId.isValid(productId)){
      return res.status(400).json({message:"Invalid ID"})
    }
 const product= await Products.findById(productId)
 if(!product){
  return res.status(400).json({message:"Product Doesn't Exist"})
 }
 await Products.findByIdAndUpdate(productId,{isDeleted:true})
 res.json({message:"Product Soft Deleted"})
  }
  catch(err){
    res.status(400).json({message:"Error in Soft Delete"})
    console.error(err)
  }
}


const restoreSoftDeleteProducts = async (req,res)=>{
  try{
    const productId = req.params.id;

    if(!mongoose.Types.ObjectId.isValid(productId)){
      return res.status(400).json({message:"Invalid ID"})
    }
    const product = await Products.findById(productId);
    if(!product){
      return res.status(400).json({message:"Product Doesn't Exist"})
    }

    await Products.findByIdAndUpdate(productId,{isDeleted:false})
    res.status(200).json({message:"Product Restored Successfully"})
  }
  catch(err){
    console.log(err);
  }
}

const blockProducts= async (req,res)=>{
  try{
    const productId=req.params.id;
    if(!mongoose.Types.ObjectId.isValid(productId)){
      return res.status(400).json({message:'Invalid Id'})
    }
    const product = Products.findById(productId);
    if(!product){
      return res.status(400).json({message:"Product doesn't exist"})
    }
    
    await Products.findByIdAndUpdate(productId,{isActive:false})
    res.status(200).json({message:'Product Blocked SuccessFully'})
  }catch(err){
    console.error('Error occured in block product',err);
  }
}

const unblockProducts= async (req,res)=>{
  try{
    const productId=req.params.id;
    if(!mongoose.Types.ObjectId.isValid(productId)){
      return res.status(400).json({message:'Invalid Id'})
    }
    const product = Products.findById(productId);
    if(!product){
      return res.status(400).json({message:"Product doesn't exist"})
    }
    
    await Products.findByIdAndUpdate(productId,{isActive:true})
    res.status(200).json({message:'Product Blocked SuccessFully'})
  }catch(err){
    console.error('Error occured in unblock product',err);
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
}