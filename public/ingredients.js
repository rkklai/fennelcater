/* eslint no-alert: 0 */


app.controller('IngredientsCtrl',  function($scope, $firebaseArray, AngularDB) {
//  var ref = firebase.database().ref().child("ingredients");

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
  // reset values
  $scope.searchWarn = 0;
  $scope.addedIngredient = 0;


    var found = $scope.ingredients.find( x => x.name.toLowerCase() == lowerName  && x.unit.toLowerCase() == lowerUnit );
    if ( found ) {
       $scope.search = $scope.iname;
       $scope.searchWarn = 1;
    } else {
      AngularDB.add({
	      	name: $scope.iname,
      		unit: $scope.ingredientUnit,
      		price: $scope.ingredientPrice
     	}).then(function() {
      		$scope.addedIngredientName = $scope.iname;
	      	$scope.iname = "";
       		$scope.ingredientUnit = "";
      		$scope.ingredientPrice = "";
       		$scope.addedIngredient = 1;
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
  $scope.reverse = 0;

  $scope.orderByMe = function(x) {
    if ( x == 'name' ) {
      nameCount = ( nameCount + 1 ) % 2 ;
      $scope.reverse = nameCount;
    } else if ( x == 'unit' ) {
      unitCount = ( unitCount + 1 ) % 2;
      $scope.reverse = unitCount;
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


