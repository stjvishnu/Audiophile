import Category from '../../models/categoryModel.js';
import Products from '../../models/productModel.js';
import User from '../../models/userModel.js';
import Orders from '../../models/orderModel.js';
import Wallet from '../../models/walletModel.js'
import WalletTransaction from '../../models/walletTransaction.js'
import PDFDocument from 'pdfkit'

import { HTTP_STATUS,RESPONSE_MESSAGES } from '../../utils/constants.js'

const getOrders = async (req,res)=>{
  console.log('Call recieved in getOrders Controller');
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page-1) * limit;
    const totalOrders = await Orders.countDocuments();
    const totalPages = Math.ceil(totalOrders/limit);

    const orders = await Orders.find().sort({createdAt:-1}).skip(skip).limit(limit).populate('userId')
    console.log('Orders',orders);

    res.render('admin/orders.ejs',{orders,layout:"layouts/admin-dashboard-layout",pageTitle :"Orders",currentPage:page,totalPages:totalPages})
  } catch (error) {
    
  }
}

const getOrderDetails = async (req,res)=>{
  console.log('Call recieved in getOrderDetails');
  console.log('Trouble');
  try {
    const {orderId} = req.params;
    const orders=await Orders.findById(orderId).populate('userId');
    console.log('Order',orders);

    res.render('admin/order-details.ejs',{orders,layout:"layouts/admin-dashboard-layout",pageTitle :"Order-details"})


  } catch (error) {
    
  }
}

const changeOrderStatus =  async (req,res)=>{
  console.log('hello',req.body);
  try {
    const {orderId,newStatus} = req.body;
    if(newStatus=='delivered'){
      await Orders.updateOne({_id:orderId},{$set:{'items.$[].itemStatus':'delivered'}})
    }
    const updatedOrder = await Orders.findByIdAndUpdate(orderId,{$set:{orderStatus:newStatus}});
    res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,updatedOrder})
    
  } catch (error) {
    console.log('Error in changeOrderStatus controller',error);
  }
}

//helper function
async function creditWallet(userId,amount,reason,orderId){
  console.log('Call recieved in credit wallet helper function');
  try {
    const wallet = await Wallet.findOne({userId})
    if(!wallet){
      throw new Error('Wallet Not Found, Login Again')
    }
    const newBalance = wallet.balance+amount;
    wallet.balance=newBalance;
    await wallet.save();

    await WalletTransaction.create({
      walletId: wallet._id,
      type: "credit",
      amount,
      reason,
      orderId,
      balanceAfter: newBalance
    })
  } catch (error) {
    console.log('Error in creditWallet helper function',error);
  }
}

async function updateStock(productId,variantId,quantity){
  try {
    // const product = await Products.findOne({_id:productId,'variants.sku':variantId},{variants:{$elemMatch:{sku:variantId}}});

    // product.variants[0].attributes.stock+=quantity
    // await product.save();
    console.log('Inside update stock');
    await Products.findOneAndUpdate({_id:productId,'variants.sku':variantId},{$inc:{'variants.$.attributes.stock':quantity}})
  } catch (error) {
    console.log('Error in updating stock',error);
  }
}

const returnWholeItem = async (req,res)=>{
  try {
    console.log('Call inside returnWhole Item');
    const {orderId,reason,action} = req.body;
    console.log('req.body',req.body);
    const order = await Orders.findOne({_id:orderId});
    if(!order) return res.status(HTTP_STATUS.NOT_FOUND).json({message:RESPONSE_MESSAGES.NOT_FOUND,customMessage:'Order not found'})

    if(action=='return-accepted'){
      order.orderStatus='returned';
      await order.save();
      if(order.payment.method=='razorpay' || order.payment.method=='wallet'){
        let amount = order.finalPayableAmount || order.totalPrice;
        creditWallet(order.userId,amount,order.orderStatus,order.orderNumber)
      }
       order.items.forEach(item=>updateStock(item.productId,item.variantId,item.quantity) )
       return res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,customMessage:'Order Status Updated,Refund Intiated'})
    }else if(action=='return-rejected'){
      order.orderStatus='return-rejected';
      await order.save();
      res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,customMessage:'Order Status Updated'})

    }
  } catch (error) {
    console.log('Error in returning item',error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message:RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,customMessage:'Server Error, try again later !'});
  }
}


