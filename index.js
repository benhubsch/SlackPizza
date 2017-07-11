var pizzapi = require('dominos');
var cardObj = require('./config').cardObj
var customerObj = require('./config').customerObj

var spike = new pizzapi.Customer(customerObj);
var util = require('util')

// console.log("Initializing order...");
// var order = new pizzapi.Order({
//     customer: spike,
//
//     storeID: 7764,
//
//     deliveryMethod: 'Carryout' //('Delivery' or 'Carryout')
// });
//
// console.log("Adding items to order...")
// order.addItem(
//     new pizzapi.Item({
//         code: 'PINPASCA',
//         options: [],
//         quantity: 1,
//     })
// );
//
// console.log("Setting up credit card info...")
// var cardInfo = new order.PaymentObject();
// cardInfo.Amount = order.Amounts.Customer;
// cardInfo.Number = cardObj.num;
// cardInfo.CardType = order.validateCC();
// cardInfo.Expiration = cardObj.exp; // possibly a string?
// cardInfo.SecurityCode = cardObj.sec;
// cardInfo.PostalCode = cardObj.zip; // Billing Zipcode
//
// console.log("Adding card to order...");
// order.Payments.push(cardInfo);
//
// console.log(cardInfo);
// console.log('\n');
// console.log(order);
//
// order.validate(
//     function(result) {
//         console.log("Order has been validated...");
//     }
// );
//
// order.price(
//     function(result) {
//         console.log("Order has been priced...");
//     }
// );
//
// order.place(
//     function(result) {
//         console.log("Price:", result.result.Order.Amounts.Payment, "\nEstimated wait time:", result.result.Order.EstimatedWaitMinutes, "minutes");
//         console.log("Order placed!");
//     }
// );




pizzapi.Util.findNearbyStores(
    '1412 Market St., San Francisco, CA',
    'Delivery',
    function(storeData){
        var storeID = storeData.result.Stores[0];
        var myStore = new pizzapi.Store({ID: storeID});
        myStore.ID = storeData.result.Stores[0].StoreID;
        myStore.getMenu(
            function(storeData){
                // console.log(storeData);
                console.log(storeData.menuByCode["S_PIZBP"]);
                console.log(storeData);
            }
        );
    }
);




