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
    
const uploadCloudinary = async (fileBuffer) => {
    return new Promise((resolve, reject) => {
        if (!fileBuffer) return resolve(null);
        
        const uploadStream = cloudinary.uploader.upload_stream(
            options,
            (error, result) => {
                if (error) {
                    console.error("Cloudinary Upload Error:", error);
                    resolve(null);
                } else {
                    resolve(result);
                }
            }
        );
        
        uploadStream.end(fileBuffer);
    });
}

export { uploadCloudinary };