const returnItem  = async (req,res)=>{
  console.log('call inside admin order return');
  try {
    const {orderId,itemId,action} = req.body;

    const order = await Orders.findOne({_id:orderId,'items._id':itemId})
    if(!order) return res.status(HTTP_STATUS.NOT_FOUND).json({message:RESPONSE_MESSAGES.NOT_FOUND,customMessage:'Order not found'})
    const item = order.items.id(itemId);
    
    if(action=='return-accepted'){
      item.itemStatus='returned'
      order.orderStatus='partial-return'
      await order.save();
      if(order.payment.method=='razorpay' || order.payment.method=='wallet'){
        let amount=null;

          amount=item.totalPrice
        
        if(order.couponDiscount){
          let couponValue = Math.round(order.couponDiscount);
          let returnOrderValue = item.totalPrice;
          // let remainingOrderValue = order.total-item.totalPrice;
          let itemValueAfterApplyCoupon = Math.round(returnOrderValue-(returnOrderValue/order.total*couponValue))
          amount=itemValueAfterApplyCoupon;
          creditWallet(order.userId,amount,order.orderStatus,order.orderNumber)
          updateStock(item.productId,item.variantId,item.quantity)
          return res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,customMessage:'Order Status Updated,Refund Intiated'})

        }
        creditWallet(order.userId,amount,order.orderStatus,order.orderNumber)
        updateStock(item.productId,item.variantId,item.quantity)
        console.log('Tetsting response');
       return res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,customMessage:'Order Status Updated,Refund Intiated'})
       
      }
      updateStock(item.productId,item.variantId,item.quantity)
      console.log('checking response');
      res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,customMessage:'Order Status Updated'})
    }else if(action=='return-rejected'){
      item.itemStatus='return-rejected';
      await order.save();
      res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,customMessage:'Order Status Updated'})
    }
  } catch (error) {
    console.log('Error in returning item',error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message:RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,customMessage:'Server Error, try again later !'});

  }
}

const searchOrders = async (req,res)=>{
  console.log('call recived in search orders');
  console.log('req.query',req.query);
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page -1) * limit;
  try {
    const {searchTerm} = req.query;

    const orders = await Orders.aggregate([
      {$lookup:{from:'users',localField:'userId',foreignField:'_id',as:'user'}},
      {$unwind:'$user'},
      {
        $match: {
          $or: [
            { orderNumber: { $regex: searchTerm, $options: 'i' } },
            { 'payment.method': { $regex: searchTerm, $options: 'i' } },
            { orderStatus: { $regex: searchTerm, $options: 'i' } },
            { 'user.firstName': { $regex: searchTerm, $options: 'i' } }
          ]
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ])




    // const orders = await Orders.find({
    //   $or:[
    //    {orderNumber:{$regex:searchTerm,$options:'i'}},
    //    {'payment.method':{$regex:searchTerm,$options:'i'}},
    //    {orderStatus:{$regex:searchTerm,$options:'i'}}
    //   ]
      
    // }).skip(skip).limit(limit).populate('userId')

    if(orders.length==0){
      return res.status(HTTP_STATUS.OK).json([]);
    }
    res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,orders})

  } catch (error) {
    console.log('Error in search orders',error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message:RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR});

  }
}

const loadOrders= async (req,res)=>{
  console.log('Call recieved in load products');
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page-1) * limit;
    const totalDocuments = await Orders.countDocuments()
    const totalPages = Math.ceil(totalDocuments / limit); 
    const orders = await Orders.find().sort({createdAt:-1}).skip(skip).limit(limit).populate('userId');
    res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,orders})
  } catch (error) {
    console.log('Error in load products');
  }
}

const filterOrders = async(req,res)=>{
  console.log('Call inside filter orders');
  console.log(req.query);
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page-1) * limit;
    const {orderStatus} = req.query;
    const {paymentMethod} = req.query;
    const {searchTerm} = req.query;

    let matchStage = {};
    if(orderStatus){
      matchStage.orderStatus = orderStatus
    }
    if(paymentMethod){
      matchStage['payment.method'] = paymentMethod;
    }
    if(searchTerm){
      matchStage.$or=[
        { orderNumber: { $regex: searchTerm, $options: 'i' } },
        { 'payment.method': { $regex: searchTerm, $options: 'i' } },
        { orderStatus: { $regex: searchTerm, $options: 'i' } },
        { 'user.firstName': { $regex: searchTerm, $options: 'i' } }
      ]
    }
   
      console.log('match stage',matchStage);
    

    const orders = await Orders.aggregate([
      {$lookup:{from:'users',localField:'userId',foreignField:'_id',as:'user'}},
      {$unwind:'$user'},
      {
        $match: matchStage
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ])


    res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,orders})
    // const orders = await Orders.find({'payment.paymentMethod':option}).skip(skip).limit(limit)
  } catch (error) {
    console.log('Error in filter orders',error);
  }
}


export default{
  getOrders,
  getOrderDetails,
  changeOrderStatus,
  returnWholeItem,
  returnItem,
  searchOrders,
  loadOrders,
  filterOrders
}