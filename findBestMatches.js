var stringSimilarity = require('string-similarity');
var sortBy = require('sort-array')

var findBestMatches = function(foodName, menuObj){


    var allTypes = ['pizza', 'wings', 'sandwich', 'salad', 'pasta', 'bread'];
    var foodType = '';

    var menuNameArr = [];

    for(var item in menuObj){
        menuNameArr.push(menuObj[item].Name);
    }


    var allGuesses = [];
    var bestGuesses = [];

    var isInType = false;

    var foodComponent = foodName.split(' ');


    var subMenuNameArr = [];
    var subMenuObj = {};

    for(var i = 0; i < foodComponent.length; i++){
        for(var j = 0; j < allTypes.length; j++){
            if(allTypes[j].toLocaleLowerCase() === foodComponent[i].toLocaleLowerCase()){
                isInType = true;
                for(var item in menuObj){
                    if(menuObj[item].ProductType.toLocaleLowerCase() === allTypes[j].toLocaleLowerCase()){
                        subMenuObj[item] = menuObj[item];
                        subMenuNameArr.push(item);
                    }else if(menuObj[item].ProductType.toLocaleLowerCase() === 'gsalad' && allTypes[j].toLocaleLowerCase() === 'salad'){
                        subMenuObj[item] = menuObj[item];
                        subMenuNameArr.push(item);
                    }
                }
            }
        }
    }


    if(isInType){
        var matches = stringSimilarity.findBestMatch(foodName, subMenuNameArr);
        allGuesses = matches.ratings;
        sortBy(allGuesses, 'rating')
        bestGuesses = allGuesses.slice(allGuesses.length-4);

        var bestGuessesArr = [];

        for(var i = 0; i < bestGuesses.length; i++){
            bestGuessesArr.push(menuObj[bestGuesses[i].target]);
        }


        bestGuessesArr = bestGuessesArr.reverse();
        return bestGuessesArr;

    }else{
        var matches = stringSimilarity.findBestMatch(foodName, MenuNameArr);
        allGuesses = matches.ratings;
        sortBy(allGuesses, 'rating')
        bestGuesses = allGuesses.slice(allGuesses.length-5);

        var bestGuessesArr = [];

        for(var i = 0; i < bestGuesses.length; i++){
            bestGuessesArr.push(menuObj[bestGuesses[i].target]);
        }

        bestGuessesArr = bestGuessesArr.reverse();
        return bestGuessesArr;
    }
}

module.exports = {
    'findBestMatches': findBestMatches
}
