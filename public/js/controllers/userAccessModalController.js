var app = window.angular.module("troubleshooting");

app.controller("UserAccessModalController", ["$scope", "projectId", "utils", "userService", "blockerService", "userAccesses", function($scope, projectId, utils, userService, blockerService, userAccesses) {
    $scope.utils = utils;
    $scope.userAccesses = userAccesses;
    $scope.data= {};
    $scope.invite = function(){
        blockerService.saveBlocker("inviteUserModal");
        userService.addAccess(projectId, $scope.data.text).then(function(data){
            blockerService.deleteBlocker("inviteUserModal");
            $scope.$dismiss();
        })
    }
}]);