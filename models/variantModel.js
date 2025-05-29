import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Types.ObjectId, ref: "Products", required: true },
    color: { type: String, required: true },
    connectorType: { type: String, enum: ["Type-C", "3.5mm", "Wireless"], required: true },
    stock: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true },
    discountedPrice: { type: Number, required: true },
    variantImages: { type: [String], default: [] },
    sku: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
)

const variant  = mongoose.model('Variants',variantSchema);

export default variant