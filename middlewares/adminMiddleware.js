



const isLogin = (req,res,next)=>{

  const adminToken = req.cookies.adminToken;
  
  if(!adminToken){
    res.status()
  }

  try{
    const username=req.username;
    const password=req.password;
    console.log(username,password)
    return next();
  }catch(err){
    console.log(err)
    return next()
  }
}

export default {
  isLogin
}