var express = require('express')
var bodyParser = require('body-parser')

var app = express()
var port = process.env.PORT || 3000

app.use(bodyParser.urlencoded({extended: true}))

app.get('/', function(req, res) {
    res.status(200).send('Hello World!')
})

app.post('/username', function(req, res) {
    console.log(req.body);
    var username = req.body.user_name
    var botPayload = {
        text: 'Hey, ' + username + '. You must be a hungry, hungry hippo right now! What kind of pizza are you in the mood for?'
    }

    if (username !== 'slackbot') {
        return res.status(200).json(botPayload)
    } else {
        return res.status(200).end()
    }
})

app.listen(port, function() {
    console.log('succesfully connected to port', port);
})
