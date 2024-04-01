import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

// After creating Access and Refresh Token, We'll save Refresh token into database so we don't need to login after again once our Access Token is expired

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessTokens();
    const refreshToken = user.generateRefreshTokens();

    // console.group("Access token is ", accessToken);
    // console.group("refresh token is ", refreshToken);
    // as we know that user is our object which contains all details about user

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // console.log("Request body is ", req.body);

  const { username, fullname, email, password } = req.body;

  if (
    [username, fullname, email, password].some((field) => {
      field?.trim() === "";
    })
  ) {
    throw new ApiError(400, "All fields are required");
  }

  //check the user already registered

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    // console.log(existedUser);
    throw new ApiError(409, "User Already Registerd");
  }

  // console.log("Request Files are ", req.files)
  // Getting the localPath of files so we can add on cloudinary

  const avatarLocalPath = req.files?.avatar[0]?.path;

  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  //uplaod on cloudinary

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar is not uploaded");
  }

  //creating  db

  const user = await User.create({
    fullname,
    username,
    avatar,
    coverImage: coverImage,
    email,
    password,
    username: username.toLowerCase(),
  });

  // we will unselect password and refreshToken
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "user registered successfully"));
});

/* user login 
1- check username, email and password
2- verify email/username already exit in database
3- check password
4- generate accessKey and refreshKey
5- send cookie
*/

const userLogin = asyncHandler(async (req, res) => {
  //getting data from user
  const { email, username, password } = req.body;
  console.log("request body is  ", req.body);
  console.log("email for login is ", email);

  if (!username && !email) {
    throw new ApiError(400, "username or password is required");
  }

  const user = await User.findOne({ $or: [{ email }, { username }] });

  // console.log("user: ", user);

  if (!user) {
    throw new ApiError(404, "User Does not exist");
  }

  //we have added isPasswordCorrect() method to the user schema in user.model.js
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Incorrect Password");
  }

  // checking access token
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //sending cookies

  const options = {
    httpOnly: true, // now cookie can be modified just using server only
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedUser,
          accessToken,
          refreshToken,
        },
        "user logged in successfully"
      )
    );
});

const userLogout = asyncHandler(async (req, res) => {
  //removing refreshToken from db
  //now we have req.user._id cuz we have added req.user = user in auth.middleware.js
  await User.findByIdAndUpdate(req.user._id, {
    $set: {
      refreshToken: undefined,
    },
  });

  //now clear cookies

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, " User Logged out "));
});




const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshtoken =
    req.cookies?.refreshToken || req.body.refreshToken;
try {
  
  if (!incomingRefreshtoken) {
    throw new ApiError(401, "unautherized access");
  }

  // we have token in our browser and we'll verify it from the one in server

  const decodedRefreshToken = jwt.verify(
    incomingRefreshtoken,
    process.env.REFRESH_TOKEN_SECRET
  );

  const user = await User.findById(decodedRefreshToken._id);

  if (!user) {
    throw new ApiError(401, "Invalid Refresh Token");
  }
  // verify our token is same the one present in db

  if (incomingRefreshtoken !== user?.refreshToken) {
    throw new ApiError(401, "Refresh Token is expired or used");
  }

  
  const options = {
    httpOnly: true,
    secure: true
  }
  
  const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id);

  return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", newRefreshToken, options)
  .json(
    new ApiResponse(
      200,
      {accessToken, refreshToken: newRefreshToken},
      "Access Token Refresh"
    )
  )
} catch (error) {
  throw new ApiError(401, "Error while refreshing access token")
}
});

export { registerUser, userLogin, userLogout, refreshAccessToken };
