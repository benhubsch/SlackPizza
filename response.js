User = {};

var response = function(User){
  if(!User.address){
    var allResponses = ['What is your address?', 'Where do you want you pizza to get delivered to?'];
    var randomNumber = Math.floor(Math.random()*allResponses.length);
    return allResponses[randomNumber]
  }else if(!User.first || !User.last){
    var allResponses = ['Honey, what is your name?', 'Can you please tell us your full name?'];
    var randomNumber = Math.floor(Math.random()*allResponses.length);
    return allResponses[randomNumber]
  }else if(!User.email){
    var allResponses = ["What is your email address? Let's pizza and chill.", 'Give me your email address. I will order you pizza everyday.'];
    var randomNumber = Math.floor(Math.random()*allResponses.length);
    return allResponses[randomNumber]
  }else if(!User.order){
    var allResponses = ['What do you want to eat? I recommend Big Mac.', 'What would you like to order? Big Fat Greasy Pizza? Or Greeeeeeeen Salad?'];
    var randomNumber = Math.floor(Math.random()*allResponses.length);
    return allResponses[randomNumber]
  }
}

console.log(response(User));

module.exports = {
  'response': response
}
