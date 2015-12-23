app.controller("questionViewController", ["$scope","projectService", "userService", "questions", function($scope, projectService, userService, questions) {

    $scope.questions = questions;
    $scope.breadCrumbs = [];
    $scope.setItemActive = function(item){
        var idx = $scope.breadCrumbs.indexOf(item);
        if(idx > -1){
            var newArr = [];
            for(var i = 0; i<idx;i++){
                newArr.push($scope.breadCrumbs[i]);
            }
            $scope.breadCrumbs = newArr;
            $scope.view = item;
        } else {
            $scope.breadCrumbs.push($scope.view);
            $scope.view = item;
        }
    };

    $scope.activateNextChild = function(){
        $scope.setItemActive($scope.currentViewChilds[0]);
    };

    $scope.activatePreviousItem = function(){
        $scope.view = $scope.breadCrumbs.pop();
    };

    $scope.init = function(){
        $scope.view = {parentId: ""};
        for(var i in questions){
           if(questions[i].parentId == ""){
               $scope.view = questions[i];
               break;
           }
        }
    };
    $scope.$watch(
        function(){
            return $scope.view.parentId;
        },
        function(){
            $scope.currentViewChilds = $scope.questions.filter(function(question){
                return  question.parentId == $scope.view._id;
            });

    });

    $scope.init();


}]);