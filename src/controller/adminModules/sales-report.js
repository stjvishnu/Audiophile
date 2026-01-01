import Orders from '../../models/orderModel.js'
import { HTTP_STATUS,RESPONSE_MESSAGES } from '../../utils/constants.js'

const getSalesReport = async (req,res) =>{

  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page -1) * limit;
    const totalOrders = await Orders.find().countDocuments();
    console.log('total orders',totalOrders);
    const totalPages = Math.ceil(totalOrders/limit);
    const orders = await Orders.find().populate('userId').sort({createdAt:-1}).skip(skip).limit(limit);
    const salesCount = await Orders.find({orderStatus:{$in:['delivered','partial-return']}}).countDocuments();
    const orderTotal= await Orders.aggregate([
      {$match:{orderStatus:{$in:['delivered','partial-return']}}},
      {$unwind:'$items'},
      {$match:{'items.itemStatus':'delivered'}},
      {$group:{_id:'',totalAmount:{$sum:'$items.totalPrice'},orginalAmount:{$sum:'$items.priceAtPurchase'}}},
      {$project:{_id:0,totalAmount:1,orginalAmount:1}}
    ])

    const orderAmount = orderTotal[0].totalAmount;
    const discountAmount = orderTotal[0].orginalAmount-orderTotal[0].totalAmount;
    res.render('admin/sales-report.ejs',{layout:"layouts/admin-dashboard-layout",pageTitle :"Sales Report",orders,currentPage:page,totalPages:totalPages,salesCount,orderAmount,discountAmount})
  } catch (error) {
    console.log('error in getsales report',error);
  }
}

const getCustomSalesReport = async (req,res) =>{
  console.log('call received in getCuatomSales report');
  try {
    console.log('req body',req.body);
    const {filter} = req.body;
    console.log('filter',filter);
    const {start:startDate,end:endDate} = filter
    console.log(startDate);
    let start,end;

    if(filter==='daily'){
      start = new Date();
      end = new Date(start)
      end.setDate(end.getDate()+1)
    }
    if(filter==='monthly'){
      let today = new Date();
      start = new Date(today.getFullYear(), today.getMonth(), 1)
      end = new Date(start.getFullYear(), start.getMonth()+1, 1)
    }

    if(filter==='weekly'){
      start = new Date();
      start.setDate(start.getDate()-7)
      end = new Date()
      
    }

    if(filter === 'yearly'){
      let today = new Date();
      start = new Date(today.getFullYear(),0,1)
      end = new Date(start.getFullYear()+1,0,1)
    }

    if(filter === 'custom'){
      start = new Date(startDate);
      end = new Date(endDate)
    }
   


    console.log('start',start);
    console.log('end',end);
      const orders = await Orders.aggregate([
        {$match:{orderStatus:{$in:['delivered','partial-return']},createdAt:{$gte:start,$lte:end}}},
        {$unwind:'$items'},
        {$match:{'items.itemStatus':'delivered'}},
      ])
      if(orders.length==0) return res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,customMessage:'No Orders Found for selected filter range',orders:[]})
      console.log('orders',orders);
      const orderTotal = await Orders.aggregate([
      {$match:{orderStatus:{$in:['delivered','partial-return']},createdAt:{$gte:start,$lte:end}}},
      {$unwind:'$items'},
      {$match:{'items.itemStatus':'delivered'}},
      {$group:{_id:'',salesCount:{$sum:1},totalAmount:{$sum:'$items.totalPrice'},orginalAmount:{$sum:'$items.priceAtPurchase'}}},
      {$project:{_id:0,totalAmount:1,orginalAmount:1,salesCount:1}}
    ])
    console.log('order total',orderTotal);
    const salesCount = orderTotal[0].salesCount;
    const orderAmount = orderTotal[0].totalAmount;
    const discountAmount = orderTotal[0].orginalAmount-orderTotal[0].totalAmount;
    console.log('ordertotal',orderTotal);
    console.log('salesCount',salesCount,'orderAmount',orderAmount,'discountAmount',discountAmount);
    return res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,orders,salesCount,orderAmount,discountAmount})

  } catch (error) {
    console.log('error in get custom sales report',error);
  }
}

export default {
  getSalesReport,
  getCustomSalesReport
}