

const isAdminLogin = (req,res,next)=>{

  try{
    const adminToken = req.cookies.adminToken; 
    if(adminToken){
     return res.redirect('/admin/dashboard')
    }
    
    next()
  }catch(err){
    console.log(err)
    next();
  }
}

const restrictedAdminLogin = (req,res,next)=>{
  try{
    const adminToken = req.cookies.adminToken;
    if(!adminToken){
      return res.redirect('/admin/auth/login')
    }
    next();
  }catch (err){
    console.log('restricted login',err)
    next();
  }
}

export default {
  isAdminLogin,
  restrictedAdminLogin
}

