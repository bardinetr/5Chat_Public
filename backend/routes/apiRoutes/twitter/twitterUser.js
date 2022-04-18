var express = require("express");
var twitterUserRouter = express.Router();

var TwitterUserServices = require(process.cwd() +
	"/src/services/twitterAPI/twitterUserServices.js");
const TwitterUserServicesInstance = new TwitterUserServices();

var DynamoUserDataServices = require(process.cwd() +
	"/src/services/DynamoDB/dynamoUserDataServices.js");
const DynamoUserDataServicesInstance = new DynamoUserDataServices();

var jwt_module = require("jsonwebtoken");
var JWT_KEY = process.env.JWT_KEY;
const LIFELENGTH = parseInt(process.env.USER_TOKEN_EXPIRE_TIME);

// /* GET twitter data from user UNUSED*/
// twitterUserRouter.get("/user/maindata/:username", async function (req, res) {
//   TwitterUserServicesInstance.getUser_DEV(null, req.params.username)
//     .then((user) => {
//       console.log("api/user/:username called found user = ", user);
//       res.json(user);
//     })
//     .catch((e) => {
//       console.log(e);
//     });
// });

/* GET user basic data from @ */
twitterUserRouter.get("/user/basicdata/", async function (req, res) {
	let username = req.query.username;
	let id = req.query.id;
	let jwt = req.query.jwt;

	let userdatatmp = null;
	let data = null;
	let adminId = null;

	try {
		const decoded = jwt_module.verify(jwt, JWT_KEY);
		adminId = decoded.adminId;
		if (adminId == null || adminId == undefined) {
			throw "invalid token";
		}
		console.log("adminId :>> ", adminId, " is requesting userbasic data for ", username);
	} catch (err) {
		return res.status(400).send({ error: err });
	}

	if (id !== undefined && username == undefined) {
		try {
			userdatatmp = await TwitterUserServicesInstance.getUserBasicDataFromId(id);
			data = userdatatmp.data;
			console.log("/basicdatafromid successfully fetched user = ", data.username);
		} catch (error) {
			console.log(error);
			res.json({ error: String(error) });
			return 1;
		}
	} else if (id == undefined && username !== undefined) {
		try {
			userdatatmp = await TwitterUserServicesInstance.getUserBasicData(username);
			data = userdatatmp.data[0];
			console.log("/basicdata successfully fetched user = ", data.username);
		} catch (error) {
			console.log(error);
			res.status(400).json({ error: String(error) });
			return 1;
		}
	} else if (id !== undefined && username !== undefined) {
		data = { id: id, username: username };
	} else {
		res.json({ error: "Couldnt read username or id" });
	}
	//Setting up JWT token
	var token = jwt_module.sign(
		{
			accName: data.username,
			accId: data.id,
			iat: Math.floor(Date.now() / 1000),
		},
		JWT_KEY,
		{ expiresIn: LIFELENGTH },
	);
	res.send({ userdata: data, jwt: token });
});

/* TEST */
twitterUserRouter.get("/userauth/checkDB", async function (req, res) {
	let oauth_user_status = await DynamoUserDataServicesInstance.getUserOAuthStatus(
		"bochat_",
		"1176168170589171714",
		true,
	).catch((e) => {
		console.log(e);
		res.json({ error: String(e) });
		return 1;
	});
	console.log("oauth_user_status :>> ", oauth_user_status);
	res.json(oauth_user_status);
});

/* LOGIN WITH USER : initiate request tokens */
twitterUserRouter.get("/userauth/front", async function (req, res) {
	//console.log("[get front] FIRST CALL TO FRONT PARAMETERS :");

	//Getting accName and id from the jwt
	let accName = null;
	let accId = null;
	let jwt = req.query.jwt;

	try {
		const decoded = jwt_module.verify(jwt, JWT_KEY);
		accName = decoded.accName;
		accId = decoded.accId;
	} catch (err) {
		return res.send({ error: err });
	}

	if (accName == null || accId == null) {
		return res.send({ error: "error reading token values" });
	}

	if (req.query.accId == "-1") {
		//Calling Twitter API to get the ID
		console.log("[get front] user id wasnt provided, fetching it");
		let user_basics_twitter = await TwitterUserServicesInstance.getUserBasicData(
			accName,
		).catch((e) => {
			console.log(e);
			return res.json({
				error: String(e),
				error_tldr: `twitter couldnt read user basic data for account ${accName}`,
			});
		});
		accId = user_basics_twitter.data[0].id;
	}
	//console.log("[get front] accId :>> ", accId);
	console.log("[get front] signing in accName :>> ", accName);

	//Checking if user already in DB
	let oauth_user_status = await DynamoUserDataServicesInstance.getUserOAuthStatus(
		accName,
		accId,
		false,
	).catch((e) => {
		console.log(e);
		return res.json({ error: e });
	});
	console.log("[get front] oauth_user_status.status :>> ", oauth_user_status.status);
	if (oauth_user_status.status == "user_tokens_ready") {
		//If user tokens in DB, fetching blocks and muted from twitter user:
		TwitterUserServicesInstance.getUserBlocks(
			accId,
			oauth_user_status.tokens.oauth_token,
			oauth_user_status.tokens.oauth_token_secret,
		)
			.then((user_blocks) => {
				console.log(
					`data was already in db, sending user blocks(count : ${user_blocks.data.length})`,
				);
				//console.log("user_blocks :>> ", user_blocks);
				return res.json({
					status: "USER_BLOCKS",
					tokens: oauth_user_status.tokens,
					blocks: user_blocks.data,
				});
			})
			.catch((e) => {
				console.log(e);
				return res.json({ error: String(e) });
			});
	} else if (
		oauth_user_status.status == "user_tokens_not_ready" ||
		oauth_user_status.status == "user_not_created"
	) {
		TwitterUserServicesInstance.requestToken()
			.then((tokens) => {
				return res.json({
					status: "BOT_TOKENS",
					tokens: tokens,
					userData: { accId: accId, accName: accName },
				});
			})
			.catch((e) => {
				console.log(e);
				return res.json({ error: e });
			});
	} else {
		return res.json({ status: "ERROR", tokens: null });
	}
});

