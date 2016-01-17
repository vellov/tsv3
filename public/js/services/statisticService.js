/**
 * Created by vellovaherpuu on 27/12/15.
 */
var appModule = angular.module('troubleshooting');

appModule.factory("statisticsService", function($http){
    var lastViewData = { };
    var stateClass = "left";
    return {

        getLastViewData: function(){
            return lastViewData;
        },

        setLastViewData: function(data){
            lastViewData = data
        },

        addHit: function(questionId){
            var data = {
                questionId: questionId,
                type : "views"
            };
            return $http.post("/api/questionStatistics/save", data);
        },

        addFoundSolution: function(questionId){
            var data = {
                questionId: questionId,
                type : "foundSolution"
            };
            return $http.post("/api/questionStatistics/save", data);
        },

        getQuestionStatistics: function(projectId){
            return $http.get("/api/project/statistics/" + projectId);
        }
    }
});