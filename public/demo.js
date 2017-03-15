/* eslint no-alert: 0 */

'use strict';


var app = angular.module('FennelCaterApp', [
  'ui.router',
  'ui.bootstrap',
  'firebase',
  'ngFileUpload',
  "xeditable"
]);

// let's create a re-usable factory that generates the $firebaseAuth instance
app.factory("Auth", ["$firebaseAuth",
function($firebaseAuth) {
  return $firebaseAuth();
}
]);


var fileReader = function ($q, $log) {

  var onLoad = function(reader, deferred, scope) {
    return function () {
      scope.$apply(function () {
        deferred.resolve(reader.result);
      });
    };
  };

  var onError = function (reader, deferred, scope) {
    return function () {
      scope.$apply(function () {
        deferred.reject(reader.result);
      });
    };
  };

  var onProgress = function(reader, scope) {
    return function (event) {
      scope.$broadcast("fileProgress",
      {
        total: event.total,
        loaded: event.loaded
      });
    };
  };

  var getReader = function(deferred, scope) {
    var reader = new FileReader();
    reader.onload = onLoad(reader, deferred, scope);
    reader.onerror = onError(reader, deferred, scope);
    reader.onprogress = onProgress(reader, scope);
    return reader;
  };

  var readAsText = function (file, scope) {
    var deferred = $q.defer();

    var reader = getReader(deferred, scope);
    reader.readAsText(file);

    return deferred.promise;
  };

  return {
    readAsText: readAsText
  };
};

app.factory("fileReader",
["$q", "$log", fileReader]);

app.run(function(editableOptions) {
  editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
});

app.run(["$rootScope", "$state", function($rootScope, $state) {
  $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
    // We can catch the error thrown when the $requireSignIn promise is rejected
    // and redirect the user back to the home page
    if (error === "AUTH_REQUIRED") {
      $state.go("home");
    }
  });

  $rootScope.$on('$stateNotFound',
    function(event, unfoundState, fromState, fromParams){
      $state.go("home");
  });
}]);

app.config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise("/home");

  $stateProvider
    .state("home", {
      // the rest is the same for ui-router and ngRoute...
      controller: "HomeCtrl",
      url: "/home",
      templateUrl: "home.html",
      resolve: {
        // controller will not be loaded until $waitForSignIn resolves
        // Auth refers to our $firebaseAuth wrapper in the factory below
        "currentAuth": ["Auth", function(Auth) {
          // $waitForSignIn returns a promise so the resolve waits for it to complete
          return Auth.$waitForSignIn();
        }]
      }
    })
    .state("ingredients", {
      // the rest is the same for ui-router and ngRoute...
      controller: "IngredientsCtrl",
      url: "/ingredients",
      templateUrl: "ingredients.html",
      resolve: {
        // controller will not be loaded until $requireSignIn resolves
        // Auth refers to our $firebaseAuth wrapper in the factory below
        "currentAuth": ["Auth", function(Auth) {
          // $requireSignIn returns a promise so the resolve waits for it to complete
          // If the promise is rejected, it will throw a $stateChangeError (see above)
          return Auth.$requireSignIn();
        }]
      }
    })
    .state("recipes", {
      // the rest is the same for ui-router and ngRoute...
      controller: "RecipesCtrl",
      url: "/recipes",
      templateUrl: "recipes.html",
      resolve: {
        // controller will not be loaded until $requireSignIn resolves
        // Auth refers to our $firebaseAuth wrapper in the factory below
        "currentAuth": ["Auth", function(Auth) {
          // $requireSignIn returns a promise so the resolve waits for it to complete
          // If the promise is rejected, it will throw a $stateChangeError (see above)
          return Auth.$requireSignIn();
        }]
      }
    });
}]);

