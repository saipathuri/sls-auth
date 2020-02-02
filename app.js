import express, { json } from "express";
import cors from "cors";
import uuid from "node-uuid";
import morgan from "morgan";
const AWS = require("aws-sdk");

const USERS_TABLE = process.env.USERS_TABLE;
const INDEX_NAME = process.env.INDEX_NAME;
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const server = express();

if (process.env.NODE_ENV === "development") {
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
  } catch (e) {
    return next(e);
  }

  if (result && result.Items && result.Items[0]) {
    // const {password} = result.Item;
    const item = result.Items[0];
    if (item.password === password) {
      delete item.password;
      delete item.id;
      return res.status(200).json(item);
    }
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
    const params = {
      TableName: USERS_TABLE,
      Item: {
        id: uuid.v4(),
        username: username,
        password: password,
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
