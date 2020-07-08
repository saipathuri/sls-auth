import {
    ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET
} from "../config/Config";

import User from "../model/User"

import jsonwebtoken from "jsonwebtoken";

export function generateAccessToken(user: User) {
    return jsonwebtoken.sign(user, ACCESS_TOKEN_SECRET as string, { expiresIn: "60m" });
}

export function generateRefreshToken(user: User) {
    return jsonwebtoken.sign(user, REFRESH_TOKEN_SECRET as string);
}