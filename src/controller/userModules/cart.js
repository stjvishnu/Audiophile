import Products from '../../models/productModel.js'
import Cart from '../../models/cartModal.js'

import jwt from "jsonwebtoken";
import {HTTP_STATUS,RESPONSE_MESSAGES} from '../../utils/constants.js'

const getCart = async (req,res)=>{
  console.log('Call Recieved at getCart controller');
  try{
    const token = req.cookies.token;
      if(!token){
        return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST})
      }

      const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY);
      const userId=decoded.userId;
      let cart = await Cart.findOne({userId:userId}).populate('items.productId');
      if(!cart){
        return  res.status(HTTP_STATUS.NOT_FOUND).json({message:RESPONSE_MESSAGES.NOT_FOUND,cart})
      }
      res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.CREATED,cart})

  }catch(err){
    return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST})
  }
}


const postCart = async (req,res)=>{

    try{
      const token = req.cookies.token;
      if(!token){
        return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST})
      }

      const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY);
      const userId=decoded.userId;
      console.log(req.body);
      const { productId, quantity,variantId } = req.body; 

      let cart = await Cart.findOne({userId:userId}).populate('items.productId');
      if(!cart){
        cart = new Cart({userId:userId,items:[]});
      }

      const product = await Products.findOne({_id:productId,'variants.sku':variantId},{isActive:1,isDeleted:1,'variants.$':1});


      if(!product){
        return res.status(HTTP_STATUS.NOT_FOUND).json({message:RESPONSE_MESSAGES.NOT_FOUND})
      }

      if(!product.isActive || product.isDeleted){
        await Cart.findOneAndUpdate({userId},{$pull:{'items':{productId:product._id}}},{new:true})
        return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Product is not available at the moment'})
      }
     


      const price= product.variants[0].attributes.price;
      const discount = product.variants[0].attributes.discount;

      const existingItem= cart?.items?.find((item)=>{
        return item?.productId?._id.toString() ===productId && item?.variantId===variantId
      })

      console.log('quantity',quantity);
      console.log('exisitng item',existingItem)

      if(existingItem){

        if(existingItem.quantity+quantity>10){
          return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Reached Maximum Quantity Per Transaction'})

        }

        if(existingItem.quantity+quantity>existingItem.productId.variants[0].attributes.stock){
          return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Not enough stock available '})
        }

        existingItem.quantity+=quantity
        existingItem.price=existingItem.quantity*price*0.01*(100-discount);
      }else{
        cart.items.push({
       
          productId:productId,
          variantId:variantId,
          quantity:quantity,
          price:quantity*price*0.01*(100-discount),
        
      })
      }

      await cart.save();

      const populatedCart = await Cart.findById(cart._id).populate('items.productId')
      console.log(populatedCart);

      res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.CREATED,cart:populatedCart}) 

    }catch(err){
      console.log('Error in post cart controller',err)
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message:RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR})
    }

  

 
  }
  

const updateQuanity = async (req,res)=>{
  console.log('Call recieved');
  const { productId,variantId,variantColor,type } = req.body; 
  console.log(type);

  try{

   const token = req.cookies.token;
   if(!token){
    return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST})
   }

  const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY)
  const userId=decoded.userId; 


  let cart = await Cart.findOne({userId:userId}).populate('items.productId');
  //  console.log('Cart from update controller',cart);

  //  console.log(cart);


  if(!cart){
    return res.status(HTTP_STATUS.NOT_FOUND).json({message:RESPONSE_MESSAGES.NOT_FOUND})
  }
//  console.log('Hello');
  //Find the product in DB
  const product = await Products.findOne({_id:productId,'variants.sku':variantId},{isActive:1,isDeleted:1,'variants.$':1});

  if(!product.isActive || !product.isDeleted){
    await Cart.findOneAndUpdate({userId},{$pull:{'items':{productId:product._id}}},{new:true})
    return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Product is unavailable'})
  }
  
  // console.log('Product',product)
  // console.log('HIIII');
  
  
  if(!product){
    return res.status(HTTP_STATUS.NOT_FOUND).json({message:RESPONSE_MESSAGES.BAD_REQUEST})
  }

  

// console.log('Product from update controler',product);



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
  item.price = item.quantity* unitPrice;

  await cart.save();

  res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,updatedItem:item})

  }catch(err){
    console.log('Error in Update Quantity',err);
  }
  
}

const deleteCart = async (req,res)=>{
  try{
    console.log('Call at deletecart');
    console.log(req.params);
    const variantId = req.params.id;
    const token = req.cookies.token;
    if(!token){
      return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST})
    }

    const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY);
    const userId=decoded.userId;
    console.log('variantId',variantId);
    const updatedCart= await Cart.findOneAndUpdate({userId},{$pull:{items:{variantId}}},{new:true})
    console.log('updatedcart',updatedCart);

    if(!updatedCart){
      res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Something went wrong !'})
    }

    res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,customMessage:'Item removed from the Cart'})

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