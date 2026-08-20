import multer from "multer"

import os from "os";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Vercel only allows writing to the /tmp directory
    cb(null, os.tmpdir())
  },
  filename: function (req, file, cb) {
    // Add a timestamp to avoid naming conflicts if multiple users upload at the same time
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + "-" + file.originalname)
  }
})

export const upload = multer(
   
      {
        storage: storage,
        limits: {fileSize: 1000000},
      }
) 