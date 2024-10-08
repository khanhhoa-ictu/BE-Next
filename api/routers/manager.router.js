import express from "express";
import {
  addPost,
  getPostManager,
  deletePost,
  getListUser,
  deleteUser,
  editPost,
  editAbout,
  avatar,
  addCategory,
  editCategory,
  deleteCategory,
  imagePost
} from "../controllers/manager.controller.js";
import multer from "multer";
const storage = multer.diskStorage({
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

const router = express.Router();

router.post("/manager/addPost", addPost);
router.get("/manager/getPost", getPostManager);
router.delete("/manager/delete/:id", deletePost);
router.get("/manager/user", getListUser);
router.delete("/manager/user/:id", deleteUser);
router.put("/manager/editPost", editPost);
router.put("/manager/editAbout", editAbout);
router.put("/manager/about/avatar", upload.single("file"), avatar);
router.post("/manager/addCategory", addCategory);
router.put("/manager/editCategory", editCategory);
router.delete("/manager/category/delete/:id", deleteCategory);
router.post("/manager/post/image", upload.single("file-image"), imagePost);
export default router;