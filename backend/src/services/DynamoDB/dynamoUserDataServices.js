var AWS = require("aws-sdk");

AWS.config.update({
  region: "eu-west-3",
});

const twitterdata1 = require("../../hardcoded/users/user_sample_1");

const UserDB = require("../../models/userModel_DB");

const TABLE_NAME = process.env.DYNAMODB_USER_STATIC_TABLENAME;
const TABLE_GSI_OAUTH = process.env.DYNAMODB_USER_STATIC_GSI_OAUTH;

class dynamoUserDataServices {
  constructor() {
    this.dynamodb = null;
    this.init();
  }

  init() {
    this.dynamodb = new AWS.DynamoDB();
  }

  /**
   * Function returning the data stored in the userData table, creating it if not there
   * @param {Integer} id User ID, if set to null, it is retrieved through GSI call
   * @param {String} acc User account handle, needed.
   * @returns JSON
   */
  async readUser(id, acc, readorcreate) {
    let userId = id;
    if (id == null) {
      //If id attribute is null, we try to fetch it from the DB
      let id_packet = await this.getUserId(acc).catch((err) => console.log(err));
      if (id_packet.Count == 1) {
        //If we get one and one id as a result, we can use it for next operations
        userId = id_packet.Items[0].id;
        console.log("fetched id = ", id);
      } else if (id_packet.Count == 0) {
        //If we get no id from DB, then we cant fetch anything
        throw new Error(`User named ${acc} unknown to DB, ID needed to create it`);
      }
    } else {
      userId = id;
    }

    //if we are given we have both parameters, we still need to check if user name is known
    var params = {
      Key: {
        /* required */
        id: userId,
        acc: acc /* "str" | 10 | true | false | null | [1, "a"] | {a: "b"} */,
        /* '<AttributeName>': ... */
      },
      TableName: TABLE_NAME /* required */,
      AttributesToGet: [
        "general",
        "scoring",
        "filters",
        "oauth_twitter",
        /* more items */
      ],
      ConsistentRead: false,
      ReturnConsumedCapacity: "INDEXES",
    };
    let docClient = new AWS.DynamoDB.DocumentClient();
    let response = await docClient
      .get(params, function (err) {
        if (err) {
          console.log(err);
        }
        // an error occurred
        else {
          // console.log(`successful first DB query id : ${id} , username :${acc}`);
        } // successful response
      })
      .promise();

    if (readorcreate == "true" || readorcreate == undefined) {
      if (response.Item == undefined) {
        console.log(`user ${acc} isnt in database, creating ...`);
        let newUser = new UserDB({ id: userId, acc: acc });
        await this.uploadNewUser_INDEX(newUser).catch((e) => {
          console.log(e);
        });
        return newUser;
      }
    }
    return response.Item;
  }

  /**
   * Fetches the oauth_twitter field assigned to an user handle using GSI accHash
   * if user is not already in data base, it is created
   * @param {String} acc Twitter user name ex: bochat_
   * @returns
   */
  async getUserOAuthStatus(acc, id, loop) {
    // console.log("[getUserOAuthStatus] Table name : = ", TABLE_NAME);
    var params = {
      TableName: TABLE_NAME /* required */,
      IndexName: TABLE_GSI_OAUTH,
      KeyConditionExpression: "acc = :v_acc",
      ExpressionAttributeValues: {
        ":v_acc": acc,
      },
      ProjectionExpression: "oauth_twitter",
      ConsistentRead: false,
      ReturnConsumedCapacity: "INDEXES",
    };
    let docClient = new AWS.DynamoDB.DocumentClient();
    let response = await docClient
      .query(params, function (err) {
        if (err) {
          throw { status: "error", tokens: null, error: err };
        }
      })
      .promise();

    if (response !== undefined && response.Count == 1) {
      //User is in database
      if (response.Items[0].oauth_twitter.oauth_fetch_date !== null) {
        //User already has tokens set
        return { status: "user_tokens_ready", tokens: response.Items[0].oauth_twitter };
      } else {
        //Need to query user for tokens allowance (request bot tokens and then rendered twitter page)
        return { status: "user_tokens_not_ready", tokens: null };
      }
    } else if (response.Count == 0 && !loop) {
      //User not in database, creating it
      //Not creating the user again if in the looping process
      console.log("[getUserOAuthStatus] user isnt in database, creating ...");
      let newUser = new UserDB({ id: id, acc: acc });
      console.log("[getUserOAuthStatus] newUser :>> ", newUser);
      await this.uploadNewUser_INDEX(newUser).catch((e) => {
        console.log("[getUserOAuthStatus] ", e);
      });
      return { status: "user_not_created", tokens: null };
    } else {
      throw { status: "error", tokens: null };
    }
  }

