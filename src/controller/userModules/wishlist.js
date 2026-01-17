import Wishlist from "../../models/wishlistModel.js"
import Cart from '../../models/cartModal.js'
import User from "../../models/userModel.js"
import Products from "../../models/productModel.js"
import {HTTP_STATUS,RESPONSE_MESSAGES} from '../../utils/constants.js'

const getWishlist = async (req,res)=>{
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page-1) * limit;
  const totalDocuments = await Wishlist.countDocuments() || 5;
  const totalPages = Math.ceil(totalDocuments/limit);

  const wishlist = await Wishlist.findOne({user:req.user}).populate('items.productId').skip(skip).limit(limit)

  if(!wishlist){
    return res.render('user/wishlist.ejs',{wishlistProducts:[]})
  }
  const wishlistProducts=wishlist.items.map((item)=>{
    const product = item.productId;
    const variant = product.variants.find(v=>v.sku===item.variantId)
    const isWishlisted = item.isWishlisted;
    
    return {
      product: {
        _id: product._id,
        name: product.name,
        brand: product.brand,
        description1: product.description1,
        description2: product.description2,
      },
      variant: variant || null,
      isWishlisted:isWishlisted
    };
  })
  console.log('wishlist',wishlistProducts);
  wishlistProducts.forEach((item)=>console.log(item.variant))

  res.render('user/wishlist.ejs',{wishlistProducts,currentPage:page,totalPages:totalPages})
}

const postWishlist = async (req,res)=>{
  try{
    if(!req.user){
      res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Please login to add to wishlist'})

    }
    console.log('Call inside postwishlist controller');
    console.log(req.body)
    const {productId,variantId} = req.body;
    if(!req.user){
     return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Please Login Again'})
    }
    const product = await Products.findOne({_id:productId,'variants.sku':variantId},{name:1,brand:1,description1:1,isActive:1,isDeleted:1,'variants.$':1});
    if(!product){
      return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Product Not Available at the inventory'});
    }
    if(!product.isActive){
      return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Product Is Temporory UnAvailable'})
    }
    if(product.isDeleted){
      return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Product Is Not Available'})
    }
    const actualProductId = product._id

    let wishlist = await Wishlist.findOne({user:req.user})
    let count=0;
    // const cart=await Cart.findOne({userId:req.user})
    // let wishlistingItemExistsInCart=cart.items.find((item)=>item.variantId===variantId)
    // console.log('wishlistingitem',wishlistingItemExistsInCart);
    // if(wishlistingItemExistsInCart){
    //   await Wishlist.findOneAndUpdate({user:req.user},{$pull:{items:{variantId}}},{new:true})
    //   return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:"Product In Cart Can't Be Addedd to Wishlist Again"})
    // }
    console.log(product);
    console.log('req.user',req.user);
    console.log(wishlist);
    console.log('variantId',variantId);
    if(wishlist){
      const itemExists=wishlist.items.some(item=>item.productId.toString()===actualProductId.toString() && item.variantId===variantId);
      if(itemExists){
        return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Item Is Already In Your Wishlist'})
      }
      wishlist.items.push({
        productId: productId,
        variantId: variantId,
        isWishlisted:true,
      });

      if(wishlist && wishlist.items){
        count=wishlist.items.length;
        console.log('count',count);
      }
      
      await wishlist.save();
    }else{
      const newWishlist = new Wishlist({
        user:req.user,
      items:[{
        productId:productId,
        variantId:variantId,
        isWishlisted:true,
      }]
      })
      
     
      await newWishlist.save();

    }
    //update the product's isWishlisted variable
    await Products.updateOne({_id:productId,'variants.sku':variantId},{$set:{'variants.$.attributes.isWishlisted':true}})
    
     res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,customMessage:'Product added to Wishlist',wishlistCount:count})
  }catch(err){
    console.log('Err',err)
    res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Something went wrong !'})
  }
}

 const removeWishlist = async (req,res)=>{
  console.log('Request recieved in remvwishlist controller');
  try{
    const {variantId} = req.body;
    console.log('variantId',variantId);

    const userId =req.user;
    if(!userId) return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Error Occured...! Login Again'})

    // const wishlist = await Wishlist.findOne({user:userId})
    // if(!wishlist) return res.status(HTTP_STATUS.NOT_FOUND).json({message:RESPONSE_MESSAGES.NOT_FOUND,customMessage:'Wishlist not found for this User..'})

    const isRemoved=await Wishlist.findOneAndUpdate({user:userId},{$pull:{items:{variantId:variantId}}})
    console.log('isremoved',isRemoved);
    if(!isRemoved) return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message:RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,customMessage:'Error Occured..Try Again'})

    // await Products.updateOne({_id:productId,'variants.sku':variantId},{$set:{'variants.$.attributes.isWishlisted':false}})
    const wishlist = await Wishlist.findOne({user:req.user},'items')
    let count=0;
      if(wishlist && wishlist.items){
        count=wishlist.items.length;
      }
    return res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,customMessage:'Product Removed From The Wishlist',wishlistCount:count})
    
  }catch(err){
    console.log('Error in removeWishlist controller',err);
    return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Error Occured..Try Again'})
  }
 }

 export default{
  getWishlist,
  postWishlist,
  removeWishlist
}