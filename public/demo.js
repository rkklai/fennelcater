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
  var backupRef = firebase.database().ref().child("backups");
  var backupDB = $firebaseArray(backupRef);    
  var authenticated = 1;  

  this.authenticate = function(login) {
     if ( authenticated ^ login )
     {
        ingredientsDB = $firebaseArray(ref);
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

  this.backups = function() {
    return backupDB;
  }

  this.backupDatabase = function() {
    var backupNow = new Date();
    var now = backupNow.getTime();
    var time = backupNow.toString();
    var storageRef = firebase.storage().ref("backups/" + time + ".json" );
    var storage = $firebaseStorage(storageRef);

    return firebase.database().ref().once('value')
  		.then(function(dataSnapshot) {
		    var jsonBlob = JSON.stringify(dataSnapshot.val());
	            var htmlFile = new Blob([jsonBlob], { type : "text/json" });
    		    var uploadTask = storage.$put(htmlFile, { contentType: "text/json" });
		    uploadTask.$complete(function(snapshot) {
			   firebase.database().ref('lastModified').set({time: now, url: snapshot.downloadURL});
		    	   backupDB.$add({time: now, url: snapshot.downloadURL});
		    });


	            return time;
	       });
  }

});

app.controller("HomeCtrl", ["$scope", "Auth", "AngularDB",
  function($scope, Auth, AngularDB) {
    $scope.auth = Auth;
    $scope.DB = AngularDB;
    $scope.savedBackup = "";
    // any time auth state changes, add the user data to scope
    $scope.auth.$onAuthStateChanged(function(firebaseUser) {
      $scope.firebaseUser = firebaseUser;

      var changed = 0;

      if ( firebaseUser ) 
      { 
        changed = $scope.DB.authenticate(1);
      } else {
        changed = $scope.DB.authenticate(0);
      }

      if (changed) 
      {
        $scope.lastModified = $scope.DB.lastModified();
        $scope.backups = $scope.DB.backups();
//        $scope.$apply();
      }
    });

    $scope.lastModified = AngularDB.lastModified();
    $scope.backups = AngularDB.backups();
     
    $scope.backupDatabase = function() {
      AngularDB.backupDatabase().then(function(time) {
	  $scope.savedBackup = time;
//          $scope.$apply();
       });
    }    
  }
]);

