/**
 * Created by vellovaherpuu on 22/12/15.
 */
var appModule = angular.module('troubleshooting');

appModule.factory("projectService", ["$http", "$uibModal", function($http, $uibModal){
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

       cloneProject: function(id){
           return $http.post("/api/projects/clone", { id: id });
       },

       deleteProject: function(projectId){
           return $http.delete("/api/projects/delete/" + projectId);
       },

       getProjectQuestions: function(projectId){
           return $http.get("/api/questions/" + projectId);
       },

       saveQuestion: function(data){
           return $http.post("/api/questions/save", data);
       },

       deleteQuestion: function(id){
           return $http.delete("/api/questions/delete/" + id);
       },

       openProjectModal: function(project, saveCallback, deleteCallback){
           var dialog = $uibModal.open({
               templateUrl: "templates/projectSettings.html",
               controller: "projectSettingsController",
               resolve: {
                   project: function(){
                       return project;
                   }
               }
           });

           dialog.result.then(function(result){
               if(!result) return;

               if(result.type == "SAVE"){
                   saveCallback(result.data);
               } else if (result.type == "DELETE") {
                   deleteCallback();
               }
           })
       }
   }
}]);