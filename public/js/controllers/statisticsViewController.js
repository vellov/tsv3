/**
 * Created by vellovaherpuu on 27/12/15.
 */
var app = window.angular.module("troubleshooting");

app.controller("statisticsViewController", ["$scope", "questions", function($scope, questions){
    $scope.statistics = { };
    $scope.sortedData = { };
    var listToTree = new LTT(questions, {
            key_id: "_id",
            key_parent: "parentId",
            position: "position"
        }
    );
    $scope.sortedData = listToTree.GetTree();

    /* TODO create & move to utils */
    function findQuestionById(questionId){
        for(var i in questions){
            if(questions[i]._id == questionId){
                return questions[i];
            }
        }
    }

    function findQuestionsByParentId(parentId){
        var result = [];
        if(!parentId) parentId = "";
        for (var i in questions){
            if(questions[i].parentId == parentId){
                result.push(questions[i]);
            }
        }
        return result;
    }

    $scope.statistics.data = findQuestionsByParentId()[0].statistics;

}]);