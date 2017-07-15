var express = require('express')
var app = express()
var path = require('path')

var exphbs = require('express-handlebars')
app.set('views', path.join(__dirname, 'CreditCardForm/views'));
app.engine('.hbs', exphbs({extname: '.hbs'}));
app.set('view engine', '.hbs');

var expressValidator = require('express-validator')
app.use(expressValidator())

// Enable POST request body parsing
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

// Serve static files
app.use(express.static(path.join(__dirname, 'CreditCardForm/public')));



// mongoose setup
var mongoose = require('mongoose')
mongoose.connection.on('error', function() {
    console.log('Oh no! Could not connect to database.')
})
mongoose.connection.on('connected', function() {
    console.log('Yay! Connected to database in payment.js')
})
mongoose.connect(process.env.MONGODB_URI)

var models = require('./models/models')
var Order = models.Order
var PaymentPage = models.PaymentPage


// DOMINOS SETUP
var pizzapi = require('dominos');



app.get('/', function(req, res) {
    res.redirect('/error')
})

var cardObj = {}
app.post('/payment/:slackId', function(req, res) {
    req.checkBody('first', 'Invalid First Name').notEmpty();
    req.checkBody('last', 'Invalid Last Name').notEmpty();
    req.checkBody('number', 'Invalid Card Number').notEmpty()
    req.checkBody('expiry', 'Invalid Card Expiry Date').notEmpty()
    req.checkBody('cvc', 'Invalid CVC').notEmpty().isInt();
    req.checkBody('zip', 'Invalid Zip Code').notEmpty().isInt();

    var errors = req.validationErrors();
    if (errors) {
        console.log('ERRORS IN POST /PAYMENT', errors);
        res.redirect('/error')
    } else {
        var num = parseInt(req.body.number.split(' ').join(''))
        var exp = String(req.body.expiry.split(' / ').join(''))
        var cvc = parseInt(req.body.cvc)
        var zip = parseInt(req.body.zip)
        var first = req.body.first // REMEMBER THAT CUSTOMER IS A NESTED OBJECT INSIDE ORDER.... DEAL WITH THAT
        var last = req.body.last

        var slackId = req.params.slackId

        Order.find({ slackId: slackId }, function(err, savedOrder) {
            if (err) {
                console.log('error in find by slacKId', err);
                res.redirect('/error')
            } else {
                console.log(savedOrder[0]);
                var orderObj = savedOrder[0].orderObj
                var codeArr = savedOrder[0].codeArr

                orderObj.customer.firstName = first
                orderObj.customer.lastName = last

                var orderObj = new pizzapi.Order(orderObj)
                for (var i=0; i < codeArr.length; i++) {
                    orderObj.addItem(new pizzapi.Item({
                            code: codeArr[i],
                            options: [],
                            quantity: 1
                        })
                    )
                }
                console.log(orderObj);

                console.log('FROM DATABASE', orderObj);
                var cardInfo = new orderObj.PaymentObject();
                cardInfo.Amount = orderObj.Amounts.Customer;
                cardInfo.Number = num;
                cardInfo.CardType = orderObj.validateCC();
                cardInfo.Expiration = exp; // possibly a string?
                cardInfo.SecurityCode = cvc;
                cardInfo.PostalCode = zip; // Billing Zipcode

                console.log("Adding card to order...");
                orderObj.Payments.push(cardInfo);


                orderObj.validate(function(result) {
                        console.log("Order has been validated...");
                    }
                );

                orderObj.price(function(result) {
                        console.log("Order has been priced...");
                    }
                );

                orderObj.place(function(result) {
                    try{
                        var waitMessage = orderObj.deliveryMethod === 'Delivery' ? 'Your food will be delivered in ' : 'Your food will be ready for pickup in '
                        var priceMessage = "Your total was: $" + result.result.Order.Amounts.Payment
                        var timeMessage = waitMessage + result.result.Order.EstimatedWaitMinutes + ' minutes'}
                    catch(err){
                        console.log(err);
                    }
                    console.log('Order has been placed...', result);
                    console.log(result.result.Order.CorrectiveAction);
                    console.log(timeMessage);
                    res.render('confirmation', {wait: timeMessage, price: priceMessage})
                });
            }
        })

    }
})

app.get('/payment/:slackId', function(req, res) {
    var slackId = req.params.slackId
    PaymentPage.findOne({ slackId: slackId }, function(err, foundPaymentPage) {
        res.render('payment', {slackId: slackId})
    })
})

app.get('/error', function(req, res) {
    res.send('Something went wrong with your payment details; try again!')
})
app.get('/success', function(req, res) {
    res.render('confirmation')
})


var port = process.env.PORT || 3000
app.listen(port, function() {
    console.log('succesfully connected to port', port);
})
