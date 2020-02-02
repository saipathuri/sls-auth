import express, { json } from "express";
import cors from "cors";
import uuid from "node-uuid";
import morgan from "morgan";
import bcrypt from "bcryptjs";
import { USERS_TABLE, INDEX_NAME, isDevEnvironment } from "./config";
const AWS = require("aws-sdk");

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const server = express();

if (isDevEnvironment()) {
  server.use(morgan("combined"));
}
server.use(cors());
server.use(json());

server.get("/", (req, res) => {
  res.json({ message: "Express API Powered by AWS Lambda!" });
});

const findUser = async (username, next) => {
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

server.post("/login", async (req, res, next) => {
  const { username, password } = req.body;
  let result;

  try {
    result = await findUser(username, next);
    if (result && result.Items && result.Items[0]) {
      const item = result.Items[0];
      if (await bcrypt.compare(password, item.password)) {
        return res
          .status(200)
          .json({ username: item.username, roles: item.roles });
      }
    }
  } catch (e) {
    return next(e);
  }
  return res.sendStatus(401);
});

server.post("/register", async (req, res, next) => {
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

export default server;
