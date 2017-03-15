/* eslint no-alert: 0 */


app.controller('RecipesCtrl',  function($scope, $firebaseArray, AngularDB, $uibModal) {
  $scope.recipes = AngularDB.recipes();
  $scope.availableIngredients = AngularDB.ingredients();
  $scope.searchWarn = 0;
  $scope.addedIngredient = 0;
  $scope.deleteRecipe ="not yet";

  // add ingredient
  $scope.addIngredient = function(recipe) {
      $scope.inserted = {
        key: '',
        quanity: null,
      };

      if ( ! recipe.ingredients )
      {
        recipe.ingredients = [];
      }

      recipe.ingredients.push($scope.inserted);
  };

  // remove ingredient
  $scope.removeIngredient = function(recipe, index) {
    recipe.ingredients.splice(index, 1);
  };


  $scope.removeRecipe = function(x) {
    AngularDB.removeRecipe(x);
  }

  $scope.addRecipe = function(recipe) {
    // var lowerName = $scope.iname.toLowerCase();
    // var lowerUnit = $scope.ingredientUnit.toLowerCase();
    // var lowerStore = $scope.ingredientStore.toLowerCase();
    //
    // // reset values
    // $scope.searchWarn = 0;
    // $scope.addedIngredient = 0;
    // $scope.addedIngredientName = "";
    // $scope.duplicateIngredientName = "";
    //
    //
    // var found = $scope.ingredients.find( x => x.name.toLowerCase() == lowerName
    //               && x.quantity == $scope.ingredientQuantity
    //               && x.unit.toLowerCase() == lowerUnit
    //               && x.store.toLowerCase() == lowerStore );
    //
    // if ( found ) {
    //   $scope.search = $scope.iname;
    //   $scope.duplicateIngredientName = $scope.iname + " ($" + $scope.ingredientPrice + "/" + $scope.ingredientUnit + "@" + $scope.ingredientStore + ")";
    //   $scope.searchWarn = 1;
    // } else {
    //   if ( ! $scope.ingredientStore ) {
    //     $scope.ingredientStore = "";
    //   }

      AngularDB.addRecipe(recipe).then(function() {
        // $scope.addedIngredientName = $scope.iname + " ($" + $scope.ingredientPrice + "/" + $scope.ingredientUnit + "@" + $scope.ingredientStore + ")";
        // $scope.addedIngredient = 1;
        // $scope.iname = "";
        // $scope.ingredientQuantity = "";
        // $scope.ingredientUnit = "";
        // $scope.ingredientStore = "";
        // $scope.ingredientPrice = "";
      });
    // }
  };

  $scope.saveRecipe = function(x) {
    return AngularDB.saveRecipe(x);
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

  $scope.clearSearch = function() {
    $scope.search = "";
    $scope.searchWarn = 0;
    $scope.addedIngredient = 0;
  }

  $scope.dismissDelete = function(recipe) {
    if ( recipe )
    {
      $scope.removeRecipe(recipe);
      $scope.modalInstance.dismiss("delete");
    }
    else {
      $scope.modalInstance.dismiss("cancel");
    }
  }

  $scope.open = function (recipe) {
    $scope.deleteRecipe = recipe;
    $scope.modalInstance = $uibModal.open({
      // animation: $ctrl.animationsEnabled,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'deleteRecipe.html',
      //    controller: 'ModalInstanceCtrl',
      //    controllerAs: '$ctrl',
      scope: $scope
    });
  };

  $scope.dismissNewRecipe = function(recipe) {
    if ( recipe )
    {
      $scope.addRecipe(recipe);
      $scope.modalInstance.dismiss("added recipe");
    }
    else {
      $scope.modalInstance.dismiss("cancel");
    }

    $scope.createNewRecipe = 0;
  };

  $scope.openNewRecipe = function () {
    $scope.recipe = {
            name: '',
            ingredients: [],
            otherIngredients: '',
            instruction: ''
          };
    $scope.createNewRecipe = 1;

    $scope.modalInstance = $uibModal.open({
      // animation: $ctrl.animationsEnabled,
      ariaLabelledBy: 'modal-title-new-recipe',
      ariaDescribedBy: 'modal-body-new-recipe',
      templateUrl: 'newRecipe.html',
      //    controller: 'ModalInstanceCtrl',
      //    controllerAs: '$ctrl',
      scope: $scope
    });
  };

  $scope.showIngredient = function(key) {
    var ingredient = AngularDB.getIngredient(key);
    if ( ingredient )
    {
      return ingredient.name + " (" + ingredient.unit + ")";
    }
    else
    {
      return null;
    }
  }
});