/* LOGIN WITH USER : receive bot tokens specific to user 
from twitter rendered sign-in page
:: oauth_token, oauth_verifier ::
*/
twitterUserRouter.get("/userauth/tokens", async function (req, res) {
	/////NEED OPTION CASE FOR USER REFUSAL
	if (req.query.denied) {
		//User has denied the authorisation request on the twitter rendered signin pop up
		return res.render("redirectOAUTH", {
			oauth_token: "Authorisation Denied",
			oauth_verifier: "5Chat wont be able to sort out people you blocked from groupchats",
		});
	}
	let oauth_token = req.query.oauth_token;
	let oauth_verifier = req.query.oauth_verifier;
	console.log(
		"[fetching access tokens] received oauth_token and oauth_verifier, getting access tokens",
	);
	// console.log("oauth_token :>> ", oauth_token);
	// console.log("oauth_verifier :>> ", oauth_verifier);
	// console.log("getting access tokens");
	let accessToken = await TwitterUserServicesInstance.accessToken(
		oauth_token,
		oauth_verifier,
	).catch((error) => {
		console.log("[fetching access tokens] error :>> ", error);
		res.render("redirectOAUTH", {
			oauth_token: "that's embarrassing",
			oauth_verifier:
				"something failed : [fetching access tokens] error, contact me on Discord ASAP",
		});
	});
	console.log("[fetching access tokens] accessToken received");
	//console.log("accessToken :>> ", accessToken);

	//Saving newly aquired tokens to Database
	const date_current = Date.now();
	const packet = {
		id: accessToken.user_id,
		//IF THE ID WAS "-1" (not provided by first front call), THIS SETS IT TO NEW VALUE
		oauth_twitter: {
			oauth_token: accessToken.oauth_token,
			oauth_token_secret: accessToken.oauth_token_secret,
			oauth_fetch_date: date_current,
		},
	};
	let userOAuthDBStatus = await DynamoUserDataServicesInstance.upload_data(
		packet,
		accessToken.screen_name,
		"oauth_twitter",
	).catch((error) => {
		console.log("[upload tokens to DB] error :>> ", error);
		res.render("redirectOAUTH", {
			oauth_token: "that's embarrassing",
			oauth_verifier: "something failed, contact me on Discord ASAP",
		});
	});
	console.log("[fetching access tokens] database uppdated");
	if (userOAuthDBStatus) {
		res.render("redirectOAUTH", {
			oauth_token: accessToken.oauth_token,
			oauth_verifier: accessToken.oauth_token_secret,
		});
	} else {
		res.render("redirectOAUTH", {
			oauth_token: "that's embarrassing",
			oauth_verifier: "something failed, contact me on Discord ASAP",
		});
	}

	// res.render("redirectOAUTH", { oauth_token: "req.body.oauth_token", oauth_verifier: "req.body.oauth_verifier" });
	//res.json({ oauth_token: req.body.oauth_token, oauth_verifier: req.body.oauth_verifier });
});

/* LOOPCALL WAITING FOR AVAILABLE TOKENS */
twitterUserRouter.get("/userauth/loop", async function (req, res) {
	let loop_counter = 0;
	let loop_flag = true;

	//Getting accName and id from the jwt
	let accName = null;
	let accId = null;
	let jwt = req.query.jwt;

	try {
		const decoded = jwt_module.verify(jwt, JWT_KEY);
		accName = decoded.accName;
		accId = decoded.accId;
	} catch (err) {
		return res.send({ error: err });
	}

	console.log("[/userauth/loop] accName :>> ", accName);
	console.log("[/userauth/loop] accId :>> ", accId);

	if (accName == null || accId == null) {
		return res.send({ error: "error reading token values" });
	}

	while (loop_flag && loop_counter <= 10) {
		DynamoUserDataServicesInstance.getUserOAuthStatus(accName, null, true)
			.then((oauth_user_status) => {
				console.log(
					`looping n° ${loop_counter}: oauth_user_status :>> `,
					oauth_user_status.status,
				);
				if (oauth_user_status.status == "user_tokens_ready") {
					console.log("[get loop] tokens ready in db !");
					loop_flag = false;
					//If user tokens in DB, fetching blocks and followers from twitter user:
					TwitterUserServicesInstance.getUserBlocks(
						accId,
						oauth_user_status.tokens.oauth_token,
						oauth_user_status.tokens.oauth_token_secret,
					)
						.then((user_blocks) => {
							console.log(
								`[get loop] sending user blocks(count : ${user_blocks.data.length})`,
							);
							return res.json({
								status: "USER_BLOCKS",
								tokens: oauth_user_status.tokens,
								blocks: user_blocks.data,
							});
						})
						.catch((e) => {
							console.log(e);
							loop_flag = false;
							return res.json({ error: e });
						});
				} else if (oauth_user_status.status == "error") {
					loop_flag = false;
					return res.json({
						status: "ERROR",
						tokens: null,
					});
				}
			})
			.catch((e) => {
				console.log(e);
				loop_flag = false;
				return res.json({ error: String(e) });
			});
		await new Promise((resolve) => setTimeout(resolve, 2000));
		loop_counter += 1;
	}
	if (loop_flag) {
		res.json({
			status: "TIMEDOUT",
			tokens: {},
		});
	}
	return 1;
});

module.exports = twitterUserRouter;
