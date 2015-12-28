/**
 * Created by vellovaherpuu on 27/12/15.
 */
var appModule = angular.module('troubleshooting');

appModule.factory("statisticsService", function($http){
    return {
        addHit: function(questionId){
            var data = {
                questionId: questionId,
                type : "views"
            };
            return $http.post("/api/questionStatistics/save", data);
        },

        addForward: function(questionId){
            var data = {
                questionId: questionId,
                type : "forward"
            };
            return $http.post("/api/questionStatistics/save", data);
        },

        addBack: function(questionId){
            var data = {
                questionId: questionId,
                type : "back"
            };
            return $http.post("/api/questionStatistics/save", data);
        },

        getProjectQuestions: function(projectId){
            return $http.get("/api/questions/statistics/" + projectId);
        }
    }
});