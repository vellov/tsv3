/**
 * Created by vellovaherpuu on 27/12/15.
 */
var app = window.angular.module("troubleshooting");

app.controller("statisticsViewController", ["$scope", "questions", "statisticsService", function($scope, questions, statisticsService) {
    $scope.statistics = {};
    $scope.sortedData = {};
    $scope.labels = ["Edasi mindud", "Tagasi mindud", "Vaadatud"];

    //DOUGHNOT CHART OPTS
    /*$scope.chartOptions= {
     legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><span style=\"background-color:<%=segments[i].fillColor%>\"></span><%if(segments[i].label){%><%=segments[i].label%>: <%=segments[i].value%><%}%></li><%}%></ul>"
     };*/

    var listToTree = new LTT(questions, {
            key_id: "_id",
            key_parent: "parentId",
            position: "position"
        }
    );
    $scope.sortedData = listToTree.GetTree();

    function findQuestionsByParentId(parentId) {
        var result = [];
        if (!parentId) parentId = "";
        for (var i in questions) {
            if (questions[i].parentId == parentId) {
                result.push(questions[i]);
            }
        }
        return result;
    }

    function assignData(data){
        $scope.data = [[data.forward, data.back, data.views]];
    }
    var rootQuestion = findQuestionsByParentId()[0];
    $scope.statistics.activeQuestionId = rootQuestion._id;
    statisticsService.getQuestionStatistics(rootQuestion._id).then(function (d) {
        $scope.statistics.activeQuestionId = d.data._id;
        assignData(d.data)
    });

    $scope.switchView = function (questionId) {
        $scope.statistics.activeQuestionId = questionId;
        statisticsService.getQuestionStatistics(questionId).then(function (d) {
            assignData(d.data);
        });
    };

}]);