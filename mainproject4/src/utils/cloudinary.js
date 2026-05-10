import { v2 as cloudinary } from "cloudinary";
import fs from 'fs';
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})
const options = {
      use_filename: true,
      unique_filename: false,
    overwrite: true,
};
    
const uploadCloudinary = async (filePath) => {
    try {
        if (!filePath) return null
        const response = await cloudinary.uploader.upload(filePath, options)
      
        return response
        
    } catch (error) {
        fs.unlinkSync(filePath)       
    }
}

export { uploadCloudinary };