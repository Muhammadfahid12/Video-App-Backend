import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

/*
1- Get Token from browser cookie
2- Decode it to get details
3- get user in the database
4- add the user details in the request itself and move next() 
*/



export const verfiyJWT = asyncHandler(async (req, _, next) => {
  try {
    // get jwt from client and verfiy with present in server and
    //in mobile cookies are not used, so we are using header method also
    const token =
      (await req.cookies?.accessToken) ||
      req.header("Authorization")?.replace("Bearer ", ""); //d we use Bearer bcz it is used as "Bearer TokenName"

    if (!token) {
      throw new ApiError(401, " Unauthorized Token ");
    }

    const decodedToken = await jwt.verify(token, process.env.ACCESS_KEY_TOKEN);

    if(!decodedToken)
    {
        throw new ApiError(500,"Decoded Token Error" )
    }

    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token");
  }
});
