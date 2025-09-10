import jwt from "jsonwebtoken"

const getLoadAdmin = (req, res) => {
  res.redirect('admin/auth/login')
}
const getAdminLogin = (req, res) => {
  res.render('admin/adminLogin.ejs', {
    layout: false
  })
}

const postAdminLogin = (req, res) => {
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
      res.render('admin/adminSplash.ejs', {
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



export default {
  getLoadAdmin,
  getAdminLogin,
  postAdminLogin,
}