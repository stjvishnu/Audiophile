import Order from '../../models/orderModel.js'
import Product from '../../models/productModel.js'
import Wallet from '../../models/walletModel.js'
import WalletTransaction from '../../models/walletTransaction.js'
import {HTTP_STATUS,RESPONSE_MESSAGES} from "../../utils/constants.js"
import PDFDocument from 'pdfkit'
import fs from 'fs'


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

    //refund money if paid via razorpay
    if(cancelOrder.payment.method==='razorpay' || cancelOrder.payment.method==='wallet'){
      creditWallet(cancelOrder.userId,cancelOrder.total,cancelOrder.orderStatus,cancelOrder.orderNumber)
    }
    
    const productInfo=[];

    cancelOrder.items.forEach((order)=>{
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
    
    console.log('Stock updated',stockUpdated);
    

    
    console.log('Cancelled order',cancelOrder);
    res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,customMessage:'Your order has been cancelled successfully !'})
  }catch(error){
    console.log('Error in cancel order controller',error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message:RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,customMessage:'Request Failed, try again later !'})
  }
}

const returnOrder = async (req,res) =>{
  console.log('Call recived in returnOrder controller');
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

    creditWallet(req.user,returnOrder.total,returnOrder.orderStatus,returnOrder.orderNumber)

    console.log('Stock Updated',stockUpdated);

   
    console.log('Returned order',returnOrder);
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

    // ================= HEADERS =================
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${order.orderNumber}-invoice.pdf`
    );
    
    doc.pipe(res);
    
    // ================= WATERMARK =================
    doc.opacity(0.08);
    
    const logoPath = '/Users/vishnu/Desktop/Audiophile-Main/public/images/Black-logo.png';
    const imageWidth = 320;
    const wmX = (doc.page.width - imageWidth) / 2;
    const wmY = (doc.page.height - imageWidth) / 2;
    
    doc.image(logoPath, wmX, wmY, { width: imageWidth });
    doc.opacity(1);
    
    // ================= HEADER =================
    doc.fontSize(20).text('Invoice', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(12);
    doc.text(`Order ID: #${order.orderNumber}`);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
    doc.moveDown();
    
    // ================= SHIPPING =================
    doc.text('Ship To:');
    doc.font('Helvetica-Bold').text(order.shippingAddress.fullName);
    doc.font('Helvetica').text(order.shippingAddress.mobile);
    doc.text(`${order.shippingAddress.houseName}, ${order.shippingAddress.streetName}`);
    doc.text(`${order.shippingAddress.locality}, ${order.shippingAddress.city}`);
    doc.text(`${order.shippingAddress.state} - ${order.shippingAddress.pincode}`);
    doc.text(order.userId.email);
    
    doc.moveDown();
    generateHr(doc, doc.y);
    doc.moveDown();
    
    // ================= TABLE HEADER =================
    const tableTop = doc.y;
    
    const itemX = 50;
    const qtyX = 260;
    const priceX = 320;
    const discountX = 390;
    const totalX = 460;
    
    doc.font('Helvetica-Bold');
    doc.text('Item', itemX, tableTop);
    doc.text('Qty', qtyX, tableTop);
    doc.text('Price', priceX, tableTop);
    doc.text('Discount', discountX, tableTop);
    doc.text('Total', totalX, tableTop);
    
    doc.moveDown();
    generateHr(doc, doc.y);
    
    // ================= TABLE ROWS =================
    let position = doc.y + 10;
    doc.font('Helvetica');
    
    order.items.forEach(item => {
      const itemDiscount =
        (item.priceAtPurchase * item.quantity) - item.totalPrice;
    
      doc.text(item.productName, itemX, position, { width: 180 });
      doc.text(item.quantity, qtyX, position);
      doc.text(`₹${item.priceAtPurchase}`, priceX, position);
      doc.text(`₹${itemDiscount}`, discountX, position);
      doc.text(`₹${item.totalPrice}`, totalX, position);
    
      position += 20;
    });
    
    // ================= TOTALS =================
    generateHr(doc, position + 10);
    
    const labelX = 360;
    const valueX = 520;
    
    const subTotalPos = position + 25;
    const discountPos = position + 45;
    const hrPos = position + 65;
    const totalPos = position + 80;
    
    doc.font('Helvetica');
    doc.text('Sub Total:', labelX, subTotalPos);
    doc.text(`₹${order.subTotal}`, valueX, subTotalPos, { align: 'right' });
    
    doc.text('Total Discount:', labelX, discountPos);
    doc.text(`-₹${order.totalDiscount}`, valueX, discountPos, { align: 'right' });
    
    generateHr(doc, hrPos);
    
    doc.font('Helvetica-Bold');
    doc.text('Grand Total:', labelX, totalPos);
    doc.text(`₹${order.total}`, valueX, totalPos, { align: 'right' });
    
    // ================= FOOTER =================
    doc.moveDown(3);
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
    
    // ================= HELPER =================
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

const returnSingleItem = async (req,res)=>{
  try {
    const {itemId} = req.params;
    const {orderId,reason} = req.body;
    const order = await Order.findOne({_id:orderId,'items._id':itemId})

    if(!order) return res.status(HTTP_STATUS.NOT_FOUND).json({message:RESPONSE_MESSAGES.NOT_FOUND,customMessage:'Order not found'})

    const item = order.items.id(itemId); //mongoose method

    if(order.orderStatus!=='delivered' && order.orderStatus!=='partial-return'){
     return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'"Only delivered items can be returned'})
    }

    item.itemStatus='return-requested';
    item.itemReturnReason = reason;

    await order.save();
    res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,customMessage:'Return requested'})

  } catch (error) {
    console.log('Error in returnSingleItem controller',error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message:RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,customMessage:'Something went wrong'})
  }
}

export default{
  getOrders,
  cancelOrder,
  returnOrder,
  returnSingleItem,
  downloadInvoice,
}