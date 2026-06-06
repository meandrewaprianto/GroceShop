import express from "express";
import auth from "../middleware/auth.js";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";

const uploadRouter = express.Router();

const storage = multer.memoryStorage();

// Vercel Hobby plan: max body size is 4.5 MB. We set multer limit slightly lower
// to fail fast with a clear error before hitting Vercel's hard limit.
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4 MB
const upload = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE },
});

uploadRouter.post('/', auth, (req, res) => {
    upload.single('image')(req, res, async (multerErr: any) => {
        try {
            if (multerErr) {
                if (multerErr.code === "LIMIT_FILE_SIZE") {
                    return res.status(413).json({
                        message: `Image too large. Max size is ${MAX_FILE_SIZE / 1024 / 1024}MB. Please compress the image before uploading.`
                    });
                }
                return res.status(400).json({ message: multerErr.message || "Upload failed" });
            }

            if (!req.file) {
                return res.status(400).json({ message: "No image file provided" });
            }

            // Verify Cloudinary config exists
            if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
                console.error("Cloudinary env vars missing");
                return res.status(500).json({ message: "Image upload service is not configured on the server." });
            }

            const b64 = Buffer.from(req.file.buffer).toString("base64");
            const dataURI = "data:" + req.file.mimetype + ";base64," + b64;

            const result = await cloudinary.uploader.upload(dataURI, {
                folder: "grocery-del",
                resource_type: "auto",
            });

            res.json({ url: result.secure_url });
        } catch (error: any) {
            console.error("Cloudinary upload error:", error);
            res.status(500).json({
                message: error?.message || "Failed to upload image to Cloudinary"
            });
        }
    });
});

export default uploadRouter;
