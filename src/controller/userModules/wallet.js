import {HTTP_STATUS,RESPONSE_MESSAGES} from '../../utils/constants.js'
import Wallet from '../../models/walletModel.js'
import walletTransaction from '../../models/walletTransaction.js'

const getWallet = async (req,res)=>{
  console.log('Call inside getWallet controller');
  try {
    if(!req.user){
      return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Re-Login to get wallet'})
    }
    const wallet = await Wallet.findOne({userId:req.user})
    const walletTransactions=await walletTransaction.find({walletId:wallet._id}).sort({createdAt:-1})

    if(!wallet){
      const wallet=await Wallet.create({
        userId:req.user,
        balance:0
      })
      return res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,customMessage:'Wallet retrieved Successfully',wallet})

    }
    
    console.log('Wallet',wallet);
    console.log('Wallet Transaction',walletTransactions);
    return res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,customMessage:'Wallet retrieved Successfully',wallet,walletTransactions})
  } catch (error) {
    console.log('Error in getWakket controler',error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message:RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,customMessage:'Request Failed, Try again later'})
  }
}

export default {
  getWallet
}