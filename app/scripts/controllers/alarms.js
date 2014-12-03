'use strict';

/**
 * @ngdoc function
 * @name dashboardApp.controller:AlarmsCtrl
 * @description
 * # AlarmsCtrl
 * Controller of the dashboardApp
 */

angular.module('dashboardApp')

    .factory('Alarms', function ($resource) {
        return $resource(
            'http://localhost:3000/alarms/:server/:action/:id',
            {server: '@server' },
            {
                add: {method: 'POST', params: {action: 'add', id: '@id'}},
                delete: {method: 'POST', params: {action: 'delete', id: '@id'}},
                update: {method: 'POST', params: {action: 'update', id: '@id'}}
            }
        );
    })

    .controller('AlarmsCtrl', function ($scope, $resource, Alarms, $modal, $interval) {

        // Initial data query promise resoled automaticaly
        $scope.avk6b1Alarms = Alarms.query({server: 'avk6b1'});
        $scope.testAlarms = Alarms.query({server: 'test'});

        // Data refresh start
        var refreshData = function() {
            // Assign to scope within callback to avoid data flickering on screen
            Alarms.query({server: 'test'}, function(data){
                $scope.testAlarms = data;
            });
            Alarms.query({server: 'avk6b1'}, function(data){
                $scope.avk6b1Alarms = data;
            });
        };

        // Promise should be created to be deleted afterwards
        var promise = $interval(refreshData, 5000);

        // Cancel interval on page changes
        $scope.$on('$destroy', function(){
            if (angular.isDefined(promise)) {
                $interval.cancel(promise);
                promise = undefined;
            }
        });
        // Data refresh end

        $scope.openModal = function (server, id) {
            $scope.showModal = true;
            $scope.alarmInfo = Alarms.query({server: server, id: id});
        };

        $scope.openModal = function (size, server, id) {
            $scope.alarmInfo = Alarms.query({server: server, id: id});
            $scope.id = id;
            $scope.server = server;

            $modal.open({
                templateUrl: '../views/alarms/modal.html',
                controller: 'ModalInstanceCtrl',
                size: size,
                scope: $scope,
                resolve: {
                    items: function () {
                        return $scope.alarmInfo;
                    }
                }
            });
        };

    })

    // Please note that $modalInstance represents a modal window (instance) dependency.
    // It is not the same as the $modal service used above.
    .controller('ModalInstanceCtrl', function ($scope, $modalInstance, Alarms) {
        $scope.alerts = [];

        $scope.addAlert = function (type, msg) {
            $scope.alerts.push({type: type, msg: msg});
        };

        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };

        $scope.saveAlarm = function (alarmInfo) {
            Alarms.update({server: $scope.server, id: $scope.id, envname: alarmInfo[0].ENVNAME, checkname: alarmInfo[0].CHECKNAME, description: alarmInfo[0].DESCRIPTION, status: alarmInfo[0].STATUS, curvalue: alarmInfo[0].CURVALUE, vallimit: alarmInfo[0].VALLIMIT, limitmark: alarmInfo[0].LIMITMARK, sqlscript: alarmInfo[0].SQLSCRIPT, active: alarmInfo[0].ACTIVE, sendto: alarmInfo[0].SENDTO, alarmtype: alarmInfo[0].ALARMTYPE, starttime: alarmInfo[0].START_TIME, endtime: alarmInfo[0].END_TIME},
                function () {
                    $scope.addAlert('success', 'Updated successfully');
                }, function (error) {
                    $scope.addAlert('error', 'Error in update: ' + error);
                });
        };

        $scope.deleteAlarm = function () {
            Alarms.delete({server: $scope.server, id: $scope.id},
                function () {
                    $scope.addAlert('success', 'Deleted successfully');
                }, function (error) {
                    $scope.addAlert('error', 'Error in delete: ' + error);
                });
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    });