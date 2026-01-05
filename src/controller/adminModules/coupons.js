import  mongoose  from 'mongoose'
import Coupon from '../../models/couponModel.js'
import { HTTP_STATUS,RESPONSE_MESSAGES } from '../../utils/constants.js'

const getCoupons  = async (req,res)=>{
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page -1) * limit;

    const totalCoupons = await Coupon.countDocuments();
    const totalPages = Math.ceil(totalCoupons/limit)
    const coupons = await Coupon.find({}).sort({createdAt:-1}).skip(skip).limit(limit);

    
    res.render('admin/coupons.ejs',{layout:"layouts/admin-dashboard-layout",pageTitle :"Coupons",coupons,pageTitle :"Coupons",currentPage:page,totalPages:totalPages})
  } catch (error) {
    console.log("Error in get coupons controller",error);
  }
}


const addCoupon = async (req,res)=>{
  console.log('Call recieved in addCoupon controler');
  try {


    console.log(req.body);
    const {code,discountType,description,discountValue,minPurchase,maxDiscount,validFrom,validTo,usageLimit,isActive} = req.body;

    if(!code||!discountType||!description||!discountValue||!minPurchase||!validFrom||!validTo||!usageLimit||!isActive){
      return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'All fields required !'})
    }

    if(code.trim().length<5){
      return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Coupon Code  should contain at least 5 characters '})
    }

    if(code.trim().length>30){
      return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Coupon Code  should contain at most 12 characters '})
    }

    if(description.trim().length<5){
      return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Description should contain at least 5 characters '})

    }

    if(description.trim().length>25){
      return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Description should contain at most 15 characters '})

    }


    if(new Date(validTo) < new Date(validFrom)){
      return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Expiry date  should start after start date'})
    }

    // if(discountType == 'fixed'){
    //   const maximumDiscount = Number(maxDiscount);
    //   const minimumPurchase = Number(minPurchase);

    //   if(maxDiscount<0){
    //     return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Maximum discount should be grater than 0'})
    //   }

    //   const maximumAllowedDiscount = minimumPurchase * 0.4;

    //   if(maximumDiscount>maximumAllowedDiscount){
    //     return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:`Flat discount cannot exceed 40% of the minimum purchase amount. Max Allowed : ${maximumAllowedDiscount}`})
    //   }
    // }

    if(Number(usageLimit)<=0){
      return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Usage limit per user should be higher than 0'})
    }

    const isCodeExists=await Coupon.findOne({code:code});
    if(isCodeExists){
      return res.status(HTTP_STATUS.CONFLICT).json({message:RESPONSE_MESSAGES.CONFLICT,customMessage:'Coupon Already exists !'})

    }

    const coupon=await Coupon.create({
      code,
      discountType,
      description,
      discountValue,
      minPurchase,
      maxDiscount,
      validFrom,
      validTo,
      usageLimit,
      isActive,
      isDelete:false,
      usedBy:null
    })

    console.log(coupon);
   

    if(!coupon){
     return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message:RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,customMessage:'Request failed, try again later'})
    }

    res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.CREATED,customMessage:'Coupon Added successfully'})

  } catch (error) {
    console.log('Error in add coupon controller',error);
  }
}

