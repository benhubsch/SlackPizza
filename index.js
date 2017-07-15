var pizzapi = require('dominos');
var findBestMatches = require('./findBestMatches').findBestMatches;
// var getMenuObj = require('./getMenuObj').findBestMatches;
// var request = require('./apiai').request;

var food = 'pasta';
var menuObj;

var address = '1412 Market St., San Francisco, CA';
var deliveryMethod = 'Delivery';


pizzapi.Util.findNearbyStores(
    address,
    deliveryMethod,
    function(storeData){
        var storeID = storeData.result.Stores[0];
        var myStore = new pizzapi.Store({ID: storeID});
        console.log('hihhihihihihihihihihihi', storeID.StoreID)
        myStore.ID = storeData.result.Stores[0].StoreID;
        myStore.getMenu(
            function(storeData){
                menuObj = getMenuObj(storeData);
                // console.log(menuObj);
                findBestMatches(food, menuObj);
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
