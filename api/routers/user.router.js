import express from "express";
import {
  register,
  login,
  refreshToken,
  profile,
  about,
  detail,
  avatar,
  requestForgotPassword,
  verifyForgotPassword,
  forgotPassword,
  profileById,
  aboutAdmin,
} from "../controllers/user.controller.js";
import multer from "multer";

const storage = multer.diskStorage({
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/refreshToken", refreshToken);
router.get("/user/profile", profile);
router.get("/user/profileById/:id", profileById);
router.put("/profile/about", about);
router.put("/profile/detail", detail);
router.put("/profile/avatar", upload.single("file"), avatar);
router.post("/forgot/request", requestForgotPassword);
router.post("/forgot/verify", verifyForgotPassword);
router.post("/forgot/password", forgotPassword);
router.get("/about", aboutAdmin);
export default router;
