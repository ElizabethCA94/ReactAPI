"use strict";

const AWS = require("aws-sdk");

AWS.config.update({
  region: "local",
  endpoint: "http://localhost:8000",
});
const dbClient = new AWS.DynamoDB.DocumentClient();

module.exports.deleteQuiz = async (event, context, callback) => {
  const { quizId } = JSON.parse(event.body);

  if (!quizId) {
    callback(null, {
      statusCode: 400,
      body: JSON.stringify({ message: "quizId is required" }),
    });
  }

  const deleteQuizParams = {
    TableName: process.env.QUIZ_TABLE_NAME,
    Key: { id: quizId },
  };

  await dbClient
    .delete(deleteQuizParams)
    .promise()
    .catch((e) => {
      callback(null, {
        statusCode: 500,
        body: JSON.stringify({ message: `DB: ${e.message}` }),
      });
    });

  const response = {
    statusCode: 201,
    body: JSON.stringify({
      message: `quiz ${quizId} deleted`,
    }),
  };

  return callback(null, response);
};
