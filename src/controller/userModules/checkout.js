import User from "../../models/userModel.js";
import Product from "../../models/productModel.js";
import Address from '../../models/addressModel.js';
import Cart from '../../models/cartModal.js'
import Order from '../../models/orderModel.js'
import Wishlist from '../../models/wishlistModel.js'
import Wallet from '../../models/walletModel.js'
import WalletTransaction from "../../models/walletTransaction.js";
import Payment from '../../models/paymentModel.js'
import Coupon from '../../models/couponModel.js'
import calculateCart from '../../utils/cartCalculator.js'
import DeliveryZone from "../../models/deliveryZoneModel.js";

import {HTTP_STATUS,RESPONSE_MESSAGES} from "../../utils/constants.js"

import Razorpay from "razorpay";
import crypto from 'crypto'


const getCheckout = async (req,res)=>{
  console.log('Call recieved inside getCheckout');
  try{

    if(!req.user){
      res.status(HTTP_STATUS.UNAUTHORIZED).json({message:RESPONSE_MESSAGES.UNAUTHORIZED,customMessage:'Please re-login to continue'})
    }

    const user = await User.findById(req.user)
    const cart = await Cart.findOne({userId:req.user}).populate('items.productId');
    const address = await Address.findOne({userId:req.user}).sort({isDefault:-1})
    const pincode = address.pincode.toString().slice(0,1)
    const deliveryzone = await DeliveryZone.find().lean()
    const charge = deliveryzone.find(d=>d.pincode.toString()===pincode.toString()).charge
    const addresses = await Address.find({userId:req.user})||[]
    const calculatedCart = await calculateCart(cart,charge);
    const coupons =  await Coupon.find({minPurchase:{$lte:calculatedCart.total}})
    


    console.log(cart)
  
     res.render('user/checkout',{cart:calculatedCart,address,user,addresses,coupons,charge})

  }catch(err){
    console.log('Error in getCheckout controller',err);
  }
  
}

//Helper :  Clear Cart
const clearCart = async (userId)=>{
  await Cart.findOneAndUpdate({userId},{$set:{items:[]}},{new:true})
}
//Helper : Reduce Stock
const reduceStock =  async (items)=>{
  await Promise.all(
    items.map((item)=>{
      return Product.updateOne({_id:item.productId,'variants.sku':item.variantId},{$inc:{'variants.$.attributes.stock':-item.quantity}})
    })

  )  
}

const increaseStock =  async (items)=>{
  await Promise.all(
    items.map((item)=>{
      return Product.updateOne({_id:item.productId,'variants.sku':item.variantId},{$inc:{'variants.$.attributes.stock':item.quantity}})
    })
  )  
}

const debitWallet = async (userId,amount,reason,orderId)=>{
  console.log('Call recieved in credit wallet helper function');
  
    const wallet = await Wallet.findOne({userId})
    if(!wallet){
      throw new Error('Wallet Not Found, Login Again')
    }
    if(amount>wallet.balance){
      throw new Error('Bill amount is higher than wallet balance, Please use another payment method')
    }
    const newBalance = wallet.balance-amount;
    wallet.balance=newBalance;
    await wallet.save();

    await WalletTransaction.create({
      walletId: wallet._id,
      type: "debit",
      amount,
      reason,
      orderId,
      balanceAfter: newBalance
    })

    console.log('Error in debitWallet helper function');


}


// --------------------------------------------------
// Controller: Place Order (COD OR RAZORPAY)
// --------------------------------------------------

