import multer from "multer"

import os from "os";

const storage = multer.memoryStorage();

export const upload = multer({
    storage: storage,
    limits: { fileSize: 4000000 }, // Keep under Vercel's 4.5MB limit
});