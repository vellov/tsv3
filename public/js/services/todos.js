var userModule = angular.module('userModule', []);

	// super simple service
	// each function returns a promise object 
userModule.factory('userService', ['$http', function($http) {
    return {
        get : function() {
            return $http.get('/api/users');
        },
        create : function(todoData) {
            return $http.post('/api/users', todoData);
        },
        delete : function(id) {
            return $http.delete('/api/users/' + id);
        }
    }
}]);