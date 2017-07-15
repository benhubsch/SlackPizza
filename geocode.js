

var googleMapsClient = require('@google/maps').createClient({
    key: process.env.GOOGLE_API_KEY
});

// var globalAddress = '1080 folsome st san francisco';

function validateAddress(address) {
    var getFormatted = new Promise(function(resolve, reject) {
        googleMapsClient.geocode({
                address: address
            }, function(err, response) {
                if (err) {
                    reject(new Error('Address is bogus'));
                } else {
                    resolve(response.json.results[0].formatted_address);
                }
        })
    })
    return getFormatted
}


// validateAddress('1080 folsome st san francisco').then(function(result) {
//     console.log(result);
// })

module.exports = {
    validateAddress: validateAddress
}


