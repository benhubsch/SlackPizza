var apiai = require('apiai');

var app = apiai(process.env.APIAI_CLI);

var request = app.textRequest('I want pizza', {

});

request.on('response', function(response) {
    console.log(response);
});

request.on('error', function(error) {
    console.log(error);
});

request.end();
