

const isLogin = (req,res,next)=>{

  try{
    const adminToken = req.cookies.adminToken; 
    if(!adminToken){
     return res.redirect('/admin/auth/login')
    }
    
    return next();
  }catch(err){
    console.log(err)
    return res.redirect('/admin/auth/login')
  }
}

export default {
  isLogin
}