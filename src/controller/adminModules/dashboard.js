 import Products from '../../models/productModel.js'
 import Orders from '../../models/orderModel.js'
 import Users from '../../models/userModel.js'
 import { HTTP_STATUS,RESPONSE_MESSAGES } from '../../utils/constants.js'



 async function getChartData(filter){
  try {
    console.log('filter');
    let groupStage;

    if(filter=='yearly'){
       groupStage = {
        _id:{year:{$year:'$createdAt'}},
        totalSales :{$sum:'$total'}
       }
    }
    if(filter=='monthly'){
      groupStage = {
       _id:{year:{$year:'$createdAt'},
        month:{$month:'$createdAt'}
      },
       totalSales :{$sum:'$total'}
      }
   }
   
   if(filter=='weekly'){
    groupStage = {
     _id:{year:{$year:'$createdAt'},
         week:{$week:'$createdAt'}},
     totalSales :{$sum:'$total'}
    }
 }

 if(filter=='daily'){
  groupStage = {
    _id:{date:{$dateToString:{format:'%Y-%m-%d',date:'$createdAt'}}},
    totalSales :{$sum:'$total'}
  }
 }
 
 const salesData = await Orders.aggregate([
  {$match:{orderStatus:{$in:['delivered','partial-return']}}},
  {$group:groupStage},
  { $sort: { "_id.year": 1, "_id.month": 1, "_id.week": 1, "_id.date": 1 } }
 ])

 console.log('salesdata',salesData);

 //data for chart js
 const labels = [];
 const values = [];

 salesData.forEach(item => {
  if (filter === 'yearly') {
    labels.push(item._id.year);
  }

  if (filter === 'monthly') {
    labels.push(`${item._id.month}/${item._id.year}`);
  }

  if (filter === 'weekly') {
    labels.push(`W${item._id.week} ${item._id.year}`);
  }

  if (filter === 'daily') {
    labels.push(item._id.date);
  }

  values.push(item.totalSales);
});

return { labels,values}


  } catch (error) {
    console.log('Error in get sales chart',error);
  }
 }
 
 const getAdminDasboard = async (req,res)=>{

//  console.log(await getSalesChart('monthly')); 

  // const filter = req.quey.filter || 'monthly'
  // const salesChart = await  getSalesChart(filter)
  const topSellingProducts = await Orders.aggregate([
    {$match:{orderStatus:{$in:['delivered','partial-return']}}},
    {$unwind:'$items'},
    {$match:{'items.itemStatus':'delivered'}},
    {$group:{_id:{productId:'$items.productId',variantId:'$items.variantId'},totalSold:{$sum:'$items.quantity'},revenue:{$sum:'$items.totalPrice'}}},
    {$sort:{totalSold:-1}},
    {$limit:10},
    {$lookup:{from:'products',let:{productId:'$_id.productId',variantId:'$_id.variantId'},
    pipeline:[
     {$match:{$expr:{$eq:['$_id','$$productId']}}},
     {$addFields:{variants:{$filter:{input:'$variants',as:'variant',cond:{$eq:['$$variant.sku','$$variantId']}}}}}
    ],as:'product'}},
    {$unwind:'$product'}
  ]) 


  console.log('top selling products',topSellingProducts);



  const topSellingCategories = await Orders.aggregate([
    {$match:{orderStatus:{$in:['delivered','partial-return']}}},
    {$unwind:'$items'},
    {$match:{'items.itemStatus':{$in:['delivered','partial-return']}}},
    {$group:{_id:'$items.categoryName',totalSold:{$sum:'$items.quantity'},revenue:{$sum:'$items.totalPrice'}}},
    {$project:{_id:0,category:'$_id',totalSold:1,revenue:1}}
  ])


  const topSellingBrands = await Orders.aggregate([
    {$match:{orderStatus:{$in:['delivered','partial-return']}}},
    {$unwind:'$items'},
    {$match:{'items.itemStatus':{$in:['delivered','partial-return']}}},
    {$group:{_id:'$items.brandName',totalSold:{$sum:'$items.quantity'},revenue:{$sum:'$items.totalPrice'}}},
    {$project:{_id:0,brand:'$_id',totalSold:1,revenue:1}}
  ])

  console.log('topsellingcategories',topSellingCategories);
  console.log('topSellingBrands',topSellingBrands);
  
  // console.log('topSellingproducts',topSellingProducts);

  const totalCustomers = await Users.find().countDocuments()
  const totalProducts =  await Products.find().countDocuments()
  const orders = await Orders.aggregate([
    {$match:{orderStatus:{$in:['delivered','partial-return']}}},
    {$unwind:'$items'},
    {$match:{'items.itemStatus':{$in:['delivered','partial-return']}}},
    {$group:{_id:'',orderCount:{$sum:1}}}
  ])

  const totalOrders = orders[0].orderCount;
  const totalRevenue = await Orders.aggregate([
    {$match:{orderStatus:{$in:['delivered','partial-return']}}},
    {$unwind:'$items'},
    {$match:{'items.itemStatus':{$in:['delivered','partial-return']}}},
    {$group:{_id:'',totalRevenue:{$sum:'$items.totalPrice'}}},
    {$project:{_id:0,totalRevenue:1}},
  ])
  const recentOrders = await Orders.find({$or:[{orderStatus:'delivered'},{orderStatus:'partial-return'}]}).populate('userId').sort({createdAt:-1}).limit(4)
  // console.log('recent orders',recentOrders);

  


  res.render('admin/adminDashboard.ejs',{layout:"layouts/admin-dashboard-layout",pageTitle :"Dashboard",topSellingProducts,topSellingCategories,topSellingBrands,totalCustomers,totalProducts,totalOrders,totalRevenue,recentOrders});
}

const getSalesChart = async (req,res)=>{
  try {
    console.log('inside get sales chart controller');
    console.log(req.query);
    const filter = req?.query?.filter || 'monthly'
    console.log('filter',filter);
    const {labels,values}= await getChartData(filter);
    console.log('labels',labels);
    res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,labels,values})
  } catch (error) {
    console.log('error in getSales chart',error);
  }
}

export default {
  getAdminDasboard,
  getSalesChart
}