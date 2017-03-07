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
  'mobile-angular-ui.gestures',
  'ngFileUpload'
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

app.service("AngularDB", function($firebaseArray, $firebaseObject, $firebaseStorage, $filter) {
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
