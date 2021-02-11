"use strict";

const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

AWS.config.update({
  region: "local",
  endpoint: "http://localhost:8000",
});
const dbClient = new AWS.DynamoDB.DocumentClient();

module.exports.logoutUser = async (event, context, callback) => {
  const { secretId } = JSON.parse(event.body);

  if (!secretId) {
    callback(null, {
      statusCode: 400,
      body: JSON.stringify({ message: "secretId is required" }),
    });
  }

  const findUserResponse = await dbClient
    .query({
      TableName: process.env.USERS_TABLE_NAME,
      Limit: 1,
      IndexName: "users-secretId",
      ExpressionAttributeNames: {
        "#secretId": "secretId",
      },
      ExpressionAttributeValues: {
        ":secretId": secretId,
      },
      KeyConditionExpression: "#secretId = :secretId",
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

  const logoutResonse = { secretId, ...result.Attributes }

  const response = {
    statusCode: 200,
    body: JSON.stringify(logoutResonse),
  };

  return callback(null, response);
};
