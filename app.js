import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/dbConnect.js"
import routes from "./routes/index.js";
import adminRouter from "./routes/adminRoute.js"
import path, { dirname } from "path"
import { fileURLToPath } from "url";
import expressEjsLayouts from "express-ejs-layouts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app=express();
dotenv.config();

connectDb()
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname,'public')))

//Views settings
app.set('view engine',"ejs")//telling the express that we are using ejs template engine
app.set('views',path.join(__dirname,"views"));
app.use(expressEjsLayouts)
app.set("layout","layouts/user-layout")




//routes
app.use('/',routes);
app.use('/admin',adminRouter);

app.listen(PORT,()=>{
  console.log(`Server starts to listen at port ${PORT}`)
})

