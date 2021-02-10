"use strict";

const AWS = require("aws-sdk");

AWS.config.update({
  region: "local",
  endpoint: "http://localhost:8000",
});
const dbClient = new AWS.DynamoDB.DocumentClient();

module.exports.updateQuiz = async (event, context, callback) => {
  const { quizId, userId, ...bodyData } = JSON.parse(event.body);

  if (!quizId) {
    callback(null, {
      statusCode: 400,
      body: JSON.stringify({ message: "quizId is required" }),
    });
  }

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

  console.log(UpdateExpression);

  const updateQuizParams = {
    TableName: process.env.QUIZ_TABLE_NAME,
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
