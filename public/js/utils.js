/**
 * Created by vellovaherpuu on 29/12/15.
 */
var utilsModule = angular.module("utils",[]);

utilsModule.factory("utils", [function(){
    var stateClass = "left";
    return {
        findQuestionById: function (questions, questionId) {
            for (var i in questions) {
                if (questions[i]._id == questionId) {
                    return questions[i];
                }
            }
        },

        findQuestionsByParentId: function (questions, parentId) {
            var result = [];
            if (!parentId) parentId = "";
            for (var i in questions) {
                if (questions[i].parentId == parentId) {
                    result.push(questions[i]);
                }
            }
            return result;
        },

        getClass: function(){
            return stateClass;
        },

        setClass: function(Class){
            stateClass = Class;
        }
    }
}]);