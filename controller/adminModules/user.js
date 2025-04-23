import User from '../../models/userModel.js'

const getUsers = (req,res)=>{
  const users = User.find()
  console.log(users)
}

