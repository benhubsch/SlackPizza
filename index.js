var pizzapi = require('dominos');

function findNearby(address) {
    var menuNearest = new Promise(function(resolve, reject) {
        pizzapi.Util.findNearbyStores(
            address, // this is super dang picky!
            'Delivery',
            function(storeData){
                console.log(storeData);
                var storeID = storeData.result.Stores[0];
                var myStore = new pizzapi.Store({ID: storeID}); // note: this could all be wrong
                myStore.ID = storeData.result.Stores[0].StoreID;
                myStore.getMenu(
                    function(storeData){
                        menuObj = getMenuObj(storeData);
                        resolve(menuObj)
                    }
                )
            }
        );

        var getMenuObj = function(storeData){
            var menuObj = {};
            for(var item in storeData.menuByCode){
                if(isNaN(parseInt(storeData.menuByCode[item].menuData.Code)) && storeData.menuByCode[item].menuData.ProductType){
                    menuObj[storeData.menuByCode[item].menuData.Name]=storeData.menuByCode[item].menuData;
                }
            }
            return menuObj
        }
    })
    return menuNearest
}


module.exports = {
    findNearby: findNearby
}
