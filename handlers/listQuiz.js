"use strict";

const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

AWS.config.update({
  region: "local",
  endpoint: "http://localhost:8000",
});
const dbClient = new AWS.DynamoDB.DocumentClient();

module.exports.listQuiz = async (event, context, callback) => {
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
      statusCode: 400,
      body: JSON.stringify({ message: "user not has quizes" }),
    });
  }

  const userDocument = findUserResponse.Items[0];

  const findQuizResponse = await dbClient
    .query({
      TableName: process.env.QUIZ_TABLE_NAME,
      IndexName: "quiz-userId",
      ExpressionAttributeNames: {
        "#userId": "userId",
      },
      ExpressionAttributeValues: {
        ":userId": userDocument.id,
      },
      KeyConditionExpression: "#userId = :userId",
    })
    .promise();

  if (!findQuizResponse.Items.length) {
    callback(null, {
      statusCode: 400,
      body: JSON.stringify({ message: "user has not quizes" }),
    });
  }

  const quizDocuments = findQuizResponse.Items;

  const response = {
    statusCode: 200,
    body: JSON.stringify(quizDocuments),
  };

  return callback(null, response);
};
