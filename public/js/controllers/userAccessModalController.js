var app = window.angular.module("troubleshooting");

app.controller("UserAccessModalController", ["$scope", "projectId", "utils", "userService", "blockerService", "userAccesses", function($scope, projectId, utils, userService, blockerService, userAccesses) {
    $scope.utils = utils;
    $scope.userAccesses = userAccesses;
    $scope.data = { };
    $scope.invite = function() {
        blockerService.saveBlocker("inviteUserModal");
        userService.addAccess(projectId, $scope.data.text).then(function(d){
            blockerService.deleteBlocker("inviteUserModal");
            $scope.$dismiss();
        }, function(err){
            $scope.data = { };
            utils.alert(err.data.description, "Error");
        })
    };

    $scope.delete = function(ua) {
        utils.confirm("Kasutaja eemaldamine", "Oled kindel, et soovid kasutaja eemaldada?", function(){
            userService.deleteAccess(ua._id).then(function(d){
                $scope.userAccesses.splice(ua, 1);
            })
        }, null, "Eemalda", "Tühista" );
    };
}]);