const postPlaceOrderInCheckout = async (req,res)=>{
  console.log('Request Recived in post place order in checkout');
  let orderIdDup;
  try{
    console.log(req.body)
    const {addressId,addressAtTimeOfOrder,paymentMethod,couponCode} = req.body;
      
    if(!req.user){
      res.status(HTTP_STATUS.UNAUTHORIZED).json({message:RESPONSE_MESSAGES.UNAUTHORIZED,customMessage:'Please re-login to continue'})
    }
    const user = await User.findById(req.user)
    const addressExists = await Address.findById(addressId);


    if(!addressId || !addressExists){
      return res.status(HTTP_STATUS.NOT_FOUND).json({message:RESPONSE_MESSAGES.NOT_FOUND,customMessage:'Select A Valid Address to order'})
    }

      const cart = await Cart.findOne({userId:req.user}).populate('items.productId')

            
      const pincode = addressExists.pincode.toString().slice(0,1)
      const deliveryzone = await DeliveryZone.find().lean()
      const charge = deliveryzone.find(d=>d.pincode.toString()===pincode.toString()).charge
   

      const calculatedCart = await calculateCart(cart,charge);

      if(couponCode){
        const coupon = await Coupon.findOne({code:couponCode});
        if (!coupon) {
          return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Coupon code not found'});
        }
        if (!coupon.isActive || coupon.usageLimit <= 0) {
          return res.status(HTTP_STATUS.BAD_REQUEST).json({ message:RESPONSE_MESSAGES.BAD_REQUEST, customMessage: 'Coupon is not active or has been used too many times.' });
        }

        if(calculatedCart.total<coupon.minPurchase){
          console.log('calculatedCart.total<coupon.minPurchase)');
          return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage: `Coupon requires a minimum purchase of ₹ ${coupon.minPurchase}`})
        }

        let discountAmount =0;
        if(coupon.discountType =='percentage'){
          discountAmount = calculatedCart.total * (coupon.discountValue/100)
          discountAmount = Math.min(discountAmount, coupon.maxDiscount || discountAmount);
        }else if (coupon.discountType === 'fixed') {
          discountAmount = coupon.discount;
      }

    calculatedCart.couponDiscount = discountAmount;
    calculatedCart.finalPayableAmount = calculatedCart.total-discountAmount;
      }
      const items=[];
    
      const variantIds =[]

      calculatedCart.items.forEach((item)=>{

      console.log('brand name:',item.brand);
      items.push({
        productId: item.productId,
          variantId: item.variantId,
          categoryName:item.category,
          brandName:item.brand,
          productName : item.name,
          productImage : item.imgUrl,
          productColor:item.color,
          sku : item.variantId,
          priceAtPurchase: item.currentPrice,
          quantity:item.quantity,
          totalPrice: item.itemTotal,
          offerApplied: item.appliedOffer?true:false
      })

      variantIds.push(item.variantId);
    
      })


    if(paymentMethod==='cod'){
         
          const payment = {
            method:paymentMethod,
            status:'pending'
          }

          let codPayment =   calculatedCart.finalPayableAmount || calculatedCart.total ;

          if(codPayment){
            if(codPayment>1000){
              return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES,customMessage:'COD not allowed for orders above ₹1000'});
            }
          }

          console.log('Calculated cart',calculateCart);
          const orders =await Order.create({
            userId:req.user,
            items,
            shippingAddress:addressAtTimeOfOrder,
            payment,
            orderStatus:'processing',
            deliveryCharge:calculatedCart.charge,
            subTotal:parseInt(calculatedCart.subTotal),
            discount:parseInt(calculatedCart.totalDiscount),
            couponDiscount:parseInt(calculatedCart.couponDiscount)||null,
            total: parseInt(calculatedCart.finalPayableAmount+charge)|| parseInt(calculatedCart.total+charge),
          })

          console.log('orders',orders);
    
          if(!orders) return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Error in placing order'})

          await Wishlist.findOneAndUpdate({user:req.user},{$pull:{items:{variantId:{$in:variantIds}}}})

           //stock management
          clearCart(req.user)

          const productInfo=[];

          orders.items.forEach((order)=>{
            productInfo.push({
              productId:order.productId,
              variantId:order.variantId,
              quantity:order.quantity
            })
          })
          
          //reduce stock
          reduceStock(productInfo)
          


         return res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,orderId:orders._id})

    }
    
    else if(paymentMethod==='wallet'){

      try {
        
      console.log('call inside wallet');
      const wallet = await Wallet.findOne({userId:req.user})
      if(!wallet) return res.status(HTTP_STATUS.NOT_FOUND).json({message:RESPONSE_MESSAGES.NOT_FOUND,customMessage:'Request Failed, Please Re-login again to order'})
      if(calculatedCart.total>wallet.balance){
        return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Wallet balance is less than the bill amount'})
      }
      const payment = {
            method:paymentMethod,
            status:'paid'
          }


     const orders= await Order.create({
        userId:req.user,
        items,
        shippingAddress:addressAtTimeOfOrder,
        payment,
        orderStatus:'processing',
        deliveryCharge:calculatedCart.charge,
        subTotal:parseInt(calculatedCart.subTotal),
        discount:parseInt(calculatedCart.totalDiscount),
        couponDiscount:parseInt(calculatedCart.couponDiscount)||null,
        total: parseInt(calculatedCart.finalPayableAmount)|| parseInt(calculatedCart.total),
      })
      if(!orders) return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Error in placing order'})

      await Wishlist.findOneAndUpdate({user:req.user},{$pull:{items:{variantId:{$in:variantIds}}}})

      //stock management
     clearCart(req.user)

     const productInfo=[];

     orders.items.forEach((order)=>{
       productInfo.push({
         productId:order.productId,
         variantId:order.variantId,
         quantity:order.quantity
       })
     })
     
     //reduce stock
     reduceStock(productInfo)
     
     await debitWallet(orders.userId,orders.total,orders.orderStatus,orders.orderNumber)


     res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,orderId:orders._id,amount:orders.total})
    } catch (error) {
        console.log('Error in creating order using wallet',error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message:RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,customMessage:'Error occured in placing order,please try again'})
     }
    }
    
    else if(paymentMethod==='razorpay'){

      console.log('Call recived in razorpay');
      console.log('calculated cart',calculatedCart);
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
        deliveryCharge:calculatedCart.charge,
        subTotal:parseInt(calculatedCart.subTotal),
        discount:parseInt(calculatedCart.totalDiscount),
        couponDiscount:parseInt(calculatedCart.couponDiscount)||null,
        total: parseInt(calculatedCart.finalPayableAmount)|| parseInt(calculatedCart.total),
      })
      console.log('check order',orders);
      const orderData = {
        orderId:orders._id,
        amount:orders.total
      }



      console.log('order created in razorpay',orders);
      console.log('orderData',orderData);
      return res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.CREATED,orderData})

    }

   

    
  }catch(err){
    console.log('Error in postPlaceOrderInCheckout controller',err);
    console.log('orders id in catch',orderIdDup);
   return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message:RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,orderId:orderIdDup})
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

