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
            {id: '@id' },
            {
                'add': {action: 'add'},
                'delete': {action: 'delete'},
                'save': {action: 'update'}
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

        $scope.saveAlarm = function () {
            $scope.saveAlarmResponse = Alarms.save({server: $scope.server, id: $scope.id});
            console.log($scope.server);
            console.log($scope.id);
            console.log($scope.saveAlarmResponse);
        };

        $scope.deleteAlarm = function () {
            Alarms.delete({server: $scope.server, id: $scope.id});
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    });
