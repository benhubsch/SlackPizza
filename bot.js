
var RtmClient = require('@slack/client').RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;

var bot_token = process.env.SLACK_BOT_TOKEN || 'xoxb-211251867923-Fcgdxf06fzi9k4pIKaUW0xEq';

var rtm = new RtmClient(bot_token);

let channel;

var connected = false

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
        console.log(response);
        response = JSON.parse(response)
        if (response.type === 'message' && connected ) {
            if (response.text.indexOf('pizza') >= 0) {
                rtm.sendMessage("You must be a hungry hungry boy, Spike! Eat some lettuce--it's better for you!", channel);
            }
        }
        connected = true
    });

});



rtm.start();