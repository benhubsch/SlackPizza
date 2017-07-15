var mongoose = require('mongoose')

var Order = mongoose.model('Order', {
    slackId: String,
    codeArr: Array,
    orderObj: Object
})

var PaymentPage = mongoose.model('PaymentPage', {
    slackId: String,
    firstName: String,
    foodArr: Array
})

module.exports = ({
    Order: Order,
    PaymentPage: PaymentPage
})