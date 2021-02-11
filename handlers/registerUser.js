"use strict";

const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

AWS.config.update({
  region: "local",
  endpoint: "http://localhost:8000",
});
const dbClient = new AWS.DynamoDB.DocumentClient();

module.exports.registerUser = async (event, context, callback) => {
  // const config = AWS.config;

  const data = JSON.parse(event.body);

  if (!data.email) {
    callback(null, {
      statusCode: 400,
      body: JSON.stringify({ message: "email is required" }),
    });
  }

  if (!data.password) {
    callback(null, {
      statusCode: 400,
      body: JSON.stringify({ message: "password is required" }),
    });
  }

  const params = {
    TableName: process.env.USERS_TABLE_NAME,
    Item: {
      id: uuidv4(),
      email: data.email,
      password: data.password,
      secretId: uuidv4(),
    },
  };

  await dbClient
    .put(params)
    .promise()
    .catch((e) => {
      callback(null, {
        statusCode: 500,
        body: JSON.stringify({ message: `DB: ${e.message}` }),
      });
    });

  const response = {
    statusCode: 200,
    body: JSON.stringify(data),
  };

  return callback(null, response);
};
