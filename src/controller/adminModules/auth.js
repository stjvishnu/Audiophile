import jwt from "jsonwebtoken"
import { HTTP_STATUS,RESPONSE_MESSAGES } from '../../utils/constants.js'

const getLoadAdmin = (req, res) => {
  res.redirect('admin/login')
}
const getAdminLogin = (req, res) => {
  res.render('admin/adminLogin.ejs', {
    layout: false
  })
}

const postAdminLogin = async (req,res) => {
  const userName = req.body.username;
  const password = req.body.password;
  try {
    if (userName == process.env.ADMIN_USERNAME && password == process.env.ADMIN_PASSWORD) {
      const adminToken = jwt.sign({
        userName: process.env.ADMIN_USERNAME,
        password: process.env.ADMIN_PASSWORD
      }, process.env.JWT_ADMIN_KEY, {
        expiresIn: '15m'
      })
      

      res.cookie('adminToken', adminToken, {
        httpOnly: true
      })
      res.status(HTTP_STATUS.OK).render('admin/adminSplash.ejs', {
        layout: false
      })
    } else {
      res.render('admin/adminLogin.ejs', {
        layout: false
      })
    }


  } catch (err) {
    console.error(err)
  }

}

const getAdminLogout=(req,res)=>{
  try{
    const token = req.cookies.adminToken;
   res.clearCookie('adminToken',{
    httpOnly: true,
    secure: false,
  })
   res.redirect('/admin/login')
  }catch(err){
    console.log('Error in Get Admin Logout',err)
    return res.redirect('/admin/login')
  }
}

export default {
  getLoadAdmin,
  getAdminLogin,
  postAdminLogin,
  getAdminLogout
}