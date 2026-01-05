import Coupon from '../../models/couponModel.js'
import Cart from '../../models/cartModal.js'
import calculateCart from '../../utils/cartCalculator.js'
import {HTTP_STATUS,RESPONSE_MESSAGES} from "../../utils/constants.js"

const getCoupons = async (req,res) =>{
  console.log('call inside get coupons');
  try {
    if(!req.user) return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST})
    console.log('Call inside get coupons');
    const cart = await Cart.findOne({userId:req.user})
    const calculatedCart = await calculateCart(cart)
    const coupons = await Coupon.find({minPurchase:{$lte:calculatedCart.total},isActive:true,isDelete:false})
    console.log('coupons ssfff',coupons);
    res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,coupons})
    
  } catch (error) {
    console.log('Error in getting coupons',error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message:RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR})

  }
}



export default{
  getCoupons,

}