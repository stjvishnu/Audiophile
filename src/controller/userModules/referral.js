import User from '../../models/userModel.js'
import {HTTP_STATUS,RESPONSE_MESSAGES} from "../../utils/constants.js"

const getReferral = async (req,res)=>{
  console.log('call inisde getReferral');
  try {
    const user = await User.findOne({_id:req.user})
    const referral = user.referralCode || '';
    const referralCount = user.referralCount || 0;
    const referralEarnings = parseInt(user.referralCount)*100;
    console.log(referralEarnings);
    return res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,referral,referralCount,referralEarnings})
  } catch (error) {
    console.log('Error in fetchinf the user',error);
  }
}

export default {
  getReferral
}