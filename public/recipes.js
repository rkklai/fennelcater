/* eslint no-alert: 0 */


app.controller('RecipesCtrl',  function($scope, $firebaseArray, AngularDB, $uibModal, $filter) {
  $scope.recipes = AngularDB.recipes();
  $scope.search = "";
  $scope.order = 'name';
  $scope.nameReverse = false;
  $scope.categoryReverse = false;
  $scope.reverse = false;
  $scope.deleteRecipe ="not yet";
  $scope.lastSavedRecipe = { recipe: null, timestamp: null };

  $scope.recipePrices = "Not calculated yet";

  $scope.availableIngredients = AngularDB.ingredientsUniq();


  // add ingredient
  $scope.addIngredient = function(recipe) {
      $scope.inserted = {
        key: null,
        quanity: null
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
      AngularDB.addRecipe(recipe).then(function() {

      });
  };

  $scope.saveRecipe = function(x) {
    $scope.lastSavedRecipe.recipe = x;
    $scope.lastSavedRecipe.timestamp = new Date().getTime();
    return AngularDB.saveRecipe(x);
  }

  $scope.showPrices = function(recipe) {
    var prices = AngularDB.getRecipePrices(recipe.ingredients);
    return '$' + $filter('number')(prices.c.price, 2) + ' - $' + $filter('number')(prices.e.price, 2);
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

  $scope.openDeleteRecipe = function (recipe) {
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
            name: null,
            person: null,
            category: null,
            ingredients: [],
            otherIngredients: null,
            instruction: null
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

  $scope.showIngredient = function(ing) {
    if ( ing.name && ing.unit )
    {
      return ing.name + " (" + ing.unit + ")";
    }

    var ingredient = AngularDB.getIngredient(ing.key);
    if ( ingredient )
    {
      ing.name = ingredient.name;
      ing.unit = ingredient.unit;
      return ingredient.name + " (" + ingredient.unit + ")";
    }
    else
    {
      return null;
    }
  }

  $scope.required = function( data ) {
    if ( ! data )
    {
      return "Required field";
    }
    else
    {
      return null;
    }
  }
});
