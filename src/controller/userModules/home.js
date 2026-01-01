import jwt from "jsonwebtoken";

const getHome = async (req, res) => {
  try {
  return   res.redirect('/user')
   
  } catch (err) {
    console.log("Error Getting Home", err);
    return res.render("user/home.ejs",{title:'home'});
  }
};

export default { getHome };
