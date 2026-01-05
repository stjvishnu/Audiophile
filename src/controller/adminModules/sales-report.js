import Orders from '../../models/orderModel.js'
import { HTTP_STATUS,RESPONSE_MESSAGES } from '../../utils/constants.js'
import PDFDocument from 'pdfkit'
import XLSX from 'xlsx'


const getSalesReport = async (req,res) =>{

  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page -1) * limit;
    const totalOrders = await Orders.find().countDocuments();
    console.log('total orders',totalOrders);
    const totalPages = Math.ceil(totalOrders/limit);
    // const orders = await Orders.find().populate('userId').sort({createdAt:-1}).skip(skip).limit(limit);
    const orders = await Orders.aggregate([
      {
        $match: {
          orderStatus: { $in: ['delivered', 'partial-return'] }
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ])
    
    console.log('orders',orders);
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
    // console.log(startDate);
    let start,end;

    if(filter==='daily'){
      start = new Date();
      start.setHours(0,0,0,0)
      end = new Date();
      end.setHours(23, 59, 59, 999);
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

    console.log('hello');
      const orders = await Orders.aggregate([
        {$match:{orderStatus:{$in:['delivered','partial-return']},createdAt:{$gte:start,$lte:end}}},
        {$unwind:'$items'},
      ])
      // const orders = await Orders.aggregate([
      //   {$match:{createdAt:{$gte:start,$lte:end}}},
      //   {$unwind:'$items'},
      // ])
      console.log('orders',orders);
      if(orders.length==0) return res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,customMessage:'No Orders Found for selected filter range',orders:[]})
      
      const orderTotal = await Orders.aggregate([
      {$match:{orderStatus:{$in:['delivered','partial-return']},createdAt:{$gte:start,$lte:end}}},
      {$unwind:'$items'},
      {$group:{_id:'',salesCount:{$sum:1},totalAmount:{$sum:'$items.totalPrice'},orginalAmount:{$sum:'$items.priceAtPurchase'}}},
      {$project:{_id:0,totalAmount:1,orginalAmount:1,salesCount:1}}
    ])
    console.log('hello');
    console.log('orders',orders);
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

const downloadSalesReportPdf = async (req,res)=>{
  console.log('call inside downloadSalesReportPdf');
  console.log('req.body',req.body);
  
  try {

    let {filter} = req.body
    const {start:startDate,end:endDate} = filter
    // console.log(startDate);
    let start,end;

    if(filter==='daily'){
      start = new Date();
      start.setHours(0,0,0,0)
      end = new Date();
      end.setHours(23, 59, 59, 999);
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

    console.log('hello');
      const orders = await Orders.aggregate([
        {$match:{orderStatus:{$in:['delivered','partial-return']},createdAt:{$gte:start,$lte:end}}},
        
      ])
      // const orders = await Orders.aggregate([
      //   {$match:{createdAt:{$gte:start,$lte:end}}},
      //   {$unwind:'$items'},
      // ])
      console.log('orders',orders);
      if(orders.length==0) return res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,customMessage:'No Orders Found for selected filter range',orders:[]})
      
      const orderTotal = await Orders.aggregate([
      {$match:{orderStatus:{$in:['delivered','partial-return']},createdAt:{$gte:start,$lte:end}}},
      {$unwind:'$items'},
      {$group:{_id:'',salesCount:{$sum:1},totalAmount:{$sum:'$items.totalPrice'},orginalAmount:{$sum:'$items.priceAtPurchase'}}},
      {$project:{_id:0,totalAmount:1,orginalAmount:1,salesCount:1}}
    ])
    console.log('hello');
    console.log('orders',orders);
    console.log('order total',orderTotal);
    const salesCount = orderTotal[0].salesCount;
    const orderAmount = orderTotal[0].totalAmount;
    const discountAmount = orderTotal[0].orginalAmount-orderTotal[0].totalAmount;


    let startingDate = start.toLocaleDateString('en-IN',{
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    let endingDate = end.toLocaleDateString('en-IN',{
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    
    let generatedOn = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    const reportData = {
      startDate: startingDate,
      endDate: endingDate,
      generatedOn: generatedOn,
      filterType: filter,
      totalOrders: salesCount,
      itemsSold: salesCount,
      grossSales: orderAmount,
      totalDiscount: discountAmount,
      shipping: 0,
      netRevenue: orderAmount,
      orders: orders
    };

    const doc = new PDFDocument({ margin: 50 });
    
    // ================= HEADERS =================
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=sales-report-${reportData.startDate}-to-${reportData.endDate}.pdf`
    );
    
    doc.pipe(res);
    
    // ================= WATERMARK =================
    doc.opacity(0.08);
    
    const logoPath = 'https://res.cloudinary.com/dsvedpviz/image/upload/v1767444617/Black-logo_ndkbzi.png';
    const response = await fetch(logoPath);
    const arrayBuffer = await response.arrayBuffer();
    const logoBuffer = Buffer.from(arrayBuffer);
    const imageWidth = 320;
    const wmX = (doc.page.width - imageWidth) / 2;
    const wmY = (doc.page.height - imageWidth) / 2;
    
    doc.image(logoBuffer, wmX, wmY, { width: imageWidth });
    doc.opacity(1);
    
    // ================= HEADER =================
    doc.fontSize(24).font('Helvetica-Bold').text('SALES REPORT', { align: 'center' });
    doc.moveDown(1);
    
    doc.fontSize(11).font('Helvetica');
    doc.text(`Report Period: ${reportData.startDate} – ${reportData.endDate}`, { align: 'center' });
    doc.text(`Generated On: ${reportData.generatedOn}`, { align: 'center' });
    doc.text(`Filter: ${reportData.filterType}`, { align: 'center' });
    doc.moveDown(2);
    
    generateHr(doc, doc.y);
    doc.moveDown(1);
    
    // ================= SUMMARY STATISTICS =================
    doc.fontSize(14).font('Helvetica-Bold').text('Summary', 50, doc.y);
    doc.moveDown(1);
    
    const summaryTop = doc.y;
    const col1X = 70;
    const col2X = 220;
    const col3X = 370;
    const boxWidth = 130;
    const boxHeight = 60;
    
    // First Row - Orders, Items Sold, Gross Sales
    doc.fontSize(10).font('Helvetica');
    
    // Orders Box
    doc.rect(col1X, summaryTop, boxWidth, boxHeight).stroke();
    doc.text('Orders (Delivered)', col1X + 10, summaryTop + 10, { width: boxWidth - 20 });
    doc.fontSize(16).font('Helvetica-Bold').text(reportData.totalOrders.toString(), col1X + 10, summaryTop + 30, { width: boxWidth - 20, align: 'center' });
    
    // Items Sold Box
    doc.fontSize(10).font('Helvetica');
    doc.rect(col2X, summaryTop, boxWidth, boxHeight).stroke();
    doc.text('Items Sold', col2X + 10, summaryTop + 10, { width: boxWidth - 20 });
    doc.fontSize(16).font('Helvetica-Bold').text(reportData.itemsSold.toString(), col2X + 10, summaryTop + 30, { width: boxWidth - 20, align: 'center' });
    
    // Gross Sales Box
    doc.fontSize(10).font('Helvetica');
    doc.rect(col3X, summaryTop, boxWidth, boxHeight).stroke();
    doc.text('Gross Sales', col3X + 10, summaryTop + 10, { width: boxWidth - 20 });
    doc.fontSize(16).font('Helvetica-Bold').text(`₹${reportData.grossSales.toLocaleString('en-IN')}`, col3X + 10, summaryTop + 30, { width: boxWidth - 20, align: 'center' });
    
    // Second Row - Discount, Shipping, Net Revenue
    const row2Top = summaryTop + boxHeight + 15;
    
    // Discount Box
    doc.fontSize(10).font('Helvetica');
    doc.rect(col1X, row2Top, boxWidth, boxHeight).stroke();
    doc.text('Discount', col1X + 10, row2Top + 10, { width: boxWidth - 20 });
    doc.fontSize(16).font('Helvetica-Bold').text(`₹${reportData.totalDiscount.toLocaleString('en-IN')}`, col1X + 10, row2Top + 30, { width: boxWidth - 20, align: 'center' });
    
    // Shipping Box
    doc.fontSize(10).font('Helvetica');
    doc.rect(col2X, row2Top, boxWidth, boxHeight).stroke();
    doc.text('Shipping', col2X + 10, row2Top + 10, { width: boxWidth - 20 });
    doc.fontSize(16).font('Helvetica-Bold').text(`₹${reportData.shipping.toLocaleString('en-IN')}`, col2X + 10, row2Top + 30, { width: boxWidth - 20, align: 'center' });
    
    // Net Revenue Box
    doc.fontSize(10).font('Helvetica');
    doc.rect(col3X, row2Top, boxWidth, boxHeight).stroke();
    doc.text('Net Revenue', col3X + 10, row2Top + 10, { width: boxWidth - 20 });
    doc.fontSize(16).font('Helvetica-Bold').text(`₹${reportData.netRevenue.toLocaleString('en-IN')}`, col3X + 10, row2Top + 30, { width: boxWidth - 20, align: 'center' });
    
    doc.y = row2Top + boxHeight + 20;
    doc.moveDown(1);
    
    generateHr(doc, doc.y);
    doc.moveDown(1);
    
    // ================= DELIVERED ORDERS LIST =================
    doc.fontSize(14).font('Helvetica-Bold').text('Delivered Orders', 50, doc.y);
    doc.moveDown(1);
    
    // Table Headers
    const tableTop = doc.y;
    const orderNoX = 50;
    const userNameX = 120;
    const itemsX = 220;
    const subtotalX = 350;
    const discountX = 420;
    const totalX = 490;
    
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Order #', orderNoX, tableTop);
    doc.text('User', userNameX, tableTop);
    doc.text('Items', itemsX, tableTop);
    doc.text('Subtotal', subtotalX, tableTop, { width: 60, align: 'right' });
    doc.text('Discount', discountX, tableTop, { width: 60, align: 'right' });
    doc.text('Total', totalX, tableTop, { width: 60, align: 'right' });
    
    doc.moveDown(0.5);
    generateHr(doc, doc.y);
    doc.moveDown(0.5);
    
    // Table Rows
    let position = doc.y;
    doc.font('Helvetica').fontSize(9);
    
    reportData.orders.forEach((order, index) => {
      // Check if we need a new page
      if (position > 700) {
        doc.addPage();
        position = 50;
      }
      
      // Order Number
      doc.text(order.orderNumber, orderNoX, position, { width: 60 });
      
      // User Name
      doc.text(order.userName, userNameX, position, { width: 90 });
      
      // Items List (abbreviated if too long)
      const itemsList = order.items.map(item => `${item.name} (${item.quantity})`).join(', ');
      const truncatedItems = itemsList.length > 50 ? itemsList.substring(0, 50) + '...' : itemsList;
      doc.text(truncatedItems, itemsX, position, { width: 120 });
      
      // Subtotal
      doc.text(`₹${order.subtotal}`, subtotalX, position, { width: 60, align: 'right' });
      
      // Discount
      doc.text(`₹${order.discount}`, discountX, position, { width: 60, align: 'right' });
      
      // Total
      doc.text(`₹${order.total}`, totalX, position, { width: 60, align: 'right' });
      
      position += 25;
      
      // Add subtle line between orders
      if (index < reportData.orders.length - 1) {
        doc.strokeColor("#eeeeee").lineWidth(0.5).moveTo(50, position - 5).lineTo(550, position - 5).stroke();
        doc.strokeColor("#aaaaaa");
      }
    });
    
    // ================= FOOTER =================
    doc.moveDown(2);
    generateHr(doc, doc.y);
    doc.moveDown(0.5);
    
    doc.fontSize(10).font('Helvetica');
    doc.text(
      "Audiophile Since 2015, All rights reserved",
      50,
      doc.y,
      {
        width: doc.page.width - 100,
        align: "center"
      }
    );
    
    doc.end();
    
  

// ================= HELPER FUNCTION =================
function generateHr(doc, y) {
  doc.strokeColor("#aaaaaa")
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(550, y)
    .stroke();
}
console.log('Hi sales report pdf');
  } catch (error) {
    console.log('error in donwload sales report pdf',error);
  }
}

const downloadSalesReportXlsx = async(req,res)=>{

  console.log('call inside excel download');

  try {

    let {filter} = req.body
    const {start:startDate,end:endDate} = filter
    // console.log(startDate);
    let start,end;

    if(filter==='daily'){
      start = new Date();
      start.setHours(0,0,0,0)
      end = new Date();
      end.setHours(23, 59, 59, 999);
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

    console.log('hello');
      const orders = await Orders.aggregate([
        {$match:{orderStatus:{$in:['delivered','partial-return']},createdAt:{$gte:start,$lte:end}}},
        
      ])
      // const orders = await Orders.aggregate([
      //   {$match:{createdAt:{$gte:start,$lte:end}}},
      //   {$unwind:'$items'},
      // ])
      console.log('orders',orders);
      if(orders.length==0) return res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,customMessage:'No Orders Found for selected filter range',orders:[]})
      
      const orderTotal = await Orders.aggregate([
      {$match:{orderStatus:{$in:['delivered','partial-return']},createdAt:{$gte:start,$lte:end}}},
      {$unwind:'$items'},
      {$group:{_id:'',salesCount:{$sum:1},totalAmount:{$sum:'$items.totalPrice'},orginalAmount:{$sum:'$items.priceAtPurchase'}}},
      {$project:{_id:0,totalAmount:1,orginalAmount:1,salesCount:1}}
    ])
    console.log('hello');
    console.log('orders',orders);
    console.log('order total',orderTotal);
    const salesCount = orderTotal[0].salesCount;
    const orderAmount = orderTotal[0].totalAmount;
    const discountAmount = orderTotal[0].orginalAmount-orderTotal[0].totalAmount;


    let startingDate = start.toLocaleDateString('en-IN',{
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    let endingDate = end.toLocaleDateString('en-IN',{
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    
    let generatedOn = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    const reportData = {
      startDate: startingDate,
      endDate: endingDate,
      generatedOn: generatedOn,
      filterType: filter,
      totalOrders: salesCount,
      itemsSold: salesCount,
      grossSales: orderAmount,
      totalDiscount: discountAmount,
      shipping: 0,
      netRevenue: orderAmount,
      orders: orders
    };
    
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    const summaryData = [
      ['SALES REPORT'],
      [],
      ['Report Period:', `${reportData.startDate} – ${reportData.endDate}`],
      ['Generated On:', reportData.generatedOn],
      ['Filter:', reportData.filterType],
      [],
      ['SUMMARY STATISTICS'],
      [],
      ['Metric', 'Value'],
      ['Orders (Delivered)', reportData.totalOrders],
      ['Items Sold', reportData.itemsSold],
      ['Gross Sales', `₹${reportData.grossSales}`],
      ['Total Discount', `₹${reportData.totalDiscount || 0}`],
      ['Coupon Discount', `₹${reportData.couponDiscount || 0}`],
      ['Delivery Charges', `₹${reportData.deliveryCharges || 0}`],
      ['Net Revenue', `₹${reportData.netRevenue}`],
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

    // Set column widths for summary sheet
    summarySheet['!cols'] = [
      { wch: 20 },
      { wch: 30 }
    ];
    
    // Add summary sheet to workbook
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    
    // ================= SHEET 2: DELIVERED ORDERS =================
    
    // Prepare orders data
    const ordersData = [
      ['Order Number', 'User Name', 'Email', 'Payment Method', 'Payment Status', 'Order Status', 'Items', 'Subtotal', 'Discount', 'Coupon Discount', 'Delivery Charge', 'Total', 'Order Date']
    ];
    
    reportData.orders.forEach(order => {
      // Create items string
      const itemsList = order.items.map(item => 
        `${item.productName} - ${item.productColor} (Qty: ${item.quantity})`
      ).join('; ');
      
      ordersData.push([
        order.orderNumber,
        order.userName,
        order.userEmail,
        order.paymentMethod,
        order.paymentStatus,
        order.orderStatus,
        itemsList,
        order.subtotal,
        order.discount,
        order.couponDiscount || 0,
        order.deliveryCharge,
        order.total,
        order.orderDate
      ]);
    });
    
    const ordersSheet = XLSX.utils.aoa_to_sheet(ordersData);
    
    // Set column widths for orders sheet
    ordersSheet['!cols'] = [
      { wch: 12 },  // Order Number
      { wch: 20 },  // User Name
      { wch: 25 },  // Email
      { wch: 15 },  // Payment Method
      { wch: 15 },  // Payment Status
      { wch: 15 },  // Order Status
      { wch: 50 },  // Items
      { wch: 12 },  // Subtotal
      { wch: 12 },  // Discount
      { wch: 15 },  // Coupon Discount
      { wch: 15 },  // Delivery Charge
      { wch: 12 },  // Total
      { wch: 18 }   // Order Date
    ];
    
    // Add orders sheet to workbook
    XLSX.utils.book_append_sheet(workbook, ordersSheet, 'Delivered Orders');
    
    // ================= SHEET 3: DETAILED ITEMS =================
    
    const itemsData = [
      ['Order Number', 'Order Date', 'Product Name', 'Brand', 'Category', 'Color', 'SKU', 'Quantity', 'Price', 'Total Price', 'Offer Applied', 'Item Status']
    ];
    
    reportData.orders.forEach(order => {
      order.items.forEach(item => {
        itemsData.push([
          order.orderNumber,
          order.orderDate,
          item.productName,
          item.brandName,
          item.categoryName,
          item.productColor,
          item.sku,
          item.quantity,
          item.priceAtPurchase,
          item.totalPrice,
          item.offerApplied ? 'Yes' : 'No',
          item.itemStatus
        ]);
      });
    });
    
    const itemsSheet = XLSX.utils.aoa_to_sheet(itemsData);
    
    // Set column widths for items sheet
    itemsSheet['!cols'] = [
      { wch: 12 },  // Order Number
      { wch: 18 },  // Order Date
      { wch: 25 },  // Product Name
      { wch: 15 },  // Brand
      { wch: 12 },  // Category
      { wch: 12 },  // Color
      { wch: 15 },  // SKU
      { wch: 10 },  // Quantity
      { wch: 12 },  // Price
      { wch: 12 },  // Total Price
      { wch: 12 },  // Offer Applied
      { wch: 15 }   // Item Status
    ];
    
    // Add items sheet to workbook
    XLSX.utils.book_append_sheet(workbook, itemsSheet, 'Item Details');
    
    // ================= SHEET 4: SHIPPING DETAILS =================
    
    const shippingData = [
      ['Order Number', 'Customer Name', 'Mobile', 'House Name', 'Street', 'Locality', 'City', 'State', 'Pincode', 'Landmark']
    ];
    
    reportData.orders.forEach(order => {
      if (order.shippingAddress) {
        shippingData.push([
          order.orderNumber,
          order.shippingAddress.fullName,
          order.shippingAddress.mobile,
          order.shippingAddress.houseName,
          order.shippingAddress.streetName,
          order.shippingAddress.locality,
          order.shippingAddress.city,
          order.shippingAddress.state,
          order.shippingAddress.pincode,
          order.shippingAddress.landmark || 'N/A'
        ]);
      }
    });
    
    const shippingSheet = XLSX.utils.aoa_to_sheet(shippingData);
    
    // Set column widths for shipping sheet
    shippingSheet['!cols'] = [
      { wch: 12 },  // Order Number
      { wch: 20 },  // Customer Name
      { wch: 15 },  // Mobile
      { wch: 15 },  // House Name
      { wch: 20 },  // Street
      { wch: 15 },  // Locality
      { wch: 20 },  // City
      { wch: 15 },  // State
      { wch: 10 },  // Pincode
      { wch: 20 }   // Landmark
    ];
    
    // Add shipping sheet to workbook
    XLSX.utils.book_append_sheet(workbook, shippingSheet, 'Shipping Details');
    
    // ================= GENERATE FILE =================
    
    // Generate buffer
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx',
      compression: true 
    });
    
    // Set headers
    const filename = `sales-report-${reportData.startDate}-to-${reportData.endDate}.xlsx`.replace(/ /g, '-');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', excelBuffer.length);
    
    // Send file
    res.send(excelBuffer);

  } catch (error) {
    console.log('error in excel download',error);
  }
}


export default {
  getSalesReport,
  getCustomSalesReport,
  downloadSalesReportPdf,
  downloadSalesReportXlsx
}