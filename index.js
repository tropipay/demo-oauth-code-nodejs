//------------------------------------------------------ SERVER INIT
const app = require('express')();
const axios = require('axios');
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//------------------------------------------------------ VARs
//...................................................... URL
const oauth_authorize = 'http://localhost:3001/api/v2/access/authorize';
const oauth_token = 'http://localhost:3001/api/v2/access/token';
//...................................................... Credentials
const client_id = "1b125cefa4e6aa5fc044a06190953eac";
const client_secret = "6fdd1a8b146b22be1057d38f2b672e7d";
//...................................................... Options
const redirect_uri = "http://localhost:5000/oauth/response";
const scope = "ALLOW_GET_BALANCE";
//...................................................... Security Basic [OPTIONAL]
const state = "abcd-1234";
//...................................................... Security PKCE [OPTIONAL]
const code_verifier = "1234-abcd-1234";
const code_challenge = "N2_wPQ7X9iP5bKXcw05rqHw1S7OwFuU4Nqi6ccr_LEs";
const code_challenge_method = "S256";

//------------------------------------------------------ ROUTE HOME
app.get('/', (req, res, next) => {
	res.end('<a href="/user/balance"> User Balance </a>');
});
//...................................................... ROUTE OAUTH STEP 1
app.get('/user/balance', (req, res, next) => {
	const param = "?response_type=code" +
				"&client_id=" + client_id +
				"&client_secret=" + client_secret + 
				"&redirect_uri=" + redirect_uri + 
				"&code_challenge=" + code_challenge + 
				"&code_challenge_method=" + code_challenge_method + 
				"&state=" + state + 
				"&scope=" + scope;
	res.redirect(oauth_authorize + param);
});
//...................................................... ROUTE OAUTH STEP 2
app.get('/oauth/response', async (req, res, next) => {
	let access_token = "";
	try{
		//... verify the estate value
		if(req.query['state'] !== state){
			console.log('NOT secure, the state value not match');
		}
		//... confifure options for get authorization code
		const param = {
			grant_type: "authorization_code",
			code: req.query['code'],
			client_id,
			client_secret,
			redirect_uri,
			code_verifier,
			scope
		};
		//... save authorization code
		const token = await axios.post(oauth_token, param);
		access_token = token.data.access_token;
	}
	catch(error){
		res.end('OAUTH: Not authorize');
	}
	try {
		//... GET SERVICE
		const response = await axios({
			headers: { 'Authorization': 'Bearer '+ access_token },
			url: "http://localhost:3000/api/users/balance"
		});
		res.end(`<h1> Balance: ${response.data.balance} </h1>`);
	}
	catch(error){
		res.end('Service: Not authorize');
	}
});

//------------------------------------------------------ SERVER START
const PORT = process.env.PORT || 5000
app.listen(PORT, console.log(`>>> http://localhost:${PORT}`))