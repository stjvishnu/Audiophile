
import Product from "../../models/productModel.js";
import Category from "../../models/categoryModel.js"
import Offer from '../../models/offerModel.js'
import Wishlist from "../../models/wishlistModel.js"
import {HTTP_STATUS,RESPONSE_MESSAGES} from "../../utils/constants.js"


const allProducts = async (req, res) => {

  
  console.log('Call inside products');
      try {
        console.log('hijijiji');
      
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


       let sortBy= req.query.sort;
        
       let sortStage = { createdAt: -1 }; // default

       if (sortBy === 'alphabetical-az') {
         sortStage = { name: 1 };
       }
       else if (sortBy === 'alphabetical-za') {
         sortStage = { name: -1 };
       }
       else if (sortBy === 'price-low-high') {
         sortStage = { minPrice: 1 };
       }
       else if (sortBy === 'price-high-low') {
         sortStage = { minPrice: -1 };
       }
       else if (sortBy === 'date-old-new') {
         sortStage = { createdAt: 1 };
       }
       else if (sortBy === 'date-new-old') {
         sortStage = { createdAt: -1 };
       }
        
        // const products = await Product.find(query).skip(skip).limit(limit).sort(sortOption).lean();
        const products = await Product.aggregate([
          { $match: query },
        
          { $unwind: "$variants" },
        
          // keep only active variants for price calculation
          { $match: { "variants.attributes.isActive": true } },
        
          {
            $group: {
              _id: "$_id",
        
              // rebuild full variants array
              variants: { $push: "$variants" },
        
              // keep product-level fields ONCE
              name: { $first: "$name" },
              brand: { $first: "$brand" },
              category: { $first: "$category" },
              subCategory: { $first: "$subCategory" },
              description1: { $first: "$description1" },
              description2: { $first: "$description2" },
              productDetails: { $first: "$productDetails" },
              productImages: { $first: "$productImages" },
              isActive: { $first: "$isActive" },
              createdAt: { $first: "$createdAt" },
              updatedAt: { $first: "$updatedAt" },
        
              // compute lowest price
              minPrice: { $min: {$multiply:[ "$variants.attributes.price",{$subtract:[1,{$divide:['$variants.attributes.discount',100]}]} ]}}
            }
          },
        
          { $sort: sortStage },
          { $skip: skip },
          { $limit: limit }
        ]);
        
        console.log('products',products);
        
        if(req.user){
       
         const wishlist = await Wishlist.findOne({user:req.user}).lean();
        const wishlistedVariants = new Set(wishlist?.items.map(item=>item.variantId));
        products.forEach((product)=>{
          console.log('product',product);
        
         const isProductWishlisted= product.variants.some(variant=>{
            return wishlistedVariants.has(variant.sku)
          });
          product.isWishlisted=isProductWishlisted;
        });

        }

        // const categoryList = await Category.find({isActive:true,isDeleted:false})
        // const categoryNames = categoryList.map((category)=>category.name)
        // console.log('category list',categoryNames);
        // const productList = await Product.find({isActive:true,isDeleted:false}).populate('category')
        // const productCategoryNames =  productList.map((product)=>product.category.name)
        // console.log('productList',productCategoryNames);

        const categoryList = await Category.aggregate([
          {
            $match: {
              isActive: true,
              isDeleted: false
            }
          },
        
          // LEFT JOIN with filtering
          {
            $lookup: {
              from: "products",
              let: { categoryId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$category", "$$categoryId"] },
                        { $eq: ["$isActive", true] },
                        { $eq: ["$isDeleted", false] }
                      ]
                    }
                  }
                }
              ],
              as: "products"
            }
          },
        
          {
            $addFields: {
              count: { $size: "$products" }
            }
          },
        
          {
            $project: {
              _id: 0,
              category: { $toLower: { $trim: { input: "$name" } } },
              count: 1
            }
          }
        ]);
        

        console.log(categoryList)

        const brandList = await Product.aggregate([{$group:{_id:'$brand',count:{$sum:1}}},{$project:{_id:0,brand:'$_id',count:1}}])
        console.log(brandList)
        const subCategoryList = await Product.aggregate([{$group:{_id:'$subCategory',count:{$sum:1}}},{$project:{_id:0,subCategory:'$_id',count:1}}])
        console.log(subCategoryList)

        

 
        res.status(200).render("user/products.ejs", { products,currentPage:page,totalPages:totalPages,categoryList,subCategoryList,brandList});
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
  const product=await Product.findById(productId)
  const variantIds = product.variants.map((v)=>v.sku)
  console.log('variantIds',variantIds);
  console.log('rpoduct',product);
  const wishlist = await Wishlist.findOne({userId:req.user}).lean();
  const wishlistedVariants = new Set(wishlist?.items.map(item=>item.variantId));
  if(product){
    console.log(product);
    product.variants.forEach(variant=>{
      variant.attributes.isWishlisted= wishlistedVariants.has(variant.sku)
    });
    const similarProducts = await Product.find({_id:{$ne:product._id},category:product.category,isActive:true,isDeleted:false,'variants.attributes.isActive':true,'variants.attributes.isDeleted':false})
    console.log('similar products',similarProducts);
    console.log('After edit',product);

  const offers = await Offer.find({isActive:true,isDelete:false,$or:[{targetId:product.category},{targetSku:{$in:variantIds}}]})
  .sort({ createdAt: -1 })
    res.render('user/singleProduct.ejs',{product,similarProducts,offers})
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

