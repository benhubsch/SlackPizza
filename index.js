var pizzapi = require('dominos');


var addressObj = {
    "Street": "329 12th Street",
    "City": "San Francisco",
    "Region": "CA",
    "PostalCode": "94103"
}

var spike = new pizzapi.Customer(
    {
        firstName: 'Spike',
        lastName: 'Lu',
        address: addressObj,
        email: 'bah37@duke.edu',
        phone: '16264294446'
    }
);

console.log("Initializing order...");
var order = new pizzapi.Order(
    {
        customer: spike,

        //optional set the store ID right away
        storeID: 7764,

        deliveryMethod: 'Carryout' //(or 'Carryout')
    }
);
// right up until here (we think)
console.log("Adding items to order...")
order.addItem(
    new pizzapi.Item(
        {
            code: 'P_14SCREEN',
            options: [], // possibly an object
            quantity: 1,
        }
    )
);
console.log(order.price.toString())

console.log("Setting up credit card info...")
var cardNumber = 5275190008198539;
var cardInfo = new order.PaymentObject();
// console.log('Customer', order.Amounts);
cardInfo.Amount = order.Amounts.Customer;
cardInfo.Number = cardNumber;
cardInfo.CardType = order.validateCC(cardNumber);
cardInfo.Expiration = '0320'; // possibly a string?
cardInfo.SecurityCode = 322;
cardInfo.PostalCode = 30322; // Billing Zipcode

console.log("Adding card to order...");
order.Payments.push(cardInfo);


// order.validate(
//     function(result) {
//         console.log("Order is Validated");
//     }
// );
//
order.price(
    function(result) {
        console.log("Order is Priced");
    }
);

// console.log('order', order);
//
// order.place(
//     function(result) {
//         console.log("Price is", result.result.Order.Amounts, "\nEstimated Wait Time",result.result.Order.EstimatedWaitMinutes, "minutes");
//         console.log("Order placed!");
//     }
// );




// pizzapi.Util.findNearbyStores(
//     '1412 Market St., San Francisco, CA',
//     'Delivery',
//     function(storeData){
//         var storeID = storeData.result.Stores[0];
//         var myStore = new pizzapi.Store({ID: storeID});
//         myStore.ID = storeData.result.Stores[0].StoreID;
//         myStore.getMenu(
//             function(storeData){
//                 console.log(storeData);
//             }
//         );
//     }
// );





