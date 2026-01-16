import Order from '../../models/orderModel.js'
import Product from '../../models/productModel.js'
import Wallet from '../../models/walletModel.js'
import WalletTransaction from '../../models/walletTransaction.js'
import {HTTP_STATUS,RESPONSE_MESSAGES} from "../../utils/constants.js"
import PDFDocument from 'pdfkit'

/* ===============================
   HELPER FUNCTIONS
   =============================== */


/**
 * Credits amount to user's wallet and creates transaction record
 * @param {string} userId - The user's ID
 * @param {number} amount - Amount to credit
 * @param {string} reason - Reason for credit (e.g., 'cancelled', 'returned')
 * @param {string} orderId - Related order number/ID
 */

async function creditWallet(userId,amount,reason,orderId){
  try {
    // Find user's wallet
    const wallet = await Wallet.findOne({userId})

    if(!wallet){
      throw new Error('Wallet Not Found, Login Again')
    }

    // Calculate new balance and update wallet
    const newBalance = wallet.balance+amount;
    wallet.balance=newBalance;
    await wallet.save();

    // Create wallet transaction record
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


/* ===============================
   ORDER CONTROLLERS
   =============================== */


//------------- Get Orders ------------//

/**
 * Retrieves all orders for the authenticated user
 * @route GET /user/cancel
 * @access Private
 */

const getOrders = async(req,res)=>{

  try{
    // Fetch all orders for the authenticated user
    const orders = await Order.find({userId:req.user});
    res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,orders})
  }catch(error){
    console.log('Error occured in getOrders controller',error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message:RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      customMessage:'Request Failed !'
    })
  }

}

//------------- Cancel Order ------------//

/**
 * Cancels an order, refunds payment if applicable, and restocks products
 * @route POST /user/cancel
 * @access Private
 */

const cancelOrder =  async (req,res)=>{
  
  try{
    const {orderId,reason} = req.body;

    // Check if order exists and is not already cancelled
    const orderFound = await Order.findById(orderId);
    const isAlreadyCancelled = orderFound.orderStatus;

    if(isAlreadyCancelled==='cancelled'){
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message:RESPONSE_MESSAGES.BAD_REQUEST,
        customMessage:'Order is already cancelled ! , Please refer order details section'
      })
    }

    // Update order status to cancelled
    const cancelOrder = await Order.findOneAndUpdate({_id:orderId},{orderStatus:'cancelled',reason:reason},{new:true})


    if(!cancelOrder){
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message:RESPONSE_MESSAGES.BAD_REQUEST,
        customMessage:'Request Failed, try again later !'
      })
    }
 
    
    // Process refund if payment was made via razorpay or wallet
    if(cancelOrder.payment.method==='razorpay' || cancelOrder.payment.method==='wallet'){
      if(cancelOrder.payment.status==='paid'){
          creditWallet(cancelOrder.userId,cancelOrder.total,cancelOrder.orderStatus,cancelOrder.orderNumber)
      }
    }
    
    // Extract product information for stock update
    const productInfo=[];
    cancelOrder.items.forEach((order)=>{
      productInfo.push({
        productId:order.productId,
        variantId:order.variantId,
        quantity:order.quantity
      })
    })
   
   // Update stock for all products in the order
   const stockUpdated= await Promise.all(
      productInfo.map((pInfo)=>{
        return Product.updateOne({_id:pInfo.productId,'variants.sku':pInfo.variantId},{$inc:{'variants.$.attributes.stock':pInfo.quantity}})
      })
    )  

    // Update payment status based on payment method
    if(cancelOrder.payment.method==='cod'){
      cancelOrder.payment.status='not_paid'
      await cancelOrder.save()
    }else if(cancelOrder.payment.method==='razorpay' || cancelOrder.payment.method==='wallet'){
      cancelOrder.payment.status='refunded'
      await cancelOrder.save()
    }

    res.status(HTTP_STATUS.OK).json({
      message:RESPONSE_MESSAGES.OK,
      customMessage:'Your order has been cancelled successfully !'
    })

  }catch(error){
    console.log('Error in cancel order controller',error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message:RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      customMessage:'Request Failed, try again later !'
    })
  }

}

