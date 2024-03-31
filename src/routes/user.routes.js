import { Router } from "express";
import { registerUser, userLogin, userLogout } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.js";
import { verfiyJWT, verfiyJwt } from "../middlewares/auth.middleware.js";
import { TokenExpiredError } from "jsonwebtoken";



const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),

  registerUser
);


router.route("/login").post(userLogin)

// secure routes
router.route("/logout").post(verfiyJWT, userLogout)

export default router;
