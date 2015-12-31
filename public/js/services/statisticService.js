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

        getQuestionStatistics: function(questionId){
            return $http.get("/api/questions/statistics/" + questionId);
        }
    }
});