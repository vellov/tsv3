/**
 * Created by vellovaherpuu on 27/12/15.
 */
var app = window.angular.module("troubleshooting");

app.controller("statisticsViewController", ["$scope", "questions", function($scope, questions){
    $scope.statistics = { };
    $scope.sortedData = { };
    $scope.labels = ["Edasi mindud", "Tagasi mindud", "Vaadatud"]
    $scope.chartOptions= {
        legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><span style=\"background-color:<%=segments[i].fillColor%>\"></span><%if(segments[i].label){%><%=segments[i].label%>: <%=segments[i].value%><%}%></li><%}%></ul>"
    };
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

    $scope.statistics.activeData = findQuestionsByParentId()[0];


    $scope.switchView = function(data){
        $scope.statistics.activeData = data;
    };

    $scope.$watch("statistics.activeData", function(n){
        var forward = n.forward ? n.forward : 0;
        var back = n.back ? n.back : 0;
        var views = n.views ? n.views : 0;

        $scope.data = [forward, back, views];
    });
}]);