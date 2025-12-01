
import Product from "../../models/productModel.js";
import Category from "../../models/categoryModel.js"
import Wishlist from "../../models/wishlistModel.js"
import {HTTP_STATUS,RESPONSE_MESSAGES} from "../../utils/constants.js"


const allProducts = async (req, res) => {

  
  console.log('Call inside All products');
      try {
      
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page-1) * limit;
        const totalDocuments = await Product.countDocuments();
        const totalPages = Math.ceil(totalDocuments/limit);

        const query={isActive:true,isDeleted:false};

        const {category,subCategory,brand} = req.query;
        if(category){
          const categoryDoc=await Category.findOne({name:category})
          query.category=categoryDoc._id
        }
        if(subCategory){
          query.subCategory=subCategory;
        }
        if(brand){
        query.brand=brand;
        }

        let sortOption = {createdAt:-1};  //default sort
       let sortBy= req.query.sort;
        
        if(sortBy=='alphabetical-az'){
          sortOption={name:1}
        }else if(sortBy=='alphabetical-za'){
          sortOption={name:-1}
        }else if(sortBy=='price-low-high'){
          sortOption={price:1}
        }else if(sortBy=='price-high-low'){
          sortOption={price:-1}
        }else if(sortBy=='date-old-new'){
          sortOption={date:1}
        }else if(sortBy=='date-new-old'){
          sortOption={date:-1}
        }else{
          sortOption={createdAt:-1}
        }
        
        const products = await Product.find(query).skip(skip).limit(limit).sort(sortOption).lean();
        if(req.user){
          const wishlist = await Wishlist.findOne({userId:req.user}).lean();
        
        console.log("wishlist",wishlist);
        // console.log('products',products)

        const wishlistedVariants = new Set(wishlist?.items.map(item=>item.variantId));
        console.log('wishlistedvariants',wishlistedVariants);


        products.forEach((product)=>{
         const isProductWishlisted= product.variants.some(variant=>{
            return wishlistedVariants.has(variant.sku)
          });
          product.isWishlisted=isProductWishlisted;
        });
        }
        

 
        res.status(200).render("user/products.ejs", { products,currentPage:page,totalPages:totalPages});
      } catch (err) {
        console.error(err);
        res.send("Error occured");
      }

};





const searchProductsPage=(req,res)=>{
  res.render('user/searchProductsPage.ejs')
}

const searchProducts = async (req,res)=>{
  console.log('CAll inside searchproduct');
  const productName= req.query.search;
  console.log('search name',productName);
  const product=await Product.find({name:{$regex:productName,$options:'i'}});
  console.log(product);
  if(product){
    res.status(200).json(product)
  }
 
}
const singleProduct = async (req,res)=>{
  console.log('Helloits here');
  console.log(req.query);
 const {productId,variantId} = req.query;
  

 const product = await Product.findOne({_id:productId,[`variants.sku`]:variantId},{name:1,brand:1,description1:1,description2:1,productDetails:1,variants:{$elemMatch:{sku:variantId}}}).lean()
  console.log(product);

  const wishlist = await Wishlist.findOne({userId:req.user}).lean();
  const wishlistedVariants = new Set(wishlist?.items.map(item=>item.variantId));

  if(product){
    product.variants[0].attributes.isWishlisted= wishlistedVariants.has(product.variants[0].sku)
    res.render('user/singleProduct.ejs',{product})
  }
 
}

const productPage = async (req,res)=>{
  const productId= req.params.id;
  const product=await Product.findById(productId);
  const wishlist = await Wishlist.findOne({userId:req.user}).lean();
  const wishlistedVariants = new Set(wishlist?.items.map(item=>item.variantId));
  if(product){
    console.log(product);
    product.variants.forEach(variant=>{
      variant.attributes.isWishlisted= wishlistedVariants.has(variant.sku)
    });
    console.log('After edit',product);
    res.render('user/singleProduct.ejs',{product})
  }
}

const variantProduct = async (req,res)=>{
  console.log('Call recived at variant product controller');
  let {productId,type,value} = req.query;
  console.log(req.query);
  
  console.log('trouble shooting',productId);
  // console.log('Variant id from mic call',variantId);
  console.log('checking mic',typeof !!value);
  // if(type=='mic') value= !!value
  console.log('mic after conversion',  value);
  console.log('type fdasddf',type);
  try{
    const product = await Product.findOne({_id:productId,[`variants.attributes.${type}`]:value},{name:1,brand:1,description1:1,description2:1,productDetails:1,variants:{$elemMatch:{[`attributes.${type}`]:value}}}).lean()
    

    if(!product){
     return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'No Product Avilable In Selected Variant',mic:value})
    }
  console.log('setting mic',product);
  console.log('product from variantProduct',product);
  const wishlist = await Wishlist.findOne({userId:req.user}).lean();
  const wishlistedVariants = new Set(wishlist?.items.map(item=>item.variantId));
    product.variants[0].attributes.isWishlisted= wishlistedVariants.has(product.variants[0].sku)
    console.log('npkkattu',product.variants[0].attributes.isWishlisted);
  console.log('hello',product.variants[0].attributes);
  res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,product:product})
  }catch(err){
    console.log('Error in VariantProduct',err);
    res.status(HTTP_STATUS.NOT_FOUND).json({message:RESPONSE_MESSAGES.NOT_FOUND})
  }
  
}

export default {
  allProducts,
  singleProduct,
  productPage,
  searchProducts,
  searchProductsPage,
  variantProduct
};

