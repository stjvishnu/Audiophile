import User from "../../models/userModel.js";
import Product from "../../models/productModel.js";
import Address from '../../models/addressModel.js';
import Cart from '../../models/cartModal.js'
import Order from '../../models/orderModel.js'
import Wishlist from '../../models/wishlistModel.js'

import {HTTP_STATUS,RESPONSE_MESSAGES} from "../../utils/constants.js"


const getCheckout = async (req,res)=>{
  console.log('Call recieved inside getCheckout');
  try{

    if(!req.user){
      res.status(HTTP_STATUS.UNAUTHORIZED).json({message:RESPONSE_MESSAGES.UNAUTHORIZED,customMessage:'Please re-login to continue'})
    }

    const user = await User.findById(req.user)
    const cart = await Cart.findOne({userId:req.user}).populate('items.productId');
    const address = await Address.findOne({userId:req.user}).sort({isDefault:-1})
    const addresses = await Address.find({userId:req.user})||[]

    const offers=[
      {
        message:'Get ₹100 off on prepaid orders',
        offerr:'Discount:100'
      }
    ]

    console.log(cart)
  
     res.render('user/checkout',{cart,address,user,offers,addresses})

  }catch(err){
    console.log('Error in getCheckout controller',err);
  }
  
}

const postPlaceOrderInCheckout = async (req,res)=>{
  console.log('Request Recived in post place order in checkout');
  let orderIdDup;
  try{
    console.log(req.body)
    const {addressId,addressAtTimeOfOrder,paymentMethod} = req.body;
      

    if(!req.user){
      res.status(HTTP_STATUS.UNAUTHORIZED).json({message:RESPONSE_MESSAGES.UNAUTHORIZED,customMessage:'Please re-login to continue'})
    }
    const user = await User.findById(req.user)
    const addressExists = await Address.findById(addressId);

    if(!addressId || !addressExists){
      return res.status(HTTP_STATUS.NOT_FOUND).json({message:RESPONSE_MESSAGES.NOT_FOUND,customMessage:'Select A Valid Address to order'})
    }

    const cart = await Cart.findOne({userId:req.user}).populate('items.productId')
    console.log('cart',cart);
    // cart.items.forEach((item)=>{
    //   console.log(item.productId._id)
    // })

    const items=[];
    let subTotal = 0;
    let discount =0;
    let total=0;
    const variantIds =[]

    cart.items.forEach((item)=>{
     const variant = item.productId.variants.find((v)=>v.sku===item.variantId)
    
     items.push({
      productId: item.productId._id,
         variantId: item.variantId,
         categoryName:item.category,
         productName : item.productId.name,
         productImage : variant.attributes.productImages[0],
         productColor:variant.attributes.color,
         sku : item.variantId,
         priceAtPurchase: item.currentPrice,
         quantity:item.quantity,
         totalPrice: item.totalPrice,
         
     })
     subTotal+=item.totalPrice;
     discount+=variant.attributes.discount;

     variantIds.push(item.variantId);
   

    })

    const payment = {
      method:paymentMethod,
      status:'pending'
    }
    const orders =await Order.create({
      userId:req.user,
      items,
      shippingAddress:addressAtTimeOfOrder,
      payment,
      orderStatus:'processing',
      subTotal,
      discount,
      total: subTotal
    })

    orderIdDup=orders._id;
    
    if(!orders) res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Error in placing order'})

    //delete items in cart after successfull checkout

     const cartDeleted= await Cart.findOneAndUpdate({userId:req.user},{$set:{items:[]}},{new:true})
     console.log('cartdeleted',cartDeleted);
     await Wishlist.findOneAndUpdate({user:req.user},{$pull:{items:{variantId:{$in:variantIds}}}})
         
    console.log('orderItems',orders)
    console.log('orderId',orders._id);

    //stock management
   

    const productInfo=[];

    orders.items.forEach((order)=>{
      productInfo.push({
        productId:order.productId,
        variantId:order.variantId,
        quantity:order.quantity
      })
    })

   const stockUpdated= await Promise.all(

      productInfo.map((pInfo)=>{
        return Product.updateOne({_id:pInfo.productId,'variants.sku':pInfo.variantId},{$inc:{'variants.$.attributes.stock':-pInfo.quantity}})
      })

    )  
    
    console.log('Stock updated',stockUpdated);

    res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,orderId:orders._id})

  }catch(err){
    console.log('Error in postPlaceOrderInCheckout controller',err);
    console.log('orders id in catch',orderIdDup);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message:RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,orderId:orderIdDup})
  }
}

const getOrderSuccess = async(req,res)=>{
  console.log('Call recievied in getOrderSuccess');
  try{
    const {orderId} = req.params;
    const orders = await Order.findOne({_id:orderId})
    if(!orders) return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Order not found'});

    const user = await User.findById(orders.userId);
    const address = orders.shippingAddress;
    const status='success'


    console.log('user',user);
    console.log('orders',orders);
    console.log('address',address);
    res.render('user/order-status.ejs',{status,user,address,orders})
  }catch(error){

  }
}

const getOrderFailed = async(req,res)=>{
  try{
    const {orderId} = req.params;
    const orders = await Order.findOne({_id:orderId})
    if(!orders) return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Order not found'});

    const user = await User.findById(orders.userId);
    const address = orders.shippingAddress;
    const status='failed'


    console.log('user',user);
    console.log('orders',orders);
    console.log('address',address);
    res.render('user/order-status.ejs',{status,user,orders})
  }catch(error){
    
  }
}


export default {
  getCheckout,
  postPlaceOrderInCheckout,
  getOrderSuccess,
  getOrderFailed
}