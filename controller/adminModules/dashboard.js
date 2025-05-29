 const getAdminDasboard = (req,res)=>{
  res.render('admin/adminDashboard.ejs',{layout:"layouts/admin-dashboard-layout",pageTitle :"Dashboard"})
}

export default {getAdminDasboard}