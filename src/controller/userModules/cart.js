import Products from '../../models/productModel.js'
import Cart from '../../models/cartModal.js'
import Wishlist from "../../models/wishlistModel.js"
import calculateCart from '../../utils/cartCalculator.js'
import Address from '../../models/addressModel.js';


import jwt from "jsonwebtoken";
import {HTTP_STATUS,RESPONSE_MESSAGES} from '../../utils/constants.js'

const getCart = async (req,res)=>{
  console.log('Call Recieved at getCart controller');
  try{

      if(!req.user){
        return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Please login !'})
      }
      let cart = await Cart.findOne({userId:req.user}).populate('items.productId');
      if(!cart){
        return  res.status(HTTP_STATUS.NOT_FOUND).json({message:RESPONSE_MESSAGES.NOT_FOUND})
      }
      console.log('cart before calculatecart',cart);
      const calculatedCart = await calculateCart(cart);
      res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.CREATED,cart:calculatedCart})

  }catch(err){
    return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST})
  }
}


const postCart = async (req,res)=>{
  console.log('Call recieved in postcart');
    try{
      
      if(!req.user){
        return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Please login !'})
      }

   
      console.log(req.body);
      const { productId, quantity,variantId } = req.body; 

      let cart = await Cart.findOne({userId:req.user}).populate('items.productId');

       
      if(!cart){
        cart = new Cart({userId:req.user,items:[]});
      }

      const product = await Products.findOne({_id:productId,'variants.sku':variantId},{isActive:1,isDeleted:1,'variants.$':1}).populate('category')

      const category=product.category.name
     

      if(!product){
        return res.status(HTTP_STATUS.NOT_FOUND).json({message:RESPONSE_MESSAGES.NOT_FOUND})
      }

      if(!product.isActive || product.isDeleted){
        await Cart.findOneAndUpdate({userId:req.user},{$pull:{'items':{productId:product._id}}},{new:true})
        return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Product is not available at the moment'})
      }
      let currentPrice;
      let discount;
       currentPrice= product.variants[0].attributes.price;
       discount = product.variants[0].attributes.discount;


   
      const existingItem= cart?.items?.find((item)=>{
        return item?.productId?._id.toString() ===productId && item?.variantId===variantId
      })
      
      if(existingItem){

        existingItem.category = category;
        const specificVariant = existingItem.productId.variants.find(
          v => v.sku === existingItem.variantId
        );
        currentPrice=specificVariant.attributes.price;
         discount=specificVariant.attributes.discount;
        let stock = specificVariant.attributes.stock;
        console.log('specificVariant',specificVariant);
        

        if(existingItem.quantity+quantity>10){
          return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Reached Maximum Quantity Per Transaction'})

        }
        // console.log(specificVariant);
        // console.log(existingItem.quantity);
        if(existingItem.quantity+quantity>stock){
          return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Not enough stock available '})
        }
        

        existingItem.quantity+=quantity
        existingItem.totalPrice=Math.round(existingItem.quantity*(currentPrice*0.01*(100-discount)));
      }else{
        let cartProduct = await Products.findOne({_id:productId,'variants.sku':variantId},{'variants.$':1})

        const stock=cartProduct.variants[0].attributes.stock;
        if(stock>0){
          cart.items.push({
       
            productId:productId,
            variantId:variantId,
            category:category,
            quantity:quantity,
            currentPrice:Math.round(currentPrice*0.01*(100-discount)),
            totalPrice:Math.round(quantity*(currentPrice*0.01*(100-discount))),
          
        })
        }else{
          return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Not enough stock available '})
        }
        

      }
    
    //   await Wishlist.findOneAndUpdate({user:req.user},{$pull:{items:{variantId}}},{new:true})
      await Products.updateOne({_id:productId,'variants.sku':variantId},{$set:{'variants.$.attributes.isWishlisted':false}})

      console.log('Hello Cart',cart);
      await cart.save();

      console.log('Current Price',currentPrice);
     

      // const populatedCart = await Cart.findOne({userId:req.user}).populate('items.productId').lean()
       
      // if(populatedCart && populatedCart.items.length){
      //  count=populatedCart.items.length
      // }
      // console.log('count',count);
      // console.log(populatedCart);

      const calculatedCart = await calculateCart(cart);

      res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.CREATED,cart:calculatedCart}) 

    }catch(err){
      console.log('Error in post cart controller',err)
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message:RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR})
    }

  

 
  }
  

