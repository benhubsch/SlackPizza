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

app.get('/', function(req, res) {
    res.status(200).send('Hello world!')
})

var cardObj = {}
app.post('/payment', function(req, res) {
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
        // var first = req.body.first
        // var last = req.body.last
        // var number = req.body.number
        // var expiry = req.body.expiry
        // var cvc = req.body.cvc
        cardObj.num = req.body.number.split(' ').join('')
        cardObj.exp = req.body.expiry.split(' / ').join('')
        cardObj.sec = req.body.cvc
        cardObj.zip = req.body.zip
        console.log(cardObj);
        module.exports = { cardObj };

        res.redirect('/success')
    }
    res.end()
})

app.get('/payment', function(req, res) {
    res.render('payment', {customer: 'Jane'})
})

app.get('/error', function(req, res) {
    res.send('Something went wrong with your payment details; try again!')
})
app.get('/success', function(req, res) {
    res.status(200).send('Head back to Slack, where your order details will be waiting for you!')
})


var port = process.env.PORT || 3000
app.listen(port, function() {
    console.log('succesfully connected to port', port);
})