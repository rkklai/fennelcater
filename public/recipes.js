/* eslint no-alert: 0 */


app.controller('RecipesCtrl',  function($scope, $firebaseArray, AngularDB, $uibModal) {
  $scope.recipes = AngularDB.recipes();
  $scope.searchWarn = 0;
  $scope.addedIngredient = 0;
  $scope.deleteRecipe ="not yet";
  $scope.availableIngredients = AngularDB.ingredientsUniq();


  // add ingredient
  $scope.addIngredient = function(recipe) {
      $scope.inserted = {
        key: '',
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
    return AngularDB.saveRecipe(x);
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
