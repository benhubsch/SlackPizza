var RtmClient = require('@slack/client').RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var pizzapi = require('dominos');
var validateAddress = require('./geocode').validateAddress
var findNearby = require('./index').findNearby
var bestMatch = require('./findBestMatches').findBestMatches

console.log('@slack/client', require('@slack/client'));

var bot_token = process.env.SLACK_BOT_TOKEN;

var rtm = new RtmClient(bot_token);

// mongoose setup
var mongoose = require('mongoose')
mongoose.connection.on('error', function() {
    console.log('Oh no! Could not connect to database.')
})
mongoose.connection.on('connected', function() {
    console.log('Yay! Connected to database in bot.js')
})
mongoose.connect(process.env.MONGODB_URI)
var models = require('./models/models')
var Order = models.Order
var PaymentPage = models.PaymentPage

// api.ai setup
var apiai = require('apiai');
var app = apiai(process.env.APIAI_CLI);

var connected = false
var address = false
var name = false
var email = false
var order = false
var payment = false
var phone = false
var delivery = false
var placeOrder = false
var confirmation = false
var begin = false
var next = false

var customer = {};
var orderObj = {};
var deliveryMethod;
var myStore;
var userIDObj = {};
var route;
var foodCodeArr = [];
var foodNameArr = [];

var botParams = {'address': false, 'category': false, 'email': false, delivery: false, 'phone': false, 'type': false} // address (gmaps), category (pizza, pasta, salads, wings), email, full name, phone #, size, type a.k.a descriptors
var lastPrompt = 'email'; // the last key the bot prompted for