const updateQuanity = async (req,res)=>{
  console.log('Call recieved in update quantity');

  const { productId,variantId,type } = req.body; 

  console.log(req.body);

  try{

    if(!req.user){
      return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Please login !'})
    }

  let cart = await Cart.findOne({userId:req.user}).populate('items.productId')

  if(!cart){
    return res.status(HTTP_STATUS.NOT_FOUND).json({message:RESPONSE_MESSAGES.NOT_FOUND})
  }

  const product = await Products.findOne({_id:productId,'variants.sku':variantId},{isActive:1,isDeleted:1,variants:{$elemMatch:{sku:variantId}}});
  

  if(!product.isActive || product.isDeleted){
    await Cart.findOneAndUpdate({userId},{$pull:{'items':{productId:product._id}}},{new:true})
    return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Product is unavailable'})
  }
  

  if(!product){
    return res.status(HTTP_STATUS.NOT_FOUND).json({message:RESPONSE_MESSAGES.BAD_REQUEST})
  }



  const stock = product.variants[0].attributes.stock;
  let unitPrice = Math.round(parseInt(product.variants[0].attributes.price)*0.01*(100-parseInt(product.variants[0].attributes.discount)))



  const item = cart.items.find(ite=>
    ite.productId._id.toString() === productId &&
    ite.variantId===variantId
  )

  

  if(!item){
    return res.status(HTTP_STATUS.NOT_FOUND).json({message:RESPONSE_MESSAGES.NOT_FOUND})
  }
console.log('variantId',variantId);
  let updateValue = type=='increment'?1:-1
  console.log(item.quantity);

  if(item.quantity+updateValue>stock){
    return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Not enough stock available '})
  }

  if(item.quantity+updateValue>10){
    return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Only 10 Quantity per transaction'})
  }

  if((item.quantity+updateValue)<1){
   return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Quantity cannot be less than 1'})
  }

  item.quantity+=updateValue;
  
  item.totalPrice = item.quantity* unitPrice;



  await cart.save();


 const calculatedCart = await calculateCart(cart);
 console.log('calculated cart',calculateCart);

  res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,cart:calculatedCart})

  }catch(err){
    console.log('Error in Update Quantity',err);
  }
  
}

const deleteCart = async (req,res)=>{
  try{
    // console.log('Call at deletecart');
    // console.log(req.params);
    const variantId = req.params.id;
    const token = req.cookies.token;
    let count=0;
    if(!token){
      return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST})
    }

    const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY);
    const userId=decoded.userId;
    // console.log('variantId',variantId);
    const updatedCart= await Cart.findOneAndUpdate({userId},{$pull:{items:{variantId}}},{new:true})
    // console.log('updatedcart',updatedCart);

    if(!updatedCart){
      res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Something went wrong !'})
    }
    const populatedCart = await Cart.findOne({userId:req.user}).populate('items.productId').lean()
       
      if(populatedCart && populatedCart.items.length){
       count=populatedCart.items.length
      }
      console.log('count',count);
      // console.log(populatedCart);
    res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,customMessage:'Item removed from the Cart',updatedCart,cartCount:count})

  }catch(err){
    console.log('Error in deleteCart controller',err);
    res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Something went wrong !'})
  }
  
  
}

export default {
  getCart,
  postCart,
  deleteCart,
  updateQuanity,
}