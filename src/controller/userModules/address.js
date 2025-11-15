import Address from '../../models/addressModel.js'
import {HTTP_STATUS,RESPONSE_MESSAGES} from '../../utils/constants.js'

const getAddress = async (req,res)=>{
  console.log('Call Received At GetAddress Controller');
  
  try{
    const {addressId} = req.params;
    if(!req.user){
      res.status(HTTP_STATUS.UNAUTHORIZED).json({message:RESPONSE_MESSAGES.UNAUTHORIZED,customMessage:'Please re-login to continue'})
    }
    const address = await Address.findOne({_id:addressId,userId:req.user})
    console.log('Address from getAddress controller',address);
    return res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,address})
  }catch(err){

  }
}

const postAddress = async(req,res)=>{
  console.log('Call recieved in post address controller');

  try{
    const{name,mobile,pincode,locality,streetName,houseName,city,state,landmark} = req.body;

    console.log('REq.body  from post controller',req.body);
    if(!name || !mobile || !pincode || !locality || !streetName || !houseName || !city || !state){
      return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Please fill out all required fields'})
    }

    if(!req.user){
      res.status(HTTP_STATUS.UNAUTHORIZED).json({message:RESPONSE_MESSAGES.UNAUTHORIZED,customMessage:'Please re-login to continue'})
    }

    const address = {userId:req.user,name,mobile,pincode,locality,streetName,houseName,city,state,landmark : landmark || ''}

    console.log('address from post address',address);
 
    const newAddress=await Address.create(address);

    return res.status(HTTP_STATUS.CREATED).json({message:RESPONSE_MESSAGES.CREATED,customMessage:'Address added successfully',newAddress})


  }catch(err){
    console.log('Error in postAddress controller',err);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message:RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,customMessage:'Failed too save the address'})
  }
}

const editAddress= async (req,res)=>{
  console.log('Request recived in edit address controller');
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
  console.log('Request recieved in delete address controller');
    try {
      const {addressId} = req.params;
      if(!req.user){
        res.status(HTTP_STATUS.UNAUTHORIZED).json({message:RESPONSE_MESSAGES.UNAUTHORIZED,customMessage:'Please re-login to continue'})
      }

      const deletedAddress=await Address.findByIdAndDelete({_id:addressId,userId:req.user});
      console.log(deletedAddress.isDefault)
      
      if(deletedAddress.isDefault){
        console.log('Call inisd isdefault delete');
      const updatedDefaultAddress= await Address.findOneAndUpdate({userId:req.user},{$set:{isDefault:true}})
      console.log('updatedDeletedAddress',updatedDefaultAddress);
       return res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,customMessage:'Address deleted successfully',updatedDefaultAddress})
      }
      
      res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,customMessage:'Address deleted successfully',})
    } catch (error) {
      console.log('Error in postAddress controller',err);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message:RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,customMessage:'Failed to delete the address'})
    }
  
}


const setDefaultAddress = async (req,res) =>{
  console.log('Request recieved at setdefault address controller');

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