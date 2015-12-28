/**
 * Created by vellovaherpuu on 22/12/15.
 */
var appModule = angular.module('troubleshooting');

appModule.factory("projectService", function($http, $window){
   return {
       getUserProjects: function(){
           return $http.get("/api/projects/"); // returns currentuser projects
       },

       getProjectById: function(id){
           return $http.get("/api/projects/" + id);
       },

       saveProject: function(data){
           return $http.post("/api/projects/save", data); //returns old + new project
       },

       getProjectQuestions: function(projectId){
           return $http.get("/api/questions/" + projectId);
       },

       saveQuestion: function(data){
           return $http.post("/api/questions/save",data);
       },

       deleteQuestion: function(id){
           return $http.delete("/api/questions/delete/" + id);
       }
   }
});