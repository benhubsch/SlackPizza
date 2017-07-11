
var RtmClient = require('@slack/client').RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;

var bot_token = process.env.SLACK_BOT_TOKEN || 'xoxb-211251867923-Fcgdxf06fzi9k4pIKaUW0xEq';

var rtm = new RtmClient(bot_token);

let channel;

//
var connected = false
var address = false
var name = false
var email = false
var order = false
var payment = false


var User = {}

// The client will emit an RTM.AUTHENTICATED event on successful connection, with the `rtm.start` payload
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
    for (const c of rtmStartData.channels) {
        if (c.is_member && c.name ==='test') { channel = c.id }
    }
    console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
});

// you need to wait for the client to fully connect before you can send messages
rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function () {

    rtm.sendMessage("I'm joining the channel!", channel);

    rtm.on(CLIENT_EVENTS.RTM.RAW_MESSAGE, function (response) {
        response = JSON.parse(response)
        console.log('response', response);

        if (response.type !== 'message') return;


        if (name) {
            console.log('in address');
            User.address = response.text
            rtm.sendMessage("Great! What is your first and last name?", channel)
            email = true
            name = false
        }

        else if (email) { // possibly contained in user info
            console.log('in name');
            User.first = response.text.split(' ')[0]
            User.last = response.text.split(' ')[1]
            rtm.sendMessage("Thanks, " + User.first + "! What is your email?", channel)
            order = true
            email = false
        }

        else if (order) { // possibly contained in user info
            console.log('in email');
            var emailString = response.text.split('|')[1]
            User.email = emailString.substring(0, emailString.length - 1)
            rtm.sendMessage("What a fantastic email! What would you like to order?", channel)
            payment = true
            order = false
        }

        else if (payment) {
            console.log('in order');
            User.order = response.text
            rtm.sendMessage("Sounds delicious! I'm getting hungry just thinking about eating " + User.order, channel)
            payment = false
            console.log(User);
        }

        if (connected) {
            if (response.text.indexOf('pizza') >= 0) {
                console.log('in connected');
                rtm.sendMessage("So you want to order a pizza, huh? What's your address?", channel);
                name = true
            }
        }

        connected = true
    });

});



rtm.start();