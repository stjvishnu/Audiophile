import User from "../../models/userModel.js";
import Product from "../../models/productModel.js";
import Address from '../../models/addressModel.js';
import Cart from '../../models/cartModal.js'

import {HTTP_STATUS,RESPONSE_MESSAGES} from "../../utils/constants.js"


const getCheckout = async (req,res)=>{
  console.log('Call recieved inside getCheckout');
  try{

    if(!req.user){
      res.status(HTTP_STATUS.UNAUTHORIZED).json({message:RESPONSE_MESSAGES.UNAUTHORIZED,customMessage:'Please re-login to continue'})
    }

    const user = await User.findById(req.user)
    const cart = await Cart.findOne({userId:req.user}).populate('items.productId');
    const address = await Address.findOne({userId:req.user}).sort({isDefault:-1})
    const addresses = await Address.find({userId:req.user})

    const offers=[
      {
        message:'Get ₹100 off on prepaid orders',
        offerr:'Discount:100'
      }
    ]

    console.log(cart)
  
     res.render('user/checkout',{cart,address,user,offers,addresses})

  }catch(err){
    console.log('Error in getCheckout controller',err);
  }
  
}

export default {
  getCheckout
}