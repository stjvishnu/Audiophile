import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  _id:{type:String,required:true},
  seq:{type:Number,default:9999}
})

const counter = mongoose.model('Counter',counterSchema)

export default counter;