  /**
   * Creates a new userModel instance in DB if not already there
   * @param {JSON} userJSON JSON used to populate user in DB, has to match the userModel
   */
  async uploadNewUser_INDEX(userJSON) {
    var params = {
      TableName: TABLE_NAME,
      Item: userJSON,
      ReturnValues: "ALL_OLD",
    };

    console.log("[uploadNewUser_INDEX] Adding a new item...");

    let docClient = new AWS.DynamoDB.DocumentClient();
    let response = await docClient
      .put(params, function (err) {
        if (err) {
          console.error(
            "[uploadNewUser_INDEX] Unable to add item. Error JSON:",
            JSON.stringify(err, null, 2),
          );
        } else {
          //console.log("[uploadNewUser_INDEX] Added item:", data);
        }
      })
      .promise();

    return response;
  }

  /**
   * Update an attribute in the database
   * @param {JSON} packet The attribute values to carry to DynamoDB
   * @param {String} userAcc The user account (used in the key)
   * @param {String} attribute The name of the attribute to update
   */
  async upload_data(packet, userAcc, attribute) {
    console.log("in upload_general_data");

    let tempAttUpdate = {};
    tempAttUpdate[attribute] = {
      Action: "PUT",
      Value:
        packet[attribute] /* "str" | 10 | true | false | null | [1, "a"] | {a: "b"} */,
    };

    var params = {
      Key: {
        /* required */
        id: packet.id /* "str" | 10 | true | false | null | [1, "a"] | {a: "b"} */,
        acc: userAcc,
      },
      TableName: TABLE_NAME /* required */,
      AttributeUpdates: tempAttUpdate,
      /* '<AttributeName>': ... */
      ReturnConsumedCapacity: "INDEXES",
      ReturnItemCollectionMetrics: "SIZE",
      ReturnValues: "UPDATED_NEW",
    };

    console.log("[upload_data] updating item acc : ", userAcc, "...");

    let error = false;

    let docClient = new AWS.DynamoDB.DocumentClient();
    await docClient
      .update(params, function (err) {
        if (err) {
          error = true;
          console.error(
            "Unable to update item. Error JSON:",
            JSON.stringify(err, null, 2),
          );
        } else {
          console.log("[upload_data] Updated item acc:", userAcc);
        }
      })
      .promise();

    if (error) {
      return false;
    } else {
      return true;
    }
  }

  /**
   * @desc retrieves user fake data from user samples
   */
  async getUser_FAKE() {
    let user = new UserDB(twitterdata1);
    return user;
  }

  async deleteUser(id, acc) {
    var params = {
      TableName: TABLE_NAME,
      Key: {
        id: id,
        acc: acc,
      },
    };
    let docClient = new AWS.DynamoDB.DocumentClient();
    console.log(`Attempting to delete user ${id} ${acc}...`);
    let deleteRes = await docClient
      .delete(params, function (err, data) {
        if (!err) {
          console.log(
            `[deleteUser] DeleteItem ${acc} succeeded:`,
            JSON.stringify(data, null, 2),
          );
          return data;
        } else {
          console.log("[deleteUser] err :>> ", err);
          return new Error(JSON.stringify(err));
        }
      })
      .promise();

    return deleteRes;
  }

  async readTesters() {
    var params = {
      TableName: process.env.DYNAMODB_TESTERS_TABLENAME,
    };
    let docClient = new AWS.DynamoDB.DocumentClient();
    let response = await docClient.scan(params, onScan).promise();

    async function onScan(err, data) {
      if (err) {
        console.error(
          "Unable to scan the table. Error JSON:",
          JSON.stringify(err, null, 2),
        );
      } else {
        // continue scanning if we have more testers, because
        // scan can retrieve a maximum of 1MB of data
        if (typeof data.LastEvaluatedKey != "undefined") {
          console.log("Scanning for more...");
          params.ExclusiveStartKey = data.LastEvaluatedKey;
          await docClient.scan(params, onScan).promise();
        }
      }
    }

    return response;
  }

  async addTester(testerid, username) {
    var params = {
      TableName: process.env.DYNAMODB_TESTERS_TABLENAME,
      id: testerid,
      Item: { id: testerid, username: username },
      ReturnValues: "ALL_OLD",
    };

    console.log("[addTester] Adding a new item...");

    let docClient = new AWS.DynamoDB.DocumentClient();

    let response = await docClient
      .put(params, function (err) {
        if (err) {
          throw err;
        }
      })
      .promise();

    return response;
  }

  async removeTester(testerid) {
    var params = {
      TableName: process.env.DYNAMODB_TESTERS_TABLENAME,
      Key: {
        id: testerid,
      },
      ReturnValues: "ALL_OLD",
    };

    console.log("[deleteUser] Removing an item...");

    let docClient = new AWS.DynamoDB.DocumentClient();

    let deleteRes = await docClient
      .delete(params, function (err, data) {
        if (!err) {
          console.log(
            `[deleteUser] DeleteItem ${testerid} succeeded:`,
            JSON.stringify(data, null, 2),
          );
          return data;
        } else {
          console.log("[deleteUser] err :>> ", err);
          return new Error(JSON.stringify(err));
        }
      })
      .promise();

    return deleteRes;
  }
}

module.exports = dynamoUserDataServices;
