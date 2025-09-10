import mongoose from "mongoose";

const connectDb= async ()=>{

try{
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Successfully connected to Db");
}
catch(err){
  console.log( `Error occured while connecting to database : ${err}`)
}

}

export default connectDb;

