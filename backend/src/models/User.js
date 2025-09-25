const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            match: [EMAIL_REGEX, "유효한 이메일을 입력하세요."],
        },
        passwordHash: {
            type: String,
            required: true,
        },
        displayName: {
            type: String,
            trim: true,
            default: "",
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isLogin: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true, 
    }
);

userSchema.method.comparePassword=function(plain){
    return bcrypt.compare(plain,this.passwordHash)
}

userSchema.method.toSafeJson=function(){
    const obj =this.toObject({versionKey:false})
    delete obj.passwordHash
    return obj
}
userSchema.index({email:1},{unique:true})

module.exports = mongoose.model("User", userSchema);