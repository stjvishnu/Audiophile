import Order from '../../models/orderModel.js'
import Product from '../../models/productModel.js'
import {HTTP_STATUS,RESPONSE_MESSAGES} from "../../utils/constants.js"
import PDFDocument from 'pdfkit'
import fs from 'fs'

const getOrders = async(req,res)=>{
  console.log('Call reecieved in getOrders controller');
  try{
    
    const orders = await Order.find({userId:req.user});
    console.log(orders);
    res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,orders})
  }catch(error){

  }
}

const cancelOrder =  async (req,res)=>{
  console.log('Call recived in cancelOrders controller');
  try{
    const {orderId,reason} = req.body;
    const cancelOrder = await Order.findOneAndUpdate({_id:orderId},{orderStatus:'cancelled',reason:reason},{new:true})

    if(!cancelOrder){
      res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Request Failed, try again later !'})
    }
    
    const productInfo=[];

    cancelOrder.items.forEach((order)=>{
      productInfo.push({
        productId:order.productId,
        variantId:order.variantId,
        quantity:order.quantity
      })
    })
    let proId=productInfo[0].productId;
    let varId=productInfo[0].variantId;
    
    const cancelledProduct = await Product.findOne({_id:proId,'variants.sku':varId}).lean()

    const stock = cancelledProduct.variants[0].attributes.stock;
    if(stock<5){
      cancelledProduct.variants[0].attributes.price=cancelledProduct.variants[0].attributes.price*(0.1)*15
    }else if(stock<2){
      cancelledProduct.variants[0].attributes.price=cancelledProduct.variants[0].attributes.price*(0.2)*15
    }

    console.log('Lets be answer',cancelledProduct);

    console.log(stock);
    console.log('cANCELLEDPRODUCT',cancelledProduct.variants[0].attributes);
    //while cancel a product check stock

    console.log('productInfo',productInfo);
    return

   const stockUpdated= await Promise.all(

      productInfo.map((pInfo)=>{
        return Product.updateOne({_id:pInfo.productId,'variants.sku':pInfo.variantId},{$inc:{'variants.$.attributes.stock':pInfo.quantity}})
      })

    )  
    
    console.log('Stock updated',stockUpdated);
    

    
    console.log('Cancelled order',cancelOrder);
    res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,customMessage:'Your order has been cancelled successfully !'})
  }catch(error){
    console.log('Error in cancel order controller',error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message:RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,customMessage:'Request Failed, try again later !'})
  }
}

const returnOrder = async (req,res) =>{
  console.log('Call recived in cancelOrders controller');
  try {
    const {orderId,reason} = req.body;
    const returnOrder = await Order.findOneAndUpdate({_id:orderId},{orderStatus:'returned',reason:reason},{new:true});

    if(!returnOrder){
      res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Request Failed, try again later !'})
    }

    const productInfo=[];

    returnOrder.items.forEach((order)=>{
      productInfo.push({
        productId:order.productId,
        variantId:order.variantId,
        quantity:order.quantity
      })
    })

   const stockUpdated= await Promise.all(

      productInfo.map((pInfo)=>{
        return Product.updateOne({_id:pInfo.productId,'variants.sku':pInfo.variantId},{$inc:{'variants.$.attributes.stock':pInfo.quantity}})
      })

    )  

    console.log('Stock Updated',stockUpdated);

   
    console.log('Cancelled order',returnOrder);
    res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,customMessage:'Your order has been returned successfully !'})
  } catch (error) {
    console.log('Error in cancel return controller',error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message:RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,customMessage:'Request Failed, try again later !'})
  }
}

const downloadInvoice = async (req,res)=>{
  console.log('Call recieved in downloadInvoice controller');
  try {
    const {orderId}=req.params
    console.log('orderId',orderId);
    const order = await Order.findOne({_id:orderId}).populate('userId')
    console.log('order',order);
    const doc = new PDFDocument();

    doc.on("pageAdded", () => {
      addFooter(doc);
    });
    

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${order.orderNumber}-invoice.pdf`);

    doc.pipe(res);

   //setting watermark
    doc.opacity(0.1);


  const logoPath = '/Users/vishnu/Desktop/Audiophile-Main/public/images/Black-logo.png'; 
  

  const imageWidth = 300; 
  const x = (doc.page.width - imageWidth) / 2;
  const y = (doc.page.height - imageWidth) / 2; // Assuming square logo for centering height

  doc.image(logoPath, x, y, {
      width: imageWidth,
      align: 'center',
      valign: 'center'
  });

  doc.opacity(1);

    // --- Header ---
    doc.fontSize(20).text('Invoice', {align:'center'});

      // Order & Customer Details
    doc.fontSize(12).text(`orderId: #${order.orderNumber}`);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
    doc.moveDown();

    doc.text(`Ship To:`);
    doc.font('Helvetica-Bold').text(order.shippingAddress.fullName);
    doc.font('Helvetica').text(order.shippingAddress.mobile);
    doc.text(`${order.shippingAddress.houseName}, ${order.shippingAddress.streetName}`);
    doc.text(`${order.shippingAddress.locality}, ${order.shippingAddress.city}`);
    doc.text(`${order.shippingAddress.state} - ${order.shippingAddress.pincode}`);
    doc.text(order.userId.email);
    doc.moveDown();

    // Draw a horizontal line
  generateHr(doc, doc.y);
  doc.moveDown();


  // Table Headers
  const tableTop = doc.y;
  const itemX = 50;
  const quantityX = 300;
  const priceX = 370;
  const totalX = 450;

  doc.font('Helvetica-Bold');
  doc.text('Item', itemX, tableTop);
  doc.text('Qty', quantityX, tableTop);
  doc.text('Price', priceX, tableTop);
  doc.text('Total', totalX, tableTop);

  doc.moveDown();
  generateHr(doc, doc.y);

  // Table Rows
  let position = doc.y + 10;
  let grandTotal = order.total; 

  doc.font('Helvetica');

  order.items.forEach((item)=>{
    doc.text(item.productName, itemX, position);
    doc.text(item.quantity, quantityX, position);
    doc.text(item.priceAtPurchase, priceX, position);
    doc.text(item.totalPrice, totalX, position);

    position += 20; // Move down for next row
  })

    // Footer / Totals
  generateHr(doc, position + 10);
  const totalPosition = position + 25;
  
  doc.font('Helvetica-Bold');
  doc.text('Grand Total:', priceX, totalPosition);
  doc.text(grandTotal, totalX, totalPosition);


  doc.y = totalPosition + 30;
  doc.moveDown();
  generateHr(doc, doc.y);
  


  doc.moveDown(20)
  generateHr(doc, doc.y);
  doc.moveDown(0.5);
  doc.text(
    "Audiophile Since 2015, All rights reserved",
    50,                 // left margin
    doc.y,
    { 
      width: doc.page.width - 100,  // usable width between margins
      align: "center"
    }
  );
  doc.end();

  // Helper to draw lines
function generateHr(doc, y) {
  doc.strokeColor("#aaaaaa")
     .lineWidth(1)
     .moveTo(50, y)
     .lineTo(550, y)
     .stroke();
}

  } catch (error) {
    console.log('Error in download invoice controller',error);
  }
}


export default{
  getOrders,
  cancelOrder,
  returnOrder,
  downloadInvoice,
}