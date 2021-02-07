"use strict";
const AWS = require("aws-sdk");
const dbClient = new AWS.DynamoDB.DocumentClient();
AWS.config.update({
  region: "local",
  endpoint: "http://localhost:8000",
});

module.exports.registerUser = async (event, context, callback) => {
  // const config = AWS.config;

  const data = JSON.parse(event.body);

  if (!data.email) {
    callback(new Error("email is required"));
  }

  if (!data.password) {
    callback(new Error("password is required"));
  }

  const params = {
    TableName: "LearnFunctions-UsersTable-dev",
    Item: {
      email: data.email,
      password: data.password,
    },
  };

  dbClient.put(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(error);
      callback(new Error("Couldn't create the user item."));
      return;
    }

    // create a response
    const response = {
      statusCode: 200,
      body: JSON.stringify(params.Item),
    };
    callback(null, response);
  });

  const response = {
    statusCode: 200,
    body: JSON.stringify(data),
  };

  return callback(null, response);

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