const editCoupon = async (req,res) =>{
  console.log('call recieved in edit coupon');
  console.log('req.body',req.body);
  try {
    const couponId = req.params.editId;
    const {code,discountType,description,discountValue,minPurchase,maxDiscount,validFrom,validTo,usageLimit,isActive} = req.body;


    if(!code||!discountType||!description||!discountValue||!minPurchase||!validFrom||!validTo||!usageLimit||!isActive){
      return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'All fields required !'})
    }


    if(code.trim().length<5){
      return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Coupon Code  should contain at least 5 characters '})
    }

    if(code.trim().length>30){
      return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Coupon Code  should contain at most 12 characters '})
    }

    if(description.trim().length<5){
      return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Description should contain at least 5 characters '})

    }

    if(description.trim().length>25){
      return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Description should contain at most 15 characters '})

    }


    if(new Date(validTo) < new Date(validFrom)){
      return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Expiry date  should start after start date'})
    }

    // if(discountType == 'fixed'){
    //   const maximumDiscount = Number(maxDiscount);
    //   const minimumPurchase = Number(minPurchase);

    //   if(maxDiscount<0){
    //     return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Maximum discount should be grater than 0'})
    //   }

    //   const maximumAllowedDiscount = minimumPurchase * 0.4;

    //   if(maximumDiscount>maximumAllowedDiscount){
    //     return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:`Flat discount cannot exceed 40% of the minimum purchase amount. Max Allowed : ${maximumAllowedDiscount}`})
    //   }
    // }

    if(Number(usageLimit)<=0){
      return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Usage limit per user should be higher than 0'})
    }


    const coupon = {
      code,
      discountType,
      description,
      discountValue,
      minPurchase,
      maxDiscount,
      validFrom,
      validTo,
      usageLimit,
      isActive,
    }

    console.log('testing coupon',coupon);

    const updatedCoupon = await Coupon.findOneAndUpdate({_id:couponId},coupon,{new:true});
    console.log('updated coupon',updatedCoupon);

    res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,customMessage:'Coupon Edited Successfully',updatedCoupon})


    
  } catch (error) {
    console.log('error in edit coupon',error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message:RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,customMessage:'Request failed, try again later'})
  }
}

const blockCoupon = async (req,res)=>{
  console.log('Call inside block coupon controller');
  console.log(req.params);
  try {
    const couponId = req.params.couponId;
    const updatedCoupon = await Coupon.findOneAndUpdate({_id:couponId},{isActive:false})
    if(!updatedCoupon) return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Request Failed, try again later !',updatedCoupon})
    res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,customMessage:'Coupon blocked successfullt'})
  } catch (error) {
    console.log('Block Category',error);
    res.status(HTTP_STATUS.BAD_REQUEST).json({message:"Error in Blocking Coupon"})
  }
}


const unblockCoupon = async (req,res)=>{
  try {
    const couponId = req.params.couponId;
    const updatedCoupon = await Coupon.findOneAndUpdate({_id:couponId},{isActive:true})
    if(!updatedCoupon) return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Request Failed, try again later !'})
    res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,customMessage:'Coupon blocked successfully',updatedCoupon})
  } catch (error) {
    console.log('Block Category',error);
    res.status(HTTP_STATUS.BAD_REQUEST).json({message:"Error in unblocking coupon"})
  }
}



const deleteCoupon = async (req,res)=>{
  console.log('call inside delete coupon');
  try {
    const couponId = req.params.couponId;
    const updatedCoupon = await Coupon.findOneAndUpdate({_id:couponId},{isDelete:true})
    console.log('updated coupon',updatedCoupon);
    if(!updatedCoupon) return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Request Failed, try again later !'})
    res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,customMessage:'Coupon blocked successfully',updatedCoupon})
  } catch (error) {
    console.log('Block Category',error);
    res.status(HTTP_STATUS.BAD_REQUEST).json({message:"Error in deleting Coupon"})
  }
}

const restoreCoupon = async (req,res)=>{
  try {
    const couponId = req.params.couponId;
    const updatedCoupon = await Coupon.findOneAndUpdate({_id:couponId},{isDelete:false})
    if(!updatedCoupon) return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Request Failed, try again later !'})
    res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,customMessage:'Coupon blocked successfully',updatedCoupon})
  } catch (error) {
    console.log('Restore coupon',error);
    res.status(HTTP_STATUS.BAD_REQUEST).json({message:"Error in restoring coupon"})
  }
}

export default {
  getCoupons,
  addCoupon,
  editCoupon,
  blockCoupon,
  unblockCoupon,
  deleteCoupon,
  restoreCoupon
}