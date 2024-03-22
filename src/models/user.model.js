  import mongoose, { Schema } from "mongoose";
  import { Jwt } from "jsonwebtoken";
  import {bcrypt} from "bcrypt"

  const userSchema = new Schema(
    {
      username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
      },

      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },
      fullname: {
        type: String,
        required: true,
        trim: true,
        index: true,
      },
      avatar: {
        type: String, //cloudinary url
        required: true,
      },
      coverImage: {
        type: String,
      },
      watchHistory: [
        {
          type: Schema.Types.ObjectId,
          ref: "Video",
        },
      ],
      password: {
        type: String,
        required: [true, "Password is required"],
      },
      refreshToken: {
        type: String,
      },
    },
    {
      timestamps: true,
    }
  );
  
  // password Hashing  

  userSchema.pre("save",async function (next){
      if(!this.isModified("password")) return next();
      this.password = bcrypt.hash(this.password,10)
      next()
  })

  //password validation

  //methods is used to create custom methods
  userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password, this.password)
  }

  userSchema.methods.generateRefreshTokens = function ()
  {
    jwt.sign(
      {
        
        _id : this._id,
        email : this.email,
        username: this.username,
        fullname: this.fullname
    },
    process.env.ACCESS_KEY_TOKEN,
    {
      expiresIn : process.env.ACCESS_TOKEN_EXPIRY
    }
    )
  }

  export const User = mongoose.model("User", userSchema);
