import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";

export const verfiyJWT = asyncHandler(async (req, res, next) => {
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

    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    next();

  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token")
  }
});
