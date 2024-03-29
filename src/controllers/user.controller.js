import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {

  console.log("Request body is ", req.body);

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
    console.log(existedUser);
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

  //saving to db

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

export { registerUser };