const createRazorpayOrder = async (req,res)=>{
  console.log('Call recieved in createRazorpayorder');
  try {
    const {amount,orderId} = req.body

    console.log(req.body);
    const razorpay = new Razorpay({
      key_id:process.env.RAZORPAY_KEY_ID,
      key_secret:process.env.RAZORPAY_KEY_SECRET
    })

    const options = {
      amount : parseInt(amount)*100,
      currency:'INR'
    }


    const rzpOrder = await razorpay.orders.create(options)


    await Payment.create({
      orderId: orderId,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency
    });

    const RAZORPAY_KEY = process.env.RAZORPAY_KEY_ID;

    console.log('razorpaykey',RAZORPAY_KEY);

    res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,orderId,rzpOrder,RAZORPAY_KEY})
  } catch (error) {
    console.log('error in create razorpay order controller',error);
    res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,customMessage:'Server Busy , Try again Later'})
  }
}

const verifyPayment = async (req,res)=>{
  try {
    console.log('call recieved in verify payament');
    console.log(req.body);
    const {orderId,addressId,addressAtTimeOfOrder,razorpay_order_id,razorpay_payment_id,razorpay_signature}=req.body;

    if(!req.user){
      return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Please login again to order'})
    }

    const generated_signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

    if(generated_signature=== razorpay_signature){
      //means payment is authenticated
      const order = await Order.findById(orderId);
      order.payment.status='paid';

    

    await clearCart(req.user)

    const productInfo=[];

    order.items.forEach((order)=>{
      productInfo.push({
        productId:order.productId,
        variantId:order.variantId,
        quantity:order.quantity
      })
    })

    await reduceStock(productInfo)
    order.save();
    res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,customMessage:'Order Placed Successfully',orderId:order._id})
  }
  } catch (error) {
    console.log('Error in verify payement',error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message:RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR})
  }
}

const cancelRpzOrder = async (req,res)=>{
  try {
    console.log('call recived inside cancelrpzorder');
    const {orderId} = req.params
    const order = await Order.findById(orderId)
    if(order && order.payment.status==='pending'){
      await Order.findByIdAndDelete(orderId);
      const productInfo=[];

      order.items.forEach((order)=>{
        productInfo.push({
          productId:order.productId,
          variantId:order.variantId,
          quantity:order.quantity
        })
      })
      await increaseStock(productInfo)
      return res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,customMessage:'Payment Cancelled'})
    }
  } catch (error) {
    console.log('Error in cancelRpzOrder controller',error);
    res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST})
  }
}

const retryRpzPayment = async (req,res)=>{
  console.log('call recieved inside retryrpzpayment conroller');
  try {
    
  } catch (error) {
    
  }
}

const applyCoupon = async (req,res)=>{
  console.log('call recieved in apply coupon controller');

  try {
    const { couponCode, total} = req.body;

    const coupon = await Coupon.findOne({code:couponCode,isActive:true,isDelete:false}).lean();
  
      if (!coupon) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Coupon code not found'});
      }

      if (!coupon.isActive || coupon.usageLimit <= 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ message:RESPONSE_MESSAGES.BAD_REQUEST, customMessage: 'Coupon is not active or has been used too many times.' });
      }

      const cart = await Cart.findOne({userId:req.user})
      if(!cart) return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Please re-login again !'})

      const calculatedCart = await calculateCart(cart)

      if(calculatedCart.total<coupon.minPurchase){
        console.log('calculatedCart.total<coupon.minPurchase)');
        return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage: `Coupon requires a minimum purchase of ₹ ${coupon.minPurchase}`})
      }

      let discountAmount =0;
      if(coupon.discountType =='percentage'){
        discountAmount = Math.round(calculatedCart.total * (coupon.discountValue/100))
        discountAmount = Math.min(discountAmount, coupon.maxDiscount || discountAmount);
      }else if (coupon.discountType === 'fixed') {
        discountAmount = Math.round(coupon.discountValue);
    }



    calculatedCart.couponDiscount = discountAmount;
    calculatedCart.finalPayableAmount = Math.max(calculatedCart.total-discountAmount,0);

    console.log('calculated cart in apply coupon controller',calculatedCart);

    res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,customMessage:'Coupon Applied successfully',cart:calculatedCart})

  } catch (error) {
    console.log('Erro in applying coupon',error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message:RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,customMessage:'Server Error, try again later !'})
  }
}


export default {
  getCheckout,
  postPlaceOrderInCheckout,
  createRazorpayOrder,
  cancelRpzOrder,
  getOrderSuccess,
  getOrderFailed,
  verifyPayment,
  retryRpzPayment,
  applyCoupon
}