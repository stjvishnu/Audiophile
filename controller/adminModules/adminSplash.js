const getAdminSplash=(req,res)=>{
  res.render('admin/adminSplash.ejs',{layout:false})
}

export default {getAdminSplash}