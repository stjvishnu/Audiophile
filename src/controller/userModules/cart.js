import Products from '../../models/productModel.js'
import Cart from '../../models/cartModal.js'

import jwt from "jsonwebtoken";
import {HTTP_STATUS,RESPONSE_MESSAGES} from '../../utils/constants.js'

const getCart = (req,res)=>{
  res.render('user/cart-demo.ejs')
}

const postCart = async (req,res)=>{
  console.log('REcieved at post cart controller');
  console.log(req.query);
  const token = req.cookies.token;
  if(!token){
    return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST})
  }
  const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY)
 const userId=decoded.userId;
  const cart = await Cart.findById(userId) || new Cart({userId,items:[]});
 
  const productId = req.query.productId
  const product = await Products.findById(productId);
  const variantId = product.variants[0].sku;
  console.log(variantId);
  // console.log(product)
  // cart.items.push({
  //   productId,
  //   variantId,
  //   quantity
  // })
  // await cart.save()
  

  res.status(200).json({product:product})
}

export default {
  getCart,
  postCart
}