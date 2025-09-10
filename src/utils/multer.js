import multer  from "multer";
import {CloudinaryStorage} from 'multer-storage-cloudinary';//multer-storage-cloudinary is a specialized package — it acts as a custom storage engine for multer, specifically designed to work with Cloudinary.

import cloudinary  from "./cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder : 'audiophile-products',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 500, height: 500,}],
  },
})

const upload = multer({storage});
//multer instance with cloudinary storage as its storage engine
//storage option tells Multer to use CloudinaryStorage instead of its default diskStorage or memoryStorage
//upload instance is now a middleware that can be used in routes to handle file uploads
export default upload;