import Address from '../../models/addressModel.js'
import {HTTP_STATUS,RESPONSE_MESSAGES} from '../../utils/constants.js'

const getAddress = async (req,res)=>{
  try{
    const {addressId} = req.params;
    if(!req.user){
      res.status(HTTP_STATUS.UNAUTHORIZED).json({message:RESPONSE_MESSAGES.UNAUTHORIZED,customMessage:'Please re-login to continue'})
    }
    const address = await Address.findOne({_id:addressId,userId:req.user})
    return res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,address})
  }catch(err){

  }
}

const postAddress = async(req,res)=>{
  try{
    const{name,mobile,pincode,locality,streetName,houseName,city,state,landmark} = req.body;
    if(!name || !mobile || !pincode || !locality || !streetName || !houseName || !city || !state){
      return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Please fill out all required fields'})
    }
    if(!req.user){
      res.status(HTTP_STATUS.UNAUTHORIZED).json({message:RESPONSE_MESSAGES.UNAUTHORIZED,customMessage:'Please re-login to continue'})
    }
    const address = {userId:req.user,name,mobile,pincode,locality,streetName,houseName,city,state,landmark : landmark || ''}
    const newAddress=await Address.create(address);
    return res.status(HTTP_STATUS.CREATED).json({message:RESPONSE_MESSAGES.CREATED,customMessage:'Address added successfully',newAddress})
  }catch(err){
    console.log('Error in postAddress controller',err);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message:RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,customMessage:'Failed too save the address'})
  }
}

const editAddress= async (req,res)=>{
  try {
    const{name,mobile,pincode,locality,streetName,houseName,city,state,landmark} = req.body;

    const {addressId} = req.params;
      if(!req.user){
        res.status(HTTP_STATUS.UNAUTHORIZED).json({message:RESPONSE_MESSAGES.UNAUTHORIZED,customMessage:'Please re-login to continue'})
      }

      if(!name || !mobile || !pincode || !locality || !streetName || !houseName || !city || !state){
        return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Please fill out all required fields'})
      }

      const address = {name,mobile,pincode,locality,streetName,houseName,city,state,landmark : landmark || ''}   

      const updatedAddress = await Address.findByIdAndUpdate({_id:addressId},address,{new:true})

      res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,customMessage:'Address edited successfully',updatedAddress})
  } catch (error) {
    console.log('Error in postAddress controller',err);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message:RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,customMessage:'Failed too save the address'})
}
}

const deleteAddress = async (req,res)=>{
    try {
      const {addressId} = req.params;
      if(!req.user){
        res.status(HTTP_STATUS.UNAUTHORIZED).json({message:RESPONSE_MESSAGES.UNAUTHORIZED,customMessage:'Please re-login to continue'})
      }
      const deletedAddress=await Address.findByIdAndDelete({_id:addressId,userId:req.user});      
      if(deletedAddress.isDefault){
      const updatedDefaultAddress= await Address.findOneAndUpdate({userId:req.user},{$set:{isDefault:true}})
       return res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,customMessage:'Address deleted successfully',updatedDefaultAddress})
      }
      res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,customMessage:'Address deleted successfully',})
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message:RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,customMessage:'Failed to delete the address'})
    }
  
}


const setDefaultAddress = async (req,res) =>{

  try{
    const {addressId} = req.params;
      if(!req.user){
        res.status(HTTP_STATUS.UNAUTHORIZED).json({message:RESPONSE_MESSAGES.UNAUTHORIZED,customMessage:'Please re-login to continue'})
      }

      //update exisitng address
      await Address.updateMany({userId:req.user},{$set:{isDefault:false}})

      const updated = await Address.findByIdAndUpdate({_id:addressId,userId:req.user},{$set:{isDefault:true}},{new:true})

      if(!updated){
        return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Address not found'})
      }

      res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,customMessage:'Default address updated successfully',address:updated})

  }catch(err){
    console.log('Error in defaultAddress controller',err);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message:RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,customMessage:'Failed too save the address'})
  }
}



export default{
  getAddress,
  postAddress,
  editAddress,
  deleteAddress,
  setDefaultAddress,
}