//------------- Return Order ------------//

/**
 * Requests return for an entire order
 * @route POST /user/return
 * @access Private
 */


const returnOrder = async (req,res) =>{

  try {
    const {orderId,reason} = req.body;

    // Check if order exists and is not already returned
    const orderFound = await Order.findById(orderId);
    const isAlreadyReturned = orderFound.orderStatus==='returned';
    if(isAlreadyReturned){
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message:RESPONSE_MESSAGES.BAD_REQUEST,
        customMessage:'Order is already returned !, Please refer order details section'
      })
    }

    // Update order status to return-requested
    const returnOrder = await Order.findOneAndUpdate({_id:orderId},{orderStatus:'return-requested',reason:reason},{new:true});

    if(!returnOrder){
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        message:RESPONSE_MESSAGES.BAD_REQUEST,
        customMessage:'Request Failed, try again later !'
      })
    }

    res.status(HTTP_STATUS.OK).json({
      message:RESPONSE_MESSAGES.OK,
      customMessage:'Return - Requested !'
    })

  } catch (error) {
    console.log('Error in cancel return controller',error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message:RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      customMessage:'Request Failed, try again later !'
    })

  }
}


//------------- Return Single Item ------------//

/**
 * Requests return for a single item in an order
 * @route POST /user/return-item/:itemId
 * @access Private
 */

const returnSingleItem = async (req,res)=>{
  try {
    const {itemId} = req.params;
    const {orderId,reason} = req.body;

    // Find order containing the specific item
    const order = await Order.findOne({_id:orderId,'items._id':itemId})

    if(!order) return res.status(HTTP_STATUS.NOT_FOUND).json({
      message:RESPONSE_MESSAGES.NOT_FOUND,
      customMessage:'Order not found'
    })

    // Get the specific item using Mongoose subdocument method
    const item = order.items.id(itemId); //mongoose method

    // Check if order is in a returnable state
    if(order.orderStatus!=='delivered' && order.orderStatus!=='partial-return'){
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message:RESPONSE_MESSAGES.BAD_REQUEST,
        customMessage:'"Only delivered items can be returned'
      })
    }

    // Check if return is already requested
    const isReturnAlreadyRequested = item.itemStatus==='return-requested';
    if(isReturnAlreadyRequested){
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message:RESPONSE_MESSAGES.BAD_REQUEST,
        customMessage:'Item is already returned !'
      })
    }

    // Update item status to return-requested
    item.itemStatus='return-requested';
    item.itemReturnReason = reason;

    await order.save();

    res.status(HTTP_STATUS.OK).json({
      message:RESPONSE_MESSAGES.OK,
      customMessage:'Return requested'
    })

  } catch (error) {
    console.log('Error in returnSingleItem controller',error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message:RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      customMessage:'Something went wrong'})
  }
  
}


//------------- Download Invoice ------------//

/**
 * Generates and downloads PDF invoice for an order
 * @route GET /orders/download-invoice/:orderId
 * @access Private
 */

const downloadInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Fetch order with user details populated
    const order = await Order.findOne({ _id: orderId }).populate('userId');

    // Initialize PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // ================= SET RESPONSE HEADERS =================
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${order.orderNumber}-invoice.pdf`
    );
    
    // Pipe PDF to response
    doc.pipe(res);
    
    // ================= WATERMARK =================
    doc.opacity(0.08);
    
    const logoPath = 'https://res.cloudinary.com/dsvedpviz/image/upload/v1767444617/Black-logo_ndkbzi.png';

    const response = await fetch(logoPath);
    const arrayBuffer = await response.arrayBuffer();
    const logoBuffer = Buffer.from(arrayBuffer);

    // Calculate centered position for watermark
    const imageWidth = 320;
    const wmX = (doc.page.width - imageWidth) / 2;
    const wmY = (doc.page.height - imageWidth) / 2;
    
    doc.image(logoBuffer, wmX, wmY, { width: imageWidth });
    doc.opacity(1);
    
    // ================= INVOICE HEADER =================
    doc.fontSize(20).text('Invoice', { align: 'center' });
    doc.moveDown(2);
    
    // Order information
    doc.fontSize(12);
    doc.text(`Order ID: #${order.orderNumber}`);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
    doc.moveDown(1.5);
    
    // ================= SHIPPING ADDRESS =================
    doc.text('Ship To:');
    doc.font('Helvetica-Bold').text(order.shippingAddress.fullName);
    doc.font('Helvetica').text(order.shippingAddress.mobile);
    doc.text(`${order.shippingAddress.houseName}, ${order.shippingAddress.streetName}`);
    doc.text(`${order.shippingAddress.locality}, ${order.shippingAddress.city}`);
    doc.text(`${order.shippingAddress.state} - ${order.shippingAddress.pincode}`);
    doc.text(order.userId.email);
    
    doc.moveDown(1.5);
    generateHr(doc, doc.y);
    doc.moveDown(0.5);
    
    // ================= TABLE HEADER =================
    const tableTop = doc.y;
    
    const itemX = 50;
    const qtyX = 300;
    const priceX = 350;
    const discountX = 420;
    const totalX = 490;
    
    doc.font('Helvetica-Bold');
    doc.text('Item', itemX, tableTop);
    doc.text('Qty', qtyX, tableTop, { width: 40, align: 'center' });
    doc.text('Price', priceX, tableTop, { width: 60, align: 'right' });
    doc.text('Discount', discountX, tableTop, { width: 60, align: 'right' });
    doc.text('Total', totalX, tableTop, { width: 60, align: 'right' });
    
    doc.moveDown(0.5);
    generateHr(doc, doc.y);
    
    // ================= TABLE ROWS - ORDER ITEMS =================
    let position = doc.y + 10;
    doc.font('Helvetica');
    
    order.items.forEach(item => {
      const itemDiscount = (item.priceAtPurchase * item.quantity) - item.totalPrice;
    
      doc.text(item.productName, itemX, position, { width: 240 });
      doc.text(item.quantity.toString(), qtyX, position, { width: 40, align: 'center' });
      doc.text(`Rs.${item.priceAtPurchase}`, priceX, position, { width: 60, align: 'right' });
      doc.text(`Rs.${itemDiscount}`, discountX, position, { width: 60, align: 'right' });
      doc.text(`Rs.${item.totalPrice}`, totalX, position, { width: 60, align: 'right' });
    
      position += 30;
    });
    
    // ================= INVOICE TOTALS =================
    doc.moveDown(0.5);
    generateHr(doc, doc.y);
    
    // Define positions for total section
    const labelX = 380;
    const valueX = 490;
    
    const subTotalPos = doc.y + 15;
    const discountPos = subTotalPos + 20;
    const hrPos = discountPos + 20;
    const totalPos = hrPos + 15;
    
    // Display subtotal
    doc.font('Helvetica');
    doc.text('Sub Total:', labelX, subTotalPos);
    doc.text(`Rs.${order.subTotal}`, valueX, subTotalPos, { width: 60, align: 'right' });
    
    // Display total discount
    doc.text('Total Discount:', labelX, discountPos);
    doc.text(`-Rs.${order.totalDiscount||0}`, valueX, discountPos, { width: 60, align: 'right' });
    
    generateHr(doc, hrPos);
    
    // Display grand total
    doc.font('Helvetica-Bold');
    doc.text('Grand Total:', labelX, totalPos);
    doc.text(`Rs.${order.total}`, valueX, totalPos, { width: 60, align: 'right' });
    
    // ================= INVOICE FOOTER =================
    doc.moveDown(4);
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
    
    // Finalize PDF and end stream
    doc.end();
    
    // Helper function to draw horizontal line
    function generateHr(doc, y) {
      doc.strokeColor("#aaaaaa")
        .lineWidth(1)
        .moveTo(50, y)
        .lineTo(550, y)
        .stroke();
    }
    

  } catch (error) {
    console.log('Error in download invoice controller', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      customMessage: 'Failed to generate invoice'
    })
  }
};




/* ===============================
   EXPORTS
   =============================== */

export default{
  getOrders,
  cancelOrder,
  returnOrder,
  returnSingleItem,
  downloadInvoice,
}
