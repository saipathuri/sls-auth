import AWS from "aws-sdk";
import bcrypt from "bcryptjs";
import {
  ACCESS_TOKEN_SECRET
} from "../config/Config";
import express from "express";
import jsonwebtoken from "jsonwebtoken";

import { generateAccessToken, generateRefreshToken } from '../utils/JWT';
import User, { findByUsername, create } from "../model/User";

const authRouter = express.Router();

authRouter.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await findByUsername(username);
  if (user && await bcrypt.compare(password, user.password)) {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    return res
      .status(200)
      .json({ accessToken: accessToken, refreshToken: refreshToken });
  }
  return res.sendStatus(401);
});

authRouter.post("/register", async (req, res, next) => {
  const { username, password, passwordRepeat } = req.body;

  if (password !== passwordRepeat) {
    return res.status(403).json({ error: "Passwords must match." });
  }

  // check if user name already exists
  // if exists, return 409
  if (await findByUsername(username)) {
    return res.sendStatus(409);
  }

  //create user
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  try {
    create(req.body.username, hashedPassword)
    return res.status(201).json("User successfully created.");
  } catch (e) {
    next(e);
  }

 
});

authRouter.post("/verify", (req, res) => {
  const token = req.body.token;

  if (token === null) return res.sendStatus(401);
  jsonwebtoken.verify(token, <string>ACCESS_TOKEN_SECRET, (err: any) => {
    if (err) return res.sendStatus(403);
    res.sendStatus(200);
  });
});

export default authRouter;
