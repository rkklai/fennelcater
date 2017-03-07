app.controller("HomeCtrl", ["$scope", "Auth", "AngularDB", "fileReader",
function($scope, Auth, AngularDB, fileReader) {
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

  $scope.upload = function (file) {
    if ( file )
    {
      fileReader.readAsText(file, $scope)
      .then(function(result) {
        $scope.DB.recoverDatabase(result);
      });
    }
  }
}
]);
