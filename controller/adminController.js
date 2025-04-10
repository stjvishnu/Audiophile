const getLoadAdmin = (req,res)=>{
  res.redirect('admin/login')
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

const getAdminDasboard = (req,res)=>{
  res.render('admin/adminDashboard.ejs',{layout:false})
}


const getAdminSplash=(req,res)=>{
  res.render('admin/adminSplash.ejs',{layout:false})
}

export default{
  getLoadAdmin ,
  getAdminLogin,
  getAdminSplash,
  postAdminLogin,
  getAdminDasboard
}