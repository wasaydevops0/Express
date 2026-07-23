import { Router } from "express";
import {
    loginUser, 
    logoutUser,
    registerUser,
    getWatchHistory,
    changeUserAvatar,
    changeUserCoverImage,
    changeUserDetails,
    changeUserPassword,
    getCurrentUser,
    refreshAccessToken,
} from "../controllers/user.controller.js";
import  {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { uploadCloudinary } from "../utils/cloudinary.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, 
    changeUserPassword
)
router.route("/current-user").get(verifyJWT,
    getCurrentUser
)
router.route("/update-account").patch(verifyJWT,
    changeUserDetails
)
router.route("/change-avatar").patch(verifyJWT,
    upload.single("avatar"), changeUserAvatar

)

router.route("/cover-image").patch(verifyJWT,
    upload.single("coverImage"), changeUserCoverImage
)
router.route("/channel/:username").get(verifyJWT,
    getCurrentUser
)

router.route("watchHistory").get(verifyJWT,
    getWatchHistory
)
export default router