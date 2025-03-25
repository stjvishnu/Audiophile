import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/dbConnect.js"


const app=express();
dotenv.config();

connectDb()
const PORT = process.env.PORT || 4000;


app.get('/',(req,res)=>{
  res.send("Hi from Audiophile")
})

app.listen(PORT,()=>{
  console.log(`Server starts to listen at port ${PORT}`)
})

