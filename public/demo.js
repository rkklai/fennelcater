/* eslint no-alert: 0 */

'use strict';

//
// Here is how to define your module
// has dependent on mobile-angular-ui
//
var app = angular.module('MobileAngularUiExamples', [
  'ngRoute',
  'mobile-angular-ui',
  'firebase',
  // touch/drag feature: this is from 'mobile-angular-ui.gestures.js'.
  // This is intended to provide a flexible, integrated and and
  // easy to use alternative to other 3rd party libs like hammer.js, with the
  // final pourpose to integrate gestures into default ui interactions like
  // opening sidebars, turning switches on/off ..
  'mobile-angular-ui.gestures'
]);

// let's create a re-usable factory that generates the $firebaseAuth instance
app.factory("Auth", ["$firebaseAuth",
  function($firebaseAuth) {
    return $firebaseAuth();
  }
]);

app.run(function($transform, $rootScope, $location) {
  window.$transform = $transform;
  $rootScope.$on("$routeChangeError", function(event, next, previous, error) {
    // We can catch the error thrown when the $requireSignIn promise is rejected
    // and redirect the user back to the home page
    if (error === "AUTH_REQUIRED") {
      $location.path("/");
    }
  });
});

//
// You can configure ngRoute as always, but to take advantage of SharedState location
// feature (i.e. close sidebar on backbutton) you should setup 'reloadOnSearch: false'
// in order to avoid unwanted routing.
//
app.config(function($routeProvider) {
  $routeProvider.when('/', {
	templateUrl: 'home.html', 
	controller: 'HomeCtrl',
	reloadOnSearch: false,
   resolve: {
      // controller will not be loaded until $waitForSignIn resolves
      // Auth refers to our $firebaseAuth wrapper in the factory below
      "currentAuth": ["Auth", function(Auth) {
        // $waitForSignIn returns a promise so the resolve waits for it to complete
        return Auth.$waitForSignIn();
      }]
    }
  });
  $routeProvider.when('/ingredients', {templateUrl: 'ingredients.html', reloadOnSearch: false,
resolve: {
      // controller will not be loaded until $requireSignIn resolves
      // Auth refers to our $firebaseAuth wrapper in the factory below
      "currentAuth": ["Auth", function(Auth) {
        // $requireSignIn returns a promise so the resolve waits for it to complete
        // If the promise is rejected, it will throw a $routeChangeError (see above)
        return Auth.$requireSignIn();
      }]
    }

});
//  $routeProvider.when('/scroll', {templateUrl: 'scroll.html', reloadOnSearch: false});
//  $routeProvider.when('/toggle', {templateUrl: 'toggle.html', reloadOnSearch: false});
//  $routeProvider.when('/tabs', {templateUrl: 'tabs.html', reloadOnSearch: false});
  $routeProvider.when('/accordion', {templateUrl: 'accordion.html', reloadOnSearch: false,
resolve: {
      // controller will not be loaded until $requireSignIn resolves
      // Auth refers to our $firebaseAuth wrapper in the factory below
      "currentAuth": ["Auth", function(Auth) {
        // $requireSignIn returns a promise so the resolve waits for it to complete
        // If the promise is rejected, it will throw a $routeChangeError (see above)
        return Auth.$requireSignIn();
      }]
    }
});
//  $routeProvider.when('/overlay', {templateUrl: 'overlay.html', reloadOnSearch: false});
//  $routeProvider.when('/forms', {templateUrl: 'forms.html', reloadOnSearch: false});
//  $routeProvider.when('/dropdown', {templateUrl: 'dropdown.html', reloadOnSearch: false});
//  $routeProvider.when('/touch', {templateUrl: 'touch.html', reloadOnSearch: false});
//  $routeProvider.when('/swipe', {templateUrl: 'swipe.html', reloadOnSearch: false});
//  $routeProvider.when('/drag', {templateUrl: 'drag.html', reloadOnSearch: false});
//  $routeProvider.when('/drag2', {templateUrl: 'drag2.html', reloadOnSearch: false});
});

app.service("AngularDB", function($firebaseArray, $firebaseObject, $firebaseStorage) {
  var ref = firebase.database().ref().child("ingredients");
  var ingredientsDB = $firebaseArray(ref);    
  var storageRef = "";
  var lastRef = firebase.database().ref('lastModified');
  var lastModifiedDB = $firebaseObject(lastRef);

  this.init = function(user) {
      ingredientsDB = $firebaseArray(ref);    
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

  this.lastModified = function() {
    return lastModifiedDB;
  }

  this.backupDatabase = function() {
    var time = new Date().toString();
    var storageRef = firebase.storage().ref("backups/" + time + ".json" );
    var storage = $firebaseStorage(storageRef);

    return firebase.database().ref().once('value')
  		.then(function(dataSnapshot) {
		    var jsonBlob = JSON.stringify(dataSnapshot.val());
	            var htmlFile = new Blob([jsonBlob], { type : "text/json" });
    		    var uploadTask = storage.$put(htmlFile, { contentType: "text/json" });
		    uploadTask.$complete(function(snapshot) {
			   firebase.database().ref('lastModified').set({time: new Date().getTime(), url: snapshot.downloadURL});
		    });

	            return time;
	       });
  }

});

app.controller("HomeCtrl", ["$scope", "Auth", "AngularDB",
  function($scope, Auth, AngularDB) {
    $scope.auth = Auth;
    $scope.savedBackup = "";
    $scope.backupUrl = "";

    // any time auth state changes, add the user data to scope
    $scope.auth.$onAuthStateChanged(function(firebaseUser) {
      $scope.firebaseUser = firebaseUser;
//      AngularDB.init(firebaseUser);
    });

    $scope.lastModified = AngularDB.lastModified();
     
    $scope.backupDatabase = function() {
      AngularDB.backupDatabase().then(function(time) {
	  $scope.savedBackup = time;
          $scope.$apply();
       });
    }    
  }
]);

