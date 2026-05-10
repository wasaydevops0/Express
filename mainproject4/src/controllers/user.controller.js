import asyncHandler from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiErrors.js"
import {User} from "../models/user.model.js"
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    //getting details from user
    const { fullname, email, username, password, } = req.body;
    if (
        [fullname,email,username,password].some((field)=> field.trim() === "")
    ) {
        throw new ApiError(400, "All fields required");
    } 
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
        
    })
    if (existedUser) {
        throw new ApiError(409,"User already exists")
    }
    console.log(req)
    console.log("Files received:", req.files);
    console.log("Body received:", req.body);
    const avatarLocalPath = req.files?.avatar[0].path ;
    const coverImageLocalPath = req.files?.avatar[0].path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar image is required");
    }

    const avatar = await uploadCloudinary(avatarLocalPath)
    const coverImage = await uploadCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar is required")
    }
    const user = await User.create({
        fullname,
        email,
        username : username.toLowerCase(),
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        password,
    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken",
    )
    if (!createdUser) {
        throw new ApiError(500,"Something went wrong while creating the user")
    }
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
    //validation
    //check if already exist
    //cehck for image and avatar
    //upload on cloudinary, avatar
    //create user object - create entry in db
    // remove password and refresh token fireld from response
    // check for user creation
    // if yes return res
    // else return error

    console.log("Email: ",email);
    
})

const loginUser = asyncHandler(async (req, res) => {
    // getting data from user
    const { username, password , email} = req.body;
    //validating

    if (!username && !email) {
        throw new ApiError(400,"Username or email required");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (!user) {
        throw new ApiError(404,"User does not Exists")
    }
    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401,"Password is incorrect")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const option = {
        httpOnly: true,
        secure: true,
    }

    return res.
        status(200).
        cookie("accessToken", accessToken, options).
        cookie("refreshToken", refreshToken, options).
        json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "User Logged in successfully"
            )
        )
    // find the user
    //check password
    // generate access and refresh tokens
    //send to user

})

const logoutUser = asyncHandler(async (req,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
               refreshToken:undefined,
           }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true,
    }
    return res.
        status(200).
        clearCookie("accessToken", options).
        clearCookie("refreshToken", options).
        json(
            new ApiError(
                200,
            {},
                "User logged out"
            
           )
        )

})
export {registerUser, loginUser, logoutUser}