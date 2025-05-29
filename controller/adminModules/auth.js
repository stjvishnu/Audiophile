const getLoadAdmin = (req,res)=>{
  res.redirect('admin/auth/login')
}
const getAdminLogin = (req,res)=>{
  res.render('admin/adminLogin.ejs',{layout:false})
}

const postAdminLogin =  (req,res)=>{

  try{
    const adminName="Admin";
    const password="Admin@123"
    const adminUserName = req.body.username;
    const adminPassword = req.body.password;
  
    if(adminUserName == adminName && adminPassword==password){
      res.render('admin/adminSplash.ejs',{layout:false})
    }
    else{
      res.render('admin/adminLogin.ejs',{layout:false})
    }
  }catch(err){
    console.error(err)
  }
  
}



export default{
  getLoadAdmin ,
  getAdminLogin,
  postAdminLogin,
}