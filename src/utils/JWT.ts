import {
    ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET
} from "../config/Config";

import User from "../model/User"

import jsonwebtoken from "jsonwebtoken";

export function generateAccessToken(user: User) {
    return jsonwebtoken.sign(user, <string> ACCESS_TOKEN_SECRET, { expiresIn: "60m" });
}
  
export function generateRefreshToken(user: User) {
    return jsonwebtoken.sign(user, <string> REFRESH_TOKEN_SECRET);
}