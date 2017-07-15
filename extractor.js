var extractor = require('phone-number-extractor');

extractor.getCandidates(
    "My number is 215-350-1641",
    "US"
)

.then(function(res){
    console.log(res); // [ '0254123123' ]
})

.catch(function(err){
    throw err;
});
