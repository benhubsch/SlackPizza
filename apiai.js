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
var axios = require('axios');

var app = apiai(process.env.APIAI_CLI);

var request = function(input) {app.textRequest(input, {
    sessionId: '<unique session id>'
});}

request.on('response', function(response) {
    console.log( response);
});

request.on('error', function(error) {
    console.log(error);
});

request.end();

module.exports = {
    request: request,
}
