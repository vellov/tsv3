/**
 * Created by vellovaherpuu on 29/12/15.
 */
var utilsModule = angular.module("utils",[]);

utilsModule.factory("utils", ["$uibModal", function($uibModal){
    var stateClass = "left";

    function showDialog(template, message, title, okCallback, cancelCallback, confirmButtonText) {
        var dialog = $uibModal.open({
            template: template,
            controller: "dlgCtrl",
            resolve: {
                message: function () {
                    return message;
                },
                title: function () {
                    return title;
                },
                confirmButtonText: function(){
                    return confirmButtonText;
                }
            }
        });
        dialog.result.then(function () {
            if (okCallback) okCallback();
        }, function() {
            if (cancelCallback) cancelCallback();
        });
        return dialog;
    }


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

        findSuccessStepByParentId: function(questions, parentId) {
            var siblings = this.findQuestionsByParentId(questions, parentId);
            for (var i in siblings){
                if(siblings[i].type == "SUCCESS"){
                    return siblings[i];
                }
            }
        },

        getClass: function(){
            return stateClass;
        },

        setClass: function(Class){
            stateClass = Class;
        },

        confirm: function(title, message, okCallback, cancelCallback, confirmButtonText, cancelButtonText){
            if(!confirmButtonText ) {
                confirmButtonText = "OK";
            }
            if(!cancelButtonText){
                cancelButtonText = "Cancel";
            }
            showDialog(
                '<div class="modal-header"><h5 class="modal-title">{{ title }}</h5></div>' +
                '<div class="modal-body">{{ message }}</div>' +
                '<div class="modal-footer">' +
                '<div class="action-buttons">'+
                '<a class="btn btn-link" ng-click="cancel()">' + cancelButtonText + '</a>' +
                '<input type="submit" class="btn btn-primary" ng-click="ok()" value="{{ confirmButtonText }}"></div></div>',
                message, title, okCallback, cancelCallback, confirmButtonText
            );
        }
    };

}]);

utilsModule.controller("dlgCtrl", ["$scope", "title", "message", "confirmButtonText", function ($scope, title, message, confirmButtonText) {
    $scope.title = title;
    $scope.message = message;
    $scope.confirmButtonText = confirmButtonText;

    $scope.ok = function () {
        $scope.$close(true);
    };

    $scope.cancel = function () {
        $scope.$dismiss();
    };

}]);