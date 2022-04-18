var express = require("express");
var crypto = require("crypto");
var adminFrontRouter = express.Router();

var jwt_module = require("jsonwebtoken");
var JWT_KEY = process.env.JWT_KEY;

var AdminServices = require(process.cwd() + "/src/services/admin/adminServices.js");
const AdminServicesInstance = new AdminServices();

var TwitterUserServices = require(process.cwd() +
	"/src/services/twitterAPI/twitterUserServices.js");
const TwitterUserServicesInstance = new TwitterUserServices();

adminFrontRouter.get("/", async function (req, res) {
	res.json({ message: "api / admin / front router endpoint" });
});

adminFrontRouter.post("/createtable", async function (req, res) {
	let keyschema = req.body.keyschema;
	let attschema = req.body.attschema;
	let table_name = req.body.tablename;
	let jwt = req.query.adminjwt;
	let adminId = null;

	try {
		const decoded = jwt_module.verify(jwt, JWT_KEY);
		adminId = decoded.adminId;
		if (adminId == null || adminId == undefined) {
			throw "invalid token";
		}
	} catch (err) {
		console.log("[createtable] err :>> ", err);
		return res.status(400).send({ error: err });
	}

	console.log("[createtable] adminID :>> ", adminId, "is creating a new table");

	let queryres = null;

	if (keyschema == undefined || attschema == undefined || table_name == undefined) {
		return res
			.status(400)
			.send(
				"Couldnt read body keyschema or attschema : keyschema = ",
				keyschema,
				" attschema = ",
				attschema,
			);
		// table_name = "userAdmin";

		// keyschema = [
		// 	{ AttributeName: "id", KeyType: "HASH" }, //Partition key
		// ];

		// attschema = [{ AttributeName: "id", AttributeType: "S" }];
	}
	try {
		queryres = await AdminServicesInstance.createTable(table_name, keyschema, attschema);
		return res.send(queryres);
	} catch (error) {
		return res.status(400).json({ error: String(error) });
	}
});

adminFrontRouter.post("/createadmin", async function (req, res) {
	let userpassword = req.query.password;
	let username = req.query.username;
	let securekey = req.query.securekey;
	let id = null;

	try {
		let userdata = await TwitterUserServicesInstance.getUserBasicData(username);
		id = userdata.data[0].id;
		console.log("/createadmin successfully fetched user = ", username);
	} catch (error) {
		console.log(error);
		res.json({ error: String(error) });
		return 1;
	}

	let salt = crypto.randomBytes(16).toString("hex");
	let hash = crypto
		.createHash("sha256")
		.update(userpassword + salt)
		.digest("hex");

	// console.log("id :>> ", id);
	// console.log("salt :>> ", salt);
	// console.log("hash :>> ", hash);

	if (securekey !== process.env.ADMIN_KEY) {
		res.status(400).json({ error: "ADMIN_KEY securekey isnt VALID" });
	}
	try {
		let queryres = await AdminServicesInstance.createAdmin(id, hash, salt, username);
		return res.send(queryres);
	} catch (error) {
		return res.status(400).json({ error: String(error) });
	}
});

adminFrontRouter.get("/gettoken", async function (req, res) {
	let userpassword = req.query.password;
	let username = req.query.username;
	let id = null;
	let queryres = null;

	try {
		let userdata = await TwitterUserServicesInstance.getUserBasicData(username);
		id = userdata.data[0].id;
		console.log("/gettoken successfully fetched user = ", username);
	} catch (error) {
		console.log(error);
		res.json({ error: String(error) });
		return 1;
	}

	try {
		queryres = await AdminServicesInstance.getAdmin(id);
		if (queryres.Item == undefined) {
			throw new Error("User Not In DB");
		}
		let dbhash = queryres.Item.hash;
		let dbsalt = queryres.Item.salt;
		let qrhash = crypto
			.createHash("sha256")
			.update(userpassword + dbsalt)
			.digest("hex");
		//verifying password validity
		if (qrhash === dbhash) {
			//generating token
			var token = jwt_module.sign(
				{
					adminId: id,
					iat: Math.floor(Date.now() / 1000),
				},
				JWT_KEY,
				{ expiresIn: parseInt(process.env.USER_TOKEN_EXPIRE_TIME) },
			);
			return res.json({ token: token });
		} else {
			return res.status(400).json({ error: "Invalid password" });
		}
	} catch (error) {
		return res.status(400).json({ error: String(error) });
	}
});

module.exports = adminFrontRouter;
