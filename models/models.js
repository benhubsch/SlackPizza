var mongoose = require('mongoose')

var Order = mongoose.model('Order', {
    slackId: String,
    codeArr: Array,
    orderObj: Object,
    foodNameArr: Array
})

var PaymentPage = mongoose.model('PaymentPage', {
    slackId: String,
    firstName: String,
    foodCodeArr: Array,
    foodNameArr: Array
})

module.exports = ({
    Order: Order,
    PaymentPage: PaymentPage
})