/* eslint no-alert: 0 */


app.controller('IngredientsCtrl',  function($scope, $firebaseArray, AngularDB) {
  // create a synchronized array
  // click on `index.html` above to see it used in the DOM!
 // $scope.ingredients = $firebaseArray(ref);
  $scope.ingredients = AngularDB.ingredients();
  $scope.searchWarn = 0;
  $scope.addedIngredient = 0;
  $scope.deleteIngredient ="not yet";

  $scope.remove = function(x) {
    AngularDB.remove(x);
  }

  $scope.addIngredient = function() {
    var lowerName = $scope.iname.toLowerCase();
    var lowerUnit = $scope.ingredientUnit.toLowerCase();
    var lowerStore = $scope.ingredientStore.toLowerCase();
 
    // reset values
    $scope.searchWarn = 0;
    $scope.addedIngredient = 0;
    $scope.addedIngredientName = "";
    $scope.duplicateIngredientName = "";


    var found = $scope.ingredients.find( x => x.name.toLowerCase() == lowerName  
              && x.quantity == $scope.ingredientQuantity 
              && x.unit.toLowerCase() == lowerUnit 
              && x.store.toLowerCase() == lowerStore 
	);
    if ( found ) {
       $scope.search = $scope.iname;
       $scope.duplicateIngredientName = $scope.iname + " ($" + $scope.ingredientPrice + "/" + $scope.ingredientUnit + "@" + $scope.ingredientStore + ")";
       $scope.searchWarn = 1;
    } else {
      if ( ! $scope.ingredientStore ) {
	 $scope.ingredientStore = "";
      }

      AngularDB.add({
	      	name: $scope.iname,
      		quantity: $scope.ingredientQuantity,
      		unit: $scope.ingredientUnit,
                store: $scope.ingredientStore,
      		price: $scope.ingredientPrice
     	}).then(function() {
      		$scope.addedIngredientName = $scope.iname + " ($" + $scope.ingredientPrice + "/" + $scope.ingredientUnit + "@" + $scope.ingredientStore + ")";
                $scope.addedIngredient = 1;
	      	$scope.iname = "";
       		$scope.ingredientQuantity = "";
       		$scope.ingredientUnit = "";
                $scope.ingredientStore = "";
      		$scope.ingredientPrice = "";
     	});
    }
  };

  $scope.save = function(x) {
	return AngularDB.save(x);
  }

  $scope.myOrderBy = "name";
  var nameCount = 0;
  var unitCount = 0;
  var priceCount = 0;
  var storeCount = 0;

  $scope.reverse = 0;

  $scope.orderByMe = function(x) {
    if ( x == 'name' ) {
      nameCount = ( nameCount + 1 ) % 2 ;
      $scope.reverse = nameCount;
    } else if ( x == 'unit' ) {
      unitCount = ( unitCount + 1 ) % 2;
      $scope.reverse = unitCount;
    } else if ( x == 'store' ) {
      storeCount = ( storeCount + 1 ) % 2;
      $scope.reverse = storeCount;
    } else if ( x == 'price' ) {
      priceCount = ( priceCount + 1 ) % 2;
      $scope.reverse = priceCount;
    }

    $scope.myOrderBy = x;
  }  
  
  $scope.setDeleteIngredient = function(d) {
    // reset values
    $scope.searchWarn = 0;
    $scope.addedIngredient = 0;

    $scope.deleteIngredient = d;
  }

  $scope.clearSearch = function() {
    $scope.search = "";
    $scope.searchWarn = 0;
    $scope.addedIngredient = 0;
  }
});


