import Category from '../../models/categoryModel.js';
import Products from '../../models/productModel.js';
import User from '../../models/userModel.js';
import Orders from '../../models/orderModel.js';
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
    // const od = await Orders.findById(orderId)
    // console.log(od);
    const updatedOrder = await Orders.findByIdAndUpdate(orderId,{$set:{orderStatus:newStatus}});
    res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,updatedOrder})
    
  } catch (error) {
    console.log('Error in changeOrderStatus controller',error);
  }
}
export default{
  getOrders,
  getOrderDetails,
  changeOrderStatus
}