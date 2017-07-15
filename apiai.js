// For each API request, include this HTTP header:
//
// Authorization with the value Bearer {access_token}.
//
// For example:
//
// Authorization: Bearer YOUR_ACCESS_TOKEN

// So, for example, the query requests should be made to the endpoint /query?v=20150910.
//
// The v parameter is formatted as YYYYMMDD.

var apiai = require('apiai');

var app = apiai(process.env.APIAI_CLI);

var request = app.textRequest('I want pizza', {
    sessionId: '<unique session id>'
});

request.on('response', function(response) {
    console.log(response);
});

request.on('error', function(error) {
    console.log(error);
});

request.end();

// axios.get('https://api.api.ai/v1/query?v=20150910&amp;query=hey&amp;lang=en&amp;sessionId=1234567890', {
//     Headers: {
//     Authorization: "Bearer 5aa1729dc572457db733f83eb05d2bda",
// },
// })
// .then((response) => console.log("response: ", response))
// .catch((err) => console.log('err', err))
