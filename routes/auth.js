const AWS = require("aws-sdk");
import bcrypt from "bcryptjs";
import {
  USERS_TABLE,
  INDEX_NAME,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET
} from "../config/config";
import uuid from "node-uuid";
import express from "express";
import jsonwebtoken from "jsonwebtoken";

const authRouter = express.Router();
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const findUser = async username => {
  const params = {
    TableName: USERS_TABLE,
    IndexName: INDEX_NAME,
    KeyConditionExpression: "username = :username",
    ExpressionAttributeValues: {
      ":username": username
    }
  };
  return await dynamoDb.query(params).promise();
};

function generateAccessToken(user) {
  return jsonwebtoken.sign(user, ACCESS_TOKEN_SECRET, { expiresIn: "60m" });
}

function generateRefreshToken(user) {
  return jsonwebtoken.sign(user, REFRESH_TOKEN_SECRET);
}

authRouter.post("/login", async (req, res, next) => {
  const { username, password } = req.body;
  let result;

  try {
    result = await findUser(username);
    if (result && result.Items && result.Items[0]) {
      const item = result.Items[0];
      if (await bcrypt.compare(password, item.password)) {
        const user = { username: item.username, roles: item.roles };
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        return res
          .status(200)
          .json({ accessToken: accessToken, refreshToken: refreshToken });
      }
    }
  } catch (e) {
    return next(e);
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
  try {
    let result = await findUser(username);
    if (result && result.Items && result.Items[0]) {
      // const {password} = result.Item;
      const item = result.Items[0];
      if (item.username === username) {
        return res.sendStatus(409);
      }
    }
  } catch (e) {
    return next(e);
  }

  //create user
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const params = {
      TableName: USERS_TABLE,
      Item: {
        id: uuid.v4(),
        username: username,
        password: hashedPassword,
        roles: []
      }
    };

    await dynamoDb.put(params).promise();
    return res.status(201).json("User successfully created.");
  } catch (e) {
    return next(e);
  }
});

export default authRouter;
