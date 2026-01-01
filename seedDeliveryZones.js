import mongoose from "mongoose";
import dotenv from "dotenv";
import DeliveryZone from "./src/models/deliveryZoneModel.js";

dotenv.config(); // ✅ THIS IS MISSING

await mongoose.connect(process.env.MONGO_URI);

await DeliveryZone.create({
  pincode: 682001,
  charge: 60
});

console.log("Delivery zone added");
process.exit();
