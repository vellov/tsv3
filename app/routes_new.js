var userService             = require('./modules/userService');
var troubleshooterService   = require('./modules/troubleshooterService');
module.exports = function(app) {

    /**
     * LOGIN - DONE
     */

    app.post('/api/users/login', function (req, res, next) {
        userService.login(req, res, next);
    });

    app.post('/api/users/registerUser', function (req, res) {
        userService.registerUser(req, res);
    });

    app.post('/api/users/forgot', function (req, res) {
        userService.forgotPassword(req, res);
    });

    app.get('/api/users/reset/:token', function (req, res) {
        userService.tokenExpired(req, res);
    });

    app.post('/api/users/reset', function (req, res) {
        userService.resetPassword(req, res);
    });

    /**
     * TROUBLESHOOTERS - TODO
     */

    app.get('/api/troubleshooter', function(req, res){
        troubleshooterService.findUserTroubleshooters(req, res);
    });

    app.delete('/api/troubleshooter/delete/:troubleshooterId', function(req, res){
        troubleshooterService.delete(req, res);
    });

    app.get('/api/troubleshooter/:troubleshooterId', function(req, res){
        troubleshooterService.findTroubleshooterById(req, res);
    });

    app.post('/api/troubleshooter/save', function(req, res){
        troubleshooterService.save(req, res);
    });

    app.post('/api/troubleshooter/clone', function(req,res){
        troubleshooterService.clone(req, res);
    });

    app.get('/api/troubleshooter/statistics/:troubleshooterId', function(req, res){
        troubleshooterService.findTroubleshooterStatistics(req, res);
    });

};