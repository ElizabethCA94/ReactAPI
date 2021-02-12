"use strict";

const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

AWS.config.update({
  region: "local",
  endpoint: "http://localhost:8000",
});
const dbClient = new AWS.DynamoDB.DocumentClient();

module.exports.createQuiz = async (event, context, callback) => {
  // const config = AWS.config;

  const {
    description,
    functionParams,
    expectedOutput,
    userSecretId,
  } = JSON.parse(event.body);

  if (!description) {
    callback(null, {
      statusCode: 400,
      body: JSON.stringify({ message: "description is required" }),
    });
  }

  if (!functionParams) {
    callback(null, {
      statusCode: 400,
      body: JSON.stringify({ message: "functionParams is required" }),
    });
  }

  if (!expectedOutput) {
    callback(null, {
      statusCode: 400,
      body: JSON.stringify({ message: "expectedOutput is required" }),
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

  const quizData = {
    id: uuidv4(),
    description,
    functionParams,
    expectedOutput,
    userId: userDocument.id,
  };

  const tableParams = {
    TableName: process.env.QUIZ_TABLE_NAME,
    Item: quizData,
  };

  await dbClient
    .put(tableParams)
    .promise()
    .catch((e) => {
      callback(null, {
        statusCode: 500,
        body: JSON.stringify({ message: `DB: ${e.message}` }),
      });
    });

  const response = {
    statusCode: 201,
    body: JSON.stringify(quizData),
  };

  return callback(null, response);
};
