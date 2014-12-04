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
            {server: '@server'},
            {
                list: {isArray: false},
                add: {method: 'POST', params: {action: 'add'}},
                delete: {method: 'POST', params: {action: 'delete', id: '@id'}},
                update: {method: 'POST', params: {action: 'update', id: '@id'}}
            }
        );
    })

    .controller('AlarmsCtrl', function ($scope, $resource, Alarms, $modal, $interval) {

        Alarms.list({}, function (data) {

            // Get all servers from backend
            $scope.serverList = data.servers;

            // Get all alarms server-by-server from the list above
            function getAlarms(server) {
                Alarms.query({server: server}, function (data) {
                    $scope.serverList[server]  = data;
                });
            }

            for (var i = 0; i < $scope.serverList.length; i++) {
                getAlarms($scope.serverList[i]);
            }

        });

        // Data refresh start
        var refreshData = function () {
            // Assign to scope within callback to avoid data flickering on screen
            Alarms.query({server: 'test'}, function (data) {
                $scope.testAlarms = data;
            });
            Alarms.query({server: 'avk6b1'}, function (data) {
                $scope.avk6b1Alarms = data;
            });
        };

        // Promise should be created to be deleted afterwards
        var promise = $interval(refreshData, 500000);

        // Cancel interval on page changes
        $scope.$on('$destroy', function () {
            if (angular.isDefined(promise)) {
                $interval.cancel(promise);
                promise = undefined;
            }
        });
        // Data refresh end

        $scope.openAlarmInfoModal = function (size, server, id) {
            $scope.showModal = true;
            $scope.alarmInfo = Alarms.query({server: server, id: id});
            $scope.id = id;
            $scope.server = server;

            $modal.open({
                templateUrl: '../views/alarms/alarmInfo.html',
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

        $scope.openAddAlarmModal = function (size, server, id) {
            $scope.showModal = true;
            $scope.alarmInfo = Alarms.query({server: server, id: id});
            $scope.id = id;
            $scope.server = server;

            $modal.open({
                templateUrl: '../views/alarms/addAlarm.html',
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
    .controller('ModalInstanceCtrl', function ($scope, $modalInstance, Alarms, toaster) {
        $scope.saveAlarm = function (alarmInfo) {
            Alarms.update({server: $scope.server, id: $scope.id, envname: alarmInfo[0].ENVNAME, checkname: alarmInfo[0].CHECKNAME, description: alarmInfo[0].DESCRIPTION, status: alarmInfo[0].STATUS, curvalue: alarmInfo[0].CURVALUE, vallimit: alarmInfo[0].VALLIMIT, limitmark: alarmInfo[0].LIMITMARK, sqlscript: alarmInfo[0].SQLSCRIPT, active: alarmInfo[0].ACTIVE, sendto: alarmInfo[0].SENDTO, alarmtype: alarmInfo[0].ALARMTYPE, starttime: alarmInfo[0].START_TIME, endtime: alarmInfo[0].END_TIME},
                function () {
                    toaster.pop('success', 'Alarm update', 'Updated successfully');
                }, function (data) {
                    toaster.pop('error', 'Error in update', data);
                });
        };

        $scope.addAlarm = function (server, alarm) {
            Alarms.add({server: server, envname: alarm.envname, checkname: alarm.checkname, description: alarm.description, status: alarm.status, curvalue: alarm.curvalue, vallimit: alarm.vallimit, limitmark: alarm.limitmark, sqlscript: alarm.sqlscript, active: alarm.active, sendto: alarm.sendto, alarmtype: alarm.alarmtype, starttime: alarm.starttime, endtime: alarm.endtime},
                function () {
                    toaster.pop('success', 'Alarm added', 'Added successfully');
                }, function (data) {
                    toaster.pop('error', 'Error in add', data);
                });
        };

        $scope.deleteAlarm = function () {
            Alarms.delete({server: $scope.server, id: $scope.id},
                function () {
                    toaster.pop('success', 'Alarm delete', 'Deleted successfully');
                }, function (data) {
                    toaster.pop('error', 'Error in delete', data);
                });
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    });