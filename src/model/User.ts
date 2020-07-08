import {
  USERS_TABLE,
  USERS_INDEX_NAME
} from "../config/Config";

import AWS from "aws-sdk";
import uuid from "uuid";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export default interface User {
  id: string;
  username: string;
  password: string;
  roles: string[];
}

export const findUserByUsername = async (username: string): Promise<User | null> => {
  const params = {
    TableName: USERS_TABLE as string,
    IndexName: USERS_INDEX_NAME as string,
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

export const createUser = async (username: string, password: string) => {
  const params = {
    TableName: USERS_TABLE as string,
    Item: {
      id: uuid.v4(),
      username,
      password,
      roles: [] as string[]
    }
  };

  return await dynamoDb.put(params).promise();
}