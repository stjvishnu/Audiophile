import jwt from "jsonwebtoken";

const getHome = async (req, res) => {
  try {
    res.redirect('/user')
    // return res.render("user/home.ejs");
  } catch (err) {
    console.log("Error Getting Home", err);
    return res.render("user/home.ejs");
  }
};

export default { getHome };
