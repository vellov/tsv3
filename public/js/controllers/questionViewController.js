var app = window.angular.module("troubleshooting");

app.controller("questionViewController", ["$scope","projectService", "userService", "questions", "$stateParams", "statisticsService", "$sce", "$state", "utils", function($scope, projectService, userService, questions, $stateParams, statisticsService, $sce, $state, utils) {

    $scope.viewData = { };

    function setBackOrForward(questionId){
        var currentQuestion = utils.findQuestionById(questions, questionId);
        if(statisticsService.getLastViewData().questionId){
            var oldQuestion = utils.findQuestionById(questions, statisticsService.getLastViewData().questionId);

            if(currentQuestion.parentId == oldQuestion._id){
                setClassLeft();
                statisticsService.addForward(oldQuestion._id);
            }
            else if(currentQuestion._id == oldQuestion.parentId){
                statisticsService.addBack(oldQuestion._id);
                setClassRight();
            }
        }
    }

    function isParentOrChild(currentId, toBeId){
        var currentQuestion = utils.findQuestionById(questions, currentId);
        var nextQuestion = utils.findQuestionById(questions, toBeId);

        if(currentQuestion && nextQuestion){
            if(currentQuestion.parentId == nextQuestion._id){
                return "CHILD";
            } else if(currentQuestion._id == nextQuestion.parentId){
                return "PARENT";
            }
        }
    }
    $scope.$on("$stateChangeStart", function(event, nextRoute, nextParams, fromRoute, fromParams) {
        var currentQuestionType = isParentOrChild(fromParams.questionId, nextParams.questionId);
        if(currentQuestionType == "PARENT"){
            setClassLeft();
        } else if(currentQuestionType == "CHILD"){
            setClassRight();
        }
        statisticsService.setLastViewData(fromParams);
    });


    $scope.$watch(function(){
        return $stateParams.questionId;
    }, function(n){
        if(!n){
            $scope.viewData.activeQuestion = utils.findQuestionsByParentId(questions)[0]; // finds root (always only 1 root question)
        } else {
            $scope.viewData.activeQuestion = utils.findQuestionById(questions, n);
        }
        $scope.viewData.children = utils.findQuestionsByParentId(questions, $scope.viewData.activeQuestion._id);
        statisticsService.addHit($scope.viewData.activeQuestion._id);
        setBackOrForward($scope.viewData.activeQuestion._id);
    });

    $scope.trustAsHtml = function(string) {
        return $sce.trustAsHtml(string);
    };

    function setClassRight(){
        utils.setClass("right");
    }

    function setClassLeft(){
        utils.setClass("left");
    }
}]);