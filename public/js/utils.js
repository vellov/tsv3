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
                var questionParentId = questions[i].parentId;
                if(questionParentId == "" || questionParentId == null || questionParentId == undefined) questionParentId = "";
                if (questionParentId == parentId) {
                    result.push(questions[i]);
                }
            }
            return result;
        },

        findSuccessStepByParentId: function (questions, parentId) {
            var siblings = this.findQuestionsByParentId(questions, parentId);
            for (var i in siblings) {
                if (siblings[i].type == "SUCCESS") {
                    return siblings[i];
                }
            }
        },

        getClass: function () {
            return stateClass;
        },

        setClass: function (Class) {
            stateClass = Class;
        },

        confirm: function (title, message, okCallback, cancelCallback, confirmButtonText, cancelButtonText) {
            if (!confirmButtonText) {
                confirmButtonText = "OK";
            }
            if (!cancelButtonText) {
                cancelButtonText = "Cancel";
            }
            showDialog(
                '<div class="modal-header"><h5 class="modal-title">{{ title }}</h5></div>' +
                '<div class="modal-body">{{ message }}</div>' +
                '<div class="modal-footer">' +
                '<div class="action-buttons">' +
                '<a class="btn btn-link" ng-click="cancel()">' + cancelButtonText + '</a>' +
                '<input type="submit" class="btn btn-primary" ng-click="ok()" value="{{ confirmButtonText }}"></div></div>',
                message, title, okCallback, cancelCallback, confirmButtonText
            );
        },
        alert : function (message, title, okCallback, cancelCallback) {
            return showDialog(
                '<div class="modal-header"><h5 class="modal-title">{{ title }}</h5></div>' +
                '<div class="modal-body">{{ message }}</div>' +
                '<div class="modal-footer">' +
                '<input type="submit" class="btn btn-primary" ng-click="ok()" value="OK">' +
                '</div>',
                message, title, okCallback, cancelCallback);
        },

        checkValidity: function (form) {
            form.$commitViewValue();
            form.$setSubmitted();

            return form.$valid;
        },
        now: function(){
            return Date.now || new Date().getTime || new Date().valueOf;
        }

    }

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

utilsModule.factory("blockerService",
    ["utils", "$rootScope",
        function (utils, $rootScope) {
            var factory = { };

            var blockers = { };

            factory.findBlocker = function(id) {
                return (blockers[id] ? blockers[id][blockers[id].length - 1] : null);
            };

            factory.saveBlocker = function(id) {
                if (!blockers[id]) blockers[id] = [];
                blockers[id].push({ date: utils.now() });
            };

            factory.deleteBlocker = function(id) {
                if (blockers[id]) {
                    if (blockers[id].length > 1) blockers[id].shift();
                    else delete blockers[id];
                }
            };

            window.setInterval(function() {
                var date = utils.now();
                var removed = false;
                for (var b in blockers) {
                    if (date - blockers[b][0].date > 15 * 1000) {
                        factory.deleteBlocker(b);
                        removed = true;
                    }
                }
                if (removed) $rootScope.$applyAsync();
            }, 1000);
            return factory;
        }]);