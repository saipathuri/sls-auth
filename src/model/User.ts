export default interface User {
  id: string;
  username: string;
  password: string;
  roles: string[];
}

import {
  USERS_TABLE,
  USERS_INDEX_NAME
} from "../config/Config";
import AWS from "aws-sdk";
import uuid from "node-uuid";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const findByUsername = async (username: string): Promise<User | null> => {
  const params = {
    TableName: <string>USERS_TABLE,
    IndexName: <string>USERS_INDEX_NAME,
    KeyConditionExpression: "username = :username",
    ExpressionAttributeValues: {
      ":username": username
    }
  };
  let result;

  try {
    result = await dynamoDb.query(params).promise();
  } catch (e) {
    console.error(e);
  }

  if (result && result.Items && result.Items[0]) {
    return result.Items[0] as User
  }

  return null;
};

export const create = async (username: string, password: string) => {
  const params = {
    TableName: <string>USERS_TABLE,
    Item: {
      id: uuid.v4(),
      username: username,
      password: password,
      roles: []
    }
  };

  
  return await dynamoDb.put(params).promise();
}