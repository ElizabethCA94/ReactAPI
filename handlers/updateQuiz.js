"use strict";

const AWS = require("aws-sdk");

AWS.config.update({
  region: "local",
  endpoint: "http://localhost:8000",
});
const dbClient = new AWS.DynamoDB.DocumentClient();

module.exports.updateQuiz = async (event, context, callback) => {
  const { quizId, userSecretId, ...bodyData } = JSON.parse(event.body);

  if (!quizId) {
    callback(null, {
      statusCode: 400,
      body: JSON.stringify({ message: "quizId is required" }),
    });
  }

  if (!userSecretId) {
    callback(null, {
      statusCode: 400,
      body: JSON.stringify({ message: "userSecretId is required" }),
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
        ":secretId": userSecretId,
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

  for (const [key, value] of Object.entries(bodyData)) {
    const keyName = `#${key}`;
    const keyValue = `:${key}`;
    UpdateExpression += `${keyName}=${keyValue},`;
    ExpressionAttributeNames[`${keyName}`] = key;
    ExpressionAttributeValues[`${keyValue}`] = value;
  }
  UpdateExpression = UpdateExpression.slice(0, -1);

  const updateQuizParams = {
    TableName: process.env.QUIZ_TABLE_NAME,
    IndexName: "quiz-userId",
    Key: { id: quizId },
    UpdateExpression,
    ExpressionAttributeNames,
    ExpressionAttributeValues,
    ReturnValues: "ALL_NEW",
  };

  const result = await dbClient
    .update(updateQuizParams)
    .promise()
    .catch((e) => {
      callback(null, {
        statusCode: 500,
        body: JSON.stringify({ message: `DB: ${e.message}` }),
      });
    });

  const response = {
    statusCode: 201,
    body: JSON.stringify(result.Attributes),
  };

  return callback(null, response);
};