app.service("AngularDB", function($firebaseArray, $firebaseObject, $firebaseStorage, $filter) {
  // ingredients
  var ingredientRef = firebase.database().ref().child("ingredients");
  var ingredientsDB = $firebaseArray(ingredientRef);

  // recipes
  var recipesRef = firebase.database().ref().child("recipes");
  var recipesDB = $firebaseArray(recipesRef);

  // backups
  var storageRef = "";
  var lastRef = firebase.database().ref('lastModified');
  var lastModifiedDB = $firebaseObject(lastRef);
  var backupRef = firebase.database().ref().child("backups");
  var backupDB = $firebaseArray(backupRef);
  var authenticated = 1;

  this.authenticate = function(login) {
    if ( authenticated ^ login )
    {
      ingredientsDB = $firebaseArray(ingredientRef);
      recipesDB = $firebaseArray(recipesRef);
      lastModifiedDB = $firebaseObject(lastRef);
      backupDB = $firebaseArray(backupRef);

      authenticated = login;
      return 1;
    }
    else
    {
      return 0;
    }
  }

  // ingredients
  this.getIngredient = function(key) {
    return ingredientsDB.$getRecord(key);
  }

  this.remove = function(x) {
    return ingredientsDB.$remove(x);
  }

  this.add = function(x) {
    return ingredientsDB.$add(x);
  }

  this.save = function(x) {
    return ingredientsDB.$save(x);
  }

  this.ingredients = function() {
    return ingredientsDB;
  }

  this.ingredientsUniq = function() {
    var ingredientsArray = [];
    var i = 0;
    var j = 0;

    for (i = 0; i < ingredientsDB.length; i++) {
      var found = 0;
      for (j = 0; j < ingredientsArray.length; j++) {
        if ( ingredientsDB[i].name == ingredientsArray[j].name &&
                ingredientsDB[i].unit == ingredientsArray[j].unit) {
            found = 1;
            break;
        }
      }

      if ( ! found ) {
        ingredientsArray.push({key: ingredientsDB[i].$id,
                          name: ingredientsDB[i].name,
                          unit: ingredientsDB[i].unit})
      }
    }

    ingredientsArray.sort();

    return ingredientsArray;
  }

  // recipes
  this.removeRecipe = function(x) {
    return recipesDB.$remove(x);
  }

  this.addRecipe = function(x) {
    return recipesDB.$add(x);
  }

  this.saveRecipe = function(x) {
    return recipesDB.$save(x);
  }

  this.recipes = function() {
    return recipesDB;
  }


  // backups
  this.lastModified = function() {
    return lastModifiedDB;
  }

  this.backups = function() {
    return backupDB;
  }

  this.recoverDatabase = function(backupString) {
    var backupJson = angular.fromJson(backupString);
    return firebase.database().ref().set(backupJson);
  }

  this.backupDatabase = function() {
    var backupNow = new Date();
    var now = backupNow.getTime();
    var time = $filter('date')( backupNow, 'yyyy-MM-dd HH:mm:ss');
    var storageRef = firebase.storage().ref("backups/" + time + ".json" );
    var storage = $firebaseStorage(storageRef);

    return firebase.database().ref().once('value')
    .then(function(dataSnapshot) {
      var jsonBlob = JSON.stringify(dataSnapshot.val());
      var htmlFile = new Blob([jsonBlob], { type : "application/json" });
      var uploadTask = storage.$put(htmlFile, { contentType: "application/json" });
      uploadTask.$complete(function(snapshot) {
        firebase.database().ref('lastModified').set({time: now, url: snapshot.downloadURL});
        backupDB.$add({time: now, url: snapshot.downloadURL})
        .then(function(ref) {
          if ( backupDB.length > 10 ) {
            var oldest = backupDB[0];
            var i = 0;
            for (i = 0; i < backupDB.length; i++) {
              var current = backupDB[i];
              if ( current.time < oldest.time ) {
                oldest = current;
              }
            }
            backupDB.$remove(oldest);
            //backupDB.$remove(0);
          }
        });
      });


      return time;
    });
  }

});

app.controller('CollapseDemoCtrl', function ($scope) {
  $scope.isNavCollapsed = true;
  $scope.isCollapsed = false;
  $scope.isCollapsedHorizontal = false;
});
