var mongoose = require('mongoose')

var Order = mongoose.model('Order', {
    slackId: String,
    orderObj: Object
})


module.exports = ({
    Order: Order,
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
