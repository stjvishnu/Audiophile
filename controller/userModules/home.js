import jwt from "jsonwebtoken";


const getHome = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      let name = decoded.name;
      res.locals.user = {
        name,
      };
    }else {
      res.locals.user = null; // No user
    }
    return res.render("user/home.ejs");
  } catch (err) {
    console.log("Error Getting Home", err);
    return res.render("user/home.ejs");
  }
};

export default {getHome}