// The client will emit an RTM.AUTHENTICATED event on successful connection, with the `rtm.start` payload
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
    buildDM(rtmStartData.ims)
    for (const c of rtmStartData.channels.concat(rtmStartData.ims)) {
        if (c.is_member && c.name ==='test') { route = c.id }
    }

    console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a route`);
});

rtm.on(RTM_EVENTS.MESSAGE, function(response) {
    if (response.type !== 'message' || response.user === 'U677DRHT5') return; // response.user === bot's id

    dealWithCustomer(response)
});

// you need to wait for the client to fully connect before you can send messages
rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function () {
    console.log('client', CLIENT_EVENTS);
    rtm.sendMessage("*Here I am, fam!*", route);

    connected = true
});

function dealWithCustomer(response) {
    console.log(response);

    if (response.text.toLowerCase().indexOf('pizza') >= 0 && connected) {
        route = userIDObj[response.user]
        Order.find({ slackId: response.user }, function(err, foundUser) {
            if (err) {
                console.log('error in error');
            } else {
                if (foundUser.length === 0) {

                    var apiAI = new Promise(function(resolve, reject) {
                        var request = app.textRequest(response.text, {
                            sessionId: '123456789',
                            resetContexts: true
                        });

                        request.on('response', function(response) {
                            // console.log(response.result.parameters);
                            resolve(response.result.parameters)
                        });

                        request.on('error', function(error) {
                            console.log('error in promise reject');
                            reject(error)
                        });

                        request.end();
                    })

                    apiAI.then(function(response) {
                        // methods that checks which response fields are empty, and sets booleans that are later executed (or not)
                        for (var key in botParams) {
                            if (response[key]) {
                                botParams[key] = response[key];
                            }
                        }

                        rtm.sendMessage('What is your email?', route)

                        return null
                    }).catch(function(err) {
                        console.log('ERROR IN APIAI', err)
                    })

                    next = true
                    email = true
                    console.log('bottom of APIAI');

                    return null

                } else {
                    rtm.sendMessage('These are your order details from last time you ordered: ', route)
                    rtm.sendMessage('*Address:* ' + foundUser[0].orderObj.customer.address.Street + ' ' + foundUser[0].orderObj.customer.address.City + ' ' + foundUser[0].orderObj.customer.address.PostalCode, route)
                    rtm.sendMessage('*Email:* ' + foundUser[0].orderObj.customer.email + ' *Phone:* ' + foundUser[0].orderObj.customer.phone, route)
                    rtm.sendMessage('*Order:* ' + foundUser[0].foodNameArr[0] + ' *Delivery Method:* ' + foundUser[0].orderObj.deliveryMethod, route)
                    rtm.sendMessage('*Would you like to make this order again?*', route)

                    orderObj = foundUser[0].orderObj
                    codeArr = foundUser[0].codeArr[0]
                    foodNameArr = foundUser[0].foodNameArr[0]

                    begin = false
                    connected = false
                    next = false
                }
            }
        })
    } else if (next) {

        if (! botParams.address) {
            botParams[lastPrompt] = response.text

            var addRes = ['Where should I deliver?', 'Where do you want it delivered?', 'Where ya at?'][Math.floor(Math.random() * 2)]
            botParams.address = true;
            lastPrompt = 'address'
            rtm.sendMessage(addRes, route)
        } else if (! botParams.category) {
            botParams[lastPrompt] = response.text

            var ordRes = ['What are you feeling?', 'What makes you hungry?'][Math.floor(Math.random() * 2)]
            lastPrompt = 'category'
            botParams.type = true
            botParams.category = true
            rtm.sendMessage(ordRes, route)
        } else if (! botParams.delivery) {
            botParams[lastPrompt] = response.text

            var delRes = ['Would you like this delivered or would you like to pick it up in person?', 'Will you be eating this at home or in store?'][Math.floor(Math.random() * 2)]
            lastPrompt = 'delivery'
            botParams.delivery = true
            rtm.sendMessage(delRes, route)
        } else if (! botParams.phone) {
            botParams[lastPrompt] = response.text

            var phoneRes = ['What is your number?', 'What are your digits?', 'What number can I holla at you with?'][Math.floor(Math.random() * 3)]
            lastPrompt = 'phone'
            botParams.phone = true;
            rtm.sendMessage(phoneRes, route)
        } else {
            botParams.email = botParams.email.split('|')[1].substring(0, botParams.email.split('|')[1].length-1)
            botParams.phone = response.text
            var finalOrder;
            if (typeof botParams.type === 'boolean') {
                finalOrder = botParams.category
            } else {
                finalOrder = botParams.type + ' ' + botParams.category
            }

            var googleReturn = validateAddress(botParams.address).then(function(result) { // the argument to validateAddress should later be response.text or whatever Jens comes up with
                botParams.address = result.split(', ').slice(0, 3).join(', '); // address puts state as postal code...

                findNearby(botParams.address).then(function(menuNearest) {
                    var matchedItem = bestMatch(finalOrder, menuNearest)[0]

                    foodNameArr.push(matchedItem.Name)
                    foodCodeArr.push(matchedItem.Code)

                    pizzapi.Util.findNearbyStores(
                        botParams.address,
                        deliveryMethod,
                        function(storeData){
                            var storeID = storeData.result.Stores[0].StoreID;

                            orderObj = {
                                storeID: parseInt(storeID),
                                deliveryMethod: botParams.delivery, // this may need to be formatted,
                                customer: {
                                    address: new pizzapi.Address(botParams.address),
                                    email: botParams.email,
                                    phone: botParams.phone
                                }
                            }

                            rtm.sendMessage('*These are your order details:* ', route)
                            rtm.sendMessage('*Address:* ' + botParams.address, route)
                            rtm.sendMessage('*Email:* ' + orderObj.customer.email + ' *Phone:* ' + orderObj.customer.phone, route)
                            rtm.sendMessage('*Order:* ' + foodNameArr[0] + ' *Delivery Method:* ' + orderObj.deliveryMethod, route)
                            rtm.sendMessage('*Can you confirm this order?*', route)

                            next = false

                            return null
                        }
                    );

                }).catch(function(err) {
                    console.log('ERROR IN findNearby', err);
                })

                return result
            }).catch(function(err) {
                console.log('Error in address fetch', err);
            })
        }
    } else {
        if (response.text.toLowerCase().indexOf('yes') >= 0) {

            var newPaymentPage = new PaymentPage({ slackId: response.user })
            newPaymentPage.save(function(err) {
                if (err) {
                    console.log('error saving new payment page', err);
                }
            })

            var newOrder = new Order({ slackId: response.user, codeArr: foodCodeArr, orderObj: orderObj, foodNameArr: foodNameArr })
            newOrder.save(function(err, returnedOrder) {
                if (err) {
                    console.log('error saving new order', err);
                } else {
                    rtm.sendMessage("Sounds delicious! Click this link to confirm credit card details: http://localhost:3000/payment/" + response.user, route)

                    placeOrder = true
                    payment = false
                }
            })

        } else {
            Order.remove({ slackId: response.user }, function(err) {
                if (err) {
                    console.log('ERROR IN USER REMOVE', err);
                }
            })
            rtm.sendMessage("Oh no! You're going to have to start again so that we can clear your information from our database!", route)
        }
    }
}

function buildDM(idArr) {
    for (var i=0; i < idArr.length; i++) {
        var dm = idArr[i].id;
        var userId = idArr[i].user;
        userIDObj[userId] = dm
    }
}

rtm.start();

