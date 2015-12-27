/**
 * Created by vellovaherpuu on 27/12/15.
 */
var appModule = angular.module('troubleshooting');

appModule.factory("statisticsService", function($http, $window){
    return {
        addHit: function(questionId){
            var data = {
                questionId:questionId,
                type : "VIEW"
            };
            return $http.post("/api/questionStatistics/save", data);
        },

        addForward: function(questionId){
            var data = {
                questionId:questionId,
                type : "FORWARD"
            };
            return $http.post("/api/questionStatistics/save", data);
        },

        addBack: function(questionId){
            var data = {
                questionId:questionId,
                type : "BACK"
            };
            return $http.post("/api/questionStatistics/save", data);
        }
    }
});