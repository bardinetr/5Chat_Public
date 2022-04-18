var AWS = require("aws-sdk");

AWS.config.update({
	region: "eu-west-3",
});

class adminServices {
	constructor() {
		this.dynamodb = null;
		this.init();
	}

	init() {
		this.dynamodb = new AWS.DynamoDB();
	}

	async createTable(table_name, keyschema, attschema) {
		//keyschema should be an Array in this shape :
		/*
      [
        { AttributeName: "year", KeyType: "HASH" }, //Partition key
        { AttributeName: "title", KeyType: "RANGE" }, //Sort key
      ]

    //attschema should be an Array in this shape :
      [
            { AttributeName: "year", AttributeType: "N" },
            { AttributeName: "title", AttributeType: "S" },
          ]
      */
		var params = {
			TableName: table_name,
			KeySchema: keyschema,
			AttributeDefinitions: attschema,
			ProvisionedThroughput: {
				ReadCapacityUnits: 10,
				WriteCapacityUnits: 10,
			},
		};
		console.log("params :>> ", params);
		const queryres = await this.dynamodb.createTable(params).promise();
		return queryres;
	}

	async createAdmin(id, hash, salt, username) {
		var params = {
			TableName: process.env.DYNAMODB_ADMINS_TABLENAME,
            id: id,
			Item: { id: id, hash: hash, salt: salt, username: username},
			ReturnValues: "ALL_OLD",
		};

		console.log("[createAdmin] Adding a new item...");

		let docClient = new AWS.DynamoDB.DocumentClient();

		let response = await docClient.put(params).promise();

		return response;
	}

	async getAdmin(id) {
		var params = {
			TableName: process.env.DYNAMODB_ADMINS_TABLENAME,
			Key: {
				id: id,
			},
		};
		let docClient = new AWS.DynamoDB.DocumentClient();
		let response = await docClient.get(params).promise();

		return response;
	}
}

module.exports = adminServices;
