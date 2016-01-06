var userModule = angular.module('userModule', []);

	// super simple service
	// each function returns a promise object 
userModule.factory('userService', ['$http', "$window", "AuthenticationService", "$state", function($http, $window, AuthenticationService, $state) {
    return {
        getCurrentUser : function() {
            var user = JSON.parse($window.sessionStorage.currentUser);
            if(!user) return;
            return user;
        },

        create : function(formData) {
            return $http.post('/api/users', formData);
        },
      
        delete : function(id) {
            return $http.delete('/api/users/' + id);
        },

        login: function(formData){
            return $http.post('/api/users/login', formData).then(function(d){
                $window.sessionStorage.token = d.data.token;
                $window.sessionStorage.currentUser = JSON.stringify(d.data.user);
                AuthenticationService.isAuthenticated = true;
                $state.go("admin");
            },function(e){
                console.log(e);
            });
        },

        logout: function(){
            AuthenticationService.isAuthenticated = false;
            delete $window.sessionStorage.token;
            delete $window.sessionStorage.currentUser;
            $state.go("login");
        },

        register: function(formData){
            return $http.post('/api/users/registerUser', formData).then(function(d){
                $window.sessionStorage.token = d.data.token;
                $window.sessionStorage.currentUser = JSON.stringify(d.data.user);
                AuthenticationService.isAuthenticated = true;
                $state.go("admin");
            },function(e){
                if(e.data == "username-taken"){
                    alert("Kasutajanimi juba olemas");
                }
            });
        }
    }
}]);