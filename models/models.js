var mongoose = require('mongoose')

var Order = mongoose.model('Order', {
    slackId: String,
    orderObj: Object
})


module.exports = ({
    Order: Order
})