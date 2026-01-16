import User from '../../models/userModel.js'
import { HTTP_STATUS,RESPONSE_MESSAGES } from '../../utils/constants.js';

const getUsers = async (req,res)=>{
  try{
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page-1) * limit;
    const totalDocuments = await User.countDocuments()
    const totalPages = Math.ceil(totalDocuments / limit); 
    const users = await User.find({}).sort({createdAt:-1}).skip(skip).limit(limit);
    res.status(HTTP_STATUS.OK).render('admin/userManagement.ejs',{users,layout:"layouts/admin-dashboard-layout.ejs",pageTitle :"User Management",currentPage:page,totalPages:totalPages})
  }
  catch(err){
    console.log("Error in Get Users: ",err)
  }
}

const blockUsers = async (req,res)=>{
  try{
    const userId = req.params.id;
    const {isActive} = req.body;
    const userExist = await User.findById(userId);
    if(!userExist){
      return res.status(HTTP_STATUS.NOT_FOUND).json(RESPONSE_MESSAGES.NOT_FOUND);
    }
    await User.findByIdAndUpdate(userId,{isActive});
    return res.status(HTTP_STATUS.OK).json(RESPONSE_MESSAGES.SUCCESS);
  }
  catch(err){
    console.error('Error in blocking users',err)
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR)

  }
}

const searchUsers = async (req,res)=>{
  console.log(req.query);
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page -1) * limit;
  try{
  const {searchTerm} = req.query;
  const users=await User.find({
    $or:[
      {firstName:{$regex:searchTerm,$options:'i'}},
      {email:{$regex:searchTerm,$options:'i'}},
      {mobile:{$regex : searchTerm,$options:'i'}}
    ]
  }).skip(skip).limit(limit);
  if(users.length==0){
    return res.status(HTTP_STATUS.OK).json([]);
  }
  console.log('users',users);
  res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,users})
  }
  catch(err){
    console.log("error in search users",err);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message:RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR});
  }
}

const loadUsers = async (req,res)=>{
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page-1) * limit;
    const totalDocuments = await User.countDocuments()
    const totalPages = Math.ceil(totalDocuments / limit); 
    const users = await User.find({}).sort({createdAt:-1}).skip(skip).limit(limit);
    res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,users})
  } catch (error) {
    console.log('Error in load Users',error);
  }
}

export default {
  getUsers,
  blockUsers,
  searchUsers,
  loadUsers
}