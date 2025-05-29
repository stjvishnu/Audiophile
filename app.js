import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/dbConnect.js"
import livereload from 'livereload';
import connectLiveReload from 'connect-livereload'; 
import mainRouter from "./routes/index.js"
import path, { dirname } from "path"
import { fileURLToPath } from "url";
import expressEjsLayouts from "express-ejs-layouts";
import nocache from "nocache";
import cookieParser from "cookie-parser";
import passport from "passport";
import usermiddleware from "./middlewares/usermiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app=express();
dotenv.config();

connectDb()

// LiveReload server
const liveReloadServer = livereload.createServer();
let reloadTimeout;
liveReloadServer.watch([
  __dirname + "/views",
  __dirname + "/public",
  __dirname + "/controller",
  __dirname + "/routes",
  
   // or any other folder you want to watch
]);


// Connect LiveReload middleware
app.use(connectLiveReload());

liveReloadServer.server.once("connection", () => {
  if (reloadTimeout) clearTimeout(reloadTimeout);
  reloadTimeout = setTimeout(() => {
    liveReloadServer.refresh("/");
  }, 100); // Keep it fast but stable
});

const PORT = process.env.PORT || 4000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname,'public')))
app.use(express.static(path.join(__dirname,'assets')))
app.use(nocache())
app.use(cookieParser())
app.use(passport.initialize());
app.use(usermiddleware.setCategories)


//Views settings
app.set('view engine',"ejs")//telling the express that we are using ejs template engine
app.set('views',path.join(__dirname,"views"));
app.use(expressEjsLayouts)
app.set("layout","layouts/user-layout")




//routes
app.get('/demo',(req,res)=>{
  res.render('user/demo')
})
// app.use('/',routes);
// app.use('/admin',adminRouter);

app.use('/',mainRouter);


app.listen(PORT,()=>{
  console.log(`Server starts to listen at port ${PORT}`)
})

