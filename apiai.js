var apiai = require('apiai');
var axios = require('axios');

var app = apiai(process.env.APIAI_CLI);

var request = app.textRequest(input, {
    sessionId: '<unique session id>'
})

request.on('response', function(response) {
    console.log( response);
});

request.on('error', function(error) {
    console.log(error);
});

request.end();
