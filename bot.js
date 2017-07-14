var RtmClient = require('@slack/client').RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var pizzapi = require('dominos');
var validateAddress = require('./geocode').validateAddress

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

var customer = {};
var orderObj = {};
var deliveryMethod;
var myStore;
var userIDObj = {};
var route;

// The client will emit an RTM.AUTHENTICATED event on successful connection, with the `rtm.start` payload
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
    buildDM(rtmStartData.ims)
    for (const c of rtmStartData.channels.concat(rtmStartData.ims)) {
        if (c.is_member && c.name ==='test') { route = c.id }
    }

    console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a route`);
});

rtm.on(CLIENT_EVENTS.RTM.RAW_MESSAGE, function (response) {
    response = JSON.parse(response)

    if (response.type !== 'message' || response.user === 'U677DRHT5') return; // response.user === bot's id

    dealWithCustomer(response)
});


// you need to wait for the client to fully connect before you can send messages
rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function () {
    rtm.sendMessage("Here I am, fam!", route);

    connected = true
});

function dealWithCustomer(response) {

    if (response.text.toLowerCase().indexOf('pizzabot') >= 0 && connected) {
        // console.log(response);
        route = userIDObj[response.user]

        rtm.sendMessage("So you want to order a pizza, huh? What's your address?", route);
        name = true
        connected = false
    } else if (name) {

        var googleReturn = validateAddress(response.text).then(function(result) { // the argument to validateAddress should later be response.text or whatever Jens comes up with
            customer.address = new pizzapi.Address(result.split(', ').slice(0, 3).join(', ')) // address puts state as postal code...
            rtm.sendMessage("Great! What is your first and last name?", route)
            delivery = true
            name = false

            return result
        }).catch(function(err) {
            console.log('Error in address fetch', err);
        })

        return null

    } else if (delivery) {
        customer.firstName = response.text.split(' ')[0]
        customer.lastName = response.text.split(' ')[1]
        rtm.sendMessage("Type d for delivery or c for carryout", route)
        email = true
        delivery = false
    } else if (email) { // possibly contained in customer info
        orderObj.deliveryMethod = response.text === 'c' ? 'Carryout' : 'Delivery';
        myStore = nearbyStores(customer.address, order.deliveryMethod); // storeID is stored in orderObj
        rtm.sendMessage("Thanks, " + customer.firstName + "! What is your email?", route)
        phone = true
        email = false
    } else if (phone) { // possibly contained in customer info
        var emailString = response.text.split('|')[1]
        customer.email = emailString.substring(0, emailString.length - 1)
        rtm.sendMessage("Aaaaand what are your digits " + customer.firstName + "? :kissing_heart:", route)
        order = true
        phone = false
    } else if (order) { // possibly contained in customer info
        var phoneString = response.text
        customer.phone = phoneString
        rtm.sendMessage("What would you like to order?", route)
        orderObj.customer = customer;
        // orderObj = new pizzapi.Order(orderObj);
        payment = true
        order = false
    } else if (payment) {
        // orderObj.code = response.text
        // push everything onto an array
        orderObj.addItem(new pizzapi.Item(
            {
                code: 'S_PIZPH',
                options: [],
                quantity: 1
            }
        ))

        orderObj.addItem(new pizzapi.Item(
            {
                code: 'S_PIZZA',
                options: [],
                quantity: 1
            }
        ))
        console.log('ORIGINAL', orderObj);
        var newOrder = new Order({ slackId: response.user, orderObj: orderObj })
        newOrder.save(function(err, returnedOrder) {
            if (err) {
                console.log('error saving new order', err);
            } else {
                rtm.sendMessage("Sounds delicious! Click this link to confirm credit card details: http://localhost:3000/payment/" + response.user, route)

                placeOrder = true
                payment = false
            }
        })

    } else if (placeOrder) {

        var cardInfo = new orderObj.PaymentObject();
        cardInfo.Amount = orderObj.Amounts.Customer;
        cardInfo.Number = cardObj.num;
        cardInfo.CardType = orderObj.validateCC();
        cardInfo.Expiration = cardObj.exp; // possibly a string?
        cardInfo.SecurityCode = cardObj.sec;
        cardInfo.PostalCode = cardObj.zip; // Billing Zipcode

        console.log("Adding card to order...");
        orderObj.Payments.push(cardInfo);

        rtm.sendMessage("Do you want to place your order? (y) or (n)", route)
        confirmation = true
        placeOrder = false
        // console.log(orderObj);
    } else if (confirmation) {
        if(response.text === 'y'){
            orderObj.validate(function(result) {
                    console.log("Order has been validated...");
                }
            );

            orderObj.price(function(result) {
                    console.log("Order has been priced...");
                }
            );

            orderObj.place(function(result) {
                var waitMessage = deliveryMethod === 'Delivery' ? 'Your food will be delivered in ' : 'Your food will be ready for pickup in '
                rtm.sendMessage("Total price came out to:" + result.result.Order.Amounts.Payment, route)
                rtm.sendMessage(waitMessage + result.result.Order.EstimatedWaitMinutes + ' minutes', route)
                rtm.sendMessage('Thanks for ordering with us! We hope you order again soon! :heart: ', route)
                console.log('Order has been placed...', result);
                    // pizzapi.Track.byPhone(
                    //     customer.phone,
                    //     function(pizzaData){
                    //         console.log(pizzaData);
                    //     }
                    // );
                }
            );

            rtm.sendMessage("Congratulations! You just ordered Dominos!", route)
        } else {
            orderObj = {};
        }
        confirmation = false
    }
}

function buildDM(idArr) {
    console.log('idArr', idArr);
    for (var i=0; i < idArr.length; i++) {
        var dm = idArr[i].id;
        var userId = idArr[i].user;
        userIDObj[userId] = dm
    }
    console.log(userIDObj);
}

//Pizza functions
function nearbyStores(address, deliveryMethod){
    pizzapi.Util.findNearbyStores(
        address,
        deliveryMethod,
        function(storeData){
            var storeID = storeData.result.Stores[0].StoreID;
            var myStore = new pizzapi.Store({ID: storeID});
            orderObj.storeID = storeID;
            return myStore;
        }
    );
}

function replaceAll(str1, str2, total, ignore) {
   return total.replace(new RegExp(str1.replace(/([\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, function(c){return "\\" + c;}), "g"+(ignore?"i":"")), str2);
};


rtm.start();