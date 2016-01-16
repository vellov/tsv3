/**
 * Created by vellovaherpuu on 27/12/15.
 */
var app = window.angular.module("troubleshooting");

app.controller("statisticsViewController", ["$scope", "questions", function($scope, questions) {
    $scope.statistics = {};
    $scope.sortedData = {};
    var listToTree = new LTT(questions, {
            key_id: "_id",
            key_parent: "parentId",
            position: "position"
        }
    );
    $scope.questions = listToTree.GetTree();
    $scope.valuePairs = {
        views: "v",
        foundSolution: "s"
    };
}]);