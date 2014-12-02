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
                add: {method: 'POST', params:{action:'add', id: '@id'}},
                delete: {method: 'POST', params:{action:'delete', id: '@id'}},
                update: {method: 'POST', params:{action:'update', id: '@id'}}
            }
        );
    })

    .controller('AlarmsCtrl', function ($scope, $resource, Alarms, $modal) {
        $scope.testAlarms = Alarms.query({server: 'test'});
        $scope.avk6b1Alarms = Alarms.query({server: 'avk6b1'});

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
        $scope.saveAlarm = function (alarmInfo) {
            Alarms.update({server: $scope.server, id: $scope.id, envname: alarmInfo[0].ENVNAME, checkname: alarmInfo[0].CHECKNAME, description: alarmInfo[0].DESCRIPTION, status: alarmInfo[0].STATUS, curvalue: alarmInfo[0].CURVALUE, vallimit: alarmInfo[0].VALLIMIT, limitmark: alarmInfo[0].LIMITMARK, sqlscript: alarmInfo[0].SQLSCRIPT, active: alarmInfo[0].ACTIVE, sendto: alarmInfo[0].SENDTO, alarmtype: alarmInfo[0].ALARMTYPE, starttime: alarmInfo[0].START_TIME, endtime: alarmInfo[0].END_TIME});
        };

        $scope.deleteAlarm = function () {
            Alarms.delete({server: $scope.server, id: $scope.id});
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    });
