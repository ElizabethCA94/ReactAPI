"use strict";

const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

AWS.config.update({
  region: "local",
  endpoint: "http://localhost:8000",
});
const dbClient = new AWS.DynamoDB.DocumentClient();

module.exports.loginUser = async (event, context, callback) => {
  const { email, password } = JSON.parse(event.body);

  if (!email) {
    callback(null, {
      statusCode: 400,
      body: JSON.stringify({ message: "email is required" }),
    });
  }

  if (!password) {
    callback(null, {
      statusCode: 400,
      body: JSON.stringify({ message: "password is required" }),
    });
  }

  const findUserResponse = await dbClient
    .query({
      TableName: process.env.USERS_TABLE_NAME,
      Limit: 1,
      IndexName: "users-password-email",
      ExpressionAttributeNames: {
        "#email": "email",
        "#password": "password",
      },
      ExpressionAttributeValues: {
        ":email": email,
        ":password": password,
      },
      KeyConditionExpression: "#email = :email AND #password = :password",
    })
    .promise();

  if (!findUserResponse.Items.length) {
    callback(null, {
      statusCode: 401,
      body: JSON.stringify({ message: "unauthorized" }),
    });
  }

  const userDocument = findUserResponse.Items[0];

  let UpdateExpression = "set ";
  const ExpressionAttributeNames = {};
  const ExpressionAttributeValues = {};

  for (const [key, value] of Object.entries({
    secretId: uuidv4(),
  })) {
    const keyName = `#${key}`;
    const keyValue = `:${key}`;
    UpdateExpression += `${keyName}=${keyValue},`;
    ExpressionAttributeNames[`${keyName}`] = key;
    ExpressionAttributeValues[`${keyValue}`] = value;
  }
  UpdateExpression = UpdateExpression.slice(0, -1);

  const updateUserParams = {
    TableName: process.env.USERS_TABLE_NAME,
    Key: { id: userDocument.id },
    UpdateExpression,
    ExpressionAttributeNames,
    ExpressionAttributeValues,
    ReturnValues: "ALL_NEW",
  };

  const result = await dbClient
    .update(updateUserParams)
    .promise()
    .catch((e) => {
      callback(null, {
        statusCode: 500,
        body: JSON.stringify({ message: `DB: ${e.message}` }),
      });
    });

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      id: result.Attributes.id,
      email: result.Attributes.email,
      secretId: result.Attributes.secretId,
    }),
  };

  return callback(null, response);
};
