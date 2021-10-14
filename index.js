//------------------------------------------------------ SERVER INIT
const app = require('express')();
const axios = require('axios');
const qs = require('qs');
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
//------------------------------------------------------ VARs
//...................................................... URL
const url_tropipay = "https://sandbox.tropipay.me";
const oauth_authorize = url_tropipay + '/api/v2/access/authorize';
const oauth_token = url_tropipay + '/api/v2/access/token';
//...................................................... Credentials (Menu > Seguridad > APP y Credenciales)
const client_id = "946cef5ecad81f282e20d9bbb712ec64";
const client_secret = "e25bbb41a2a2ed365e685e0edbb81162";
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
    res.end('<a href="/user/connected_view" style="\n' +
        '    border: 1px solid;\n' +
        '    padding: 8px;\n' +
        '    text-decoration: none;\n' +
        '    font-family: sans-serif;\n' +
        '    top: 40px;\n' +
        '    position: relative;\n' +
        '"> Connect my Tropipay Account </a>');
});
//...................................................... ROUTE OAUTH STEP 1
app.get('/user/connected_view', (req, res, next) => {
    const param = qs.stringify({
        response_type: "code",
        client_id,
        client_secret,
        redirect_uri,
        code_challenge,
        code_challenge_method,
        state,
        scope
    });
    res.redirect(oauth_authorize + "?" + param);
});
//...................................................... ROUTE OAUTH STEP 2
app.get('/oauth/response', async (req, res, next) => {
    let access_token = "";
    try {
        //... verify the state value
        if (req.query['state'] !== state) {
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
    } catch (error) {
        res.end('OAUTH: Not authorize');
    }
    try {
        //... GET SERVICE
        let [balanceData, profileData] = await Promise.all([
            axios({
                headers: {'Authorization': 'Bearer ' + access_token},
                url: url_tropipay + "/api/users/balance"
            }),
            axios({
                headers: {'Authorization': 'Bearer ' + access_token},
                url: url_tropipay + "/api/users/profile"
            }),
        ]);
        res.end(`<p> Hi <strong>${profileData.data.name} </strong> this is your 
                  TPP balance: <strong>${balanceData.data.balance / 100} </strong> EUR </p>`
        );
    } catch (error) {
        res.end('Service: Not authorize');
    }
});

//------------------------------------------------------ SERVER START
const PORT = process.env.PORT || 5000
app.listen(PORT, console.log(`>>> http://localhost:${PORT}`))
