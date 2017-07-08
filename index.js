var pizzapi = require('dominos');

pizzapi.Util.findNearbyStores(
    'Vancouver',
    'Delivery',
    function(storeData){
        console.log(storeData.result.Stores[0].StoreID);
        console.log(storeData);
        // var myStore = new pizzapi.Store();
        // console.log('mystore', myStore)
        // myStore.ID = storeData.result.Stores[0].StoreID;
        // console.log(myStore)
        // myStore.getMenu(
        //     function(storeData){
        //         console.log(storeData);
        //     }
        // );
    }
);

// var myStore = new pizzapi.Store({ID: 4336});
// console.log('myStore', myStore)
// // myStore.ID = 4336;
//
// myStore.getMenu(
//     function(storeData){
//         console.log(storeData.menuByCode['5063']);
//     }
// );