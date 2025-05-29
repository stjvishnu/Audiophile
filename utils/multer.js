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

export default upload;