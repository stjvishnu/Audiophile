import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/dbConnect.js"
import mainRouter from "./routes/index.js"
import path, {
  dirname
} from "path"
import {
  fileURLToPath
} from "url";
import expressEjsLayouts from "express-ejs-layouts";
import nocache from "nocache";
import cookieParser from "cookie-parser";
import passport from "passport";
import usermiddleware from "./middlewares/usermiddleware.js";
import createDebug from "debug";

const debug = createDebug('app');


const __filename = fileURLToPath(
  import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
dotenv.config();

connectDb()
  .then(() =>{ 
    console.log("✅ Database connected successfully");
    app.listen(PORT, () => {
      console.log(`Server starts to listen at port ${PORT}`)
    });
})
  .catch(err => debug("❌ Database connection error:", err));



const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(express.static(path.join(__dirname, '../public')))
app.use(express.static(path.join(__dirname, '../assets')))
app.use(nocache())
app.use(cookieParser())
app.use(passport.initialize());

app.use(usermiddleware.setName)
app.use(usermiddleware.setCategories)


//Views settings
app.set('view engine', "ejs") //telling the express that we are using ejs template engine
app.set('views', path.join(__dirname, "views"));
app.use(expressEjsLayouts)
app.set("layout", "layouts/user-layout")





//routes
// app.get('/demo', (req, res) => {
//   res.render('user/demo')
// });

app.use('/', mainRouter);

app.get('*', (req, res) => {
  res.send('404')
});

app.use((err, req, res, next) => {
  console.error(err.stack); // log the error
  res.status(500).send('Something broke!');
});

