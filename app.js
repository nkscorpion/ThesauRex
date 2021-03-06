var thesaurexApp = angular.module('tutorialApp', ['ngAnimate', 'ngRoute', 'ngMessages', 'nemLogging', 'ui.select', 'ngSanitize', 'ngFlag', 'ui.bootstrap', 'ngFileUpload', 'ui.tree', 'ui.bootstrap.contextMenu']);

thesaurexApp.directive('spinner', function() {
    return {
        template: '<div class="spinner-container">' +
            '<svg class="circle-img-path" viewBox="25 25 50 50">' +
                '<circle class="circle-path" cx="50" cy="50" r="20" fill="none" stroke-width="4" stroke-miterlimit="10" />' +
            '</svg>' +
        '</div>'
    };
});

thesaurexApp.controller('masterCtrl', ['$scope', function($scope) {
    $scope.treeName = 'master';
}]);

thesaurexApp.controller('projectCtrl', ['$scope', function($scope) {
    $scope.treeName = 'project';
}]);

thesaurexApp.service('modalFactory', ['$uibModal', function($uibModal) {
    this.deleteModal = function(elementName, onConfirm, additionalWarning) {
        if(typeof additionalWarning != 'undefined' && additionalWarning !== '') {
            var warning = additionalWarning;
        }
        var modalInstance = $uibModal.open({
            templateUrl: 'templates/delete-confirm.html',
            controller: function($uibModalInstance) {
                this.name = elementName;
                this.warning = warning;
                this.cancel = function(result) {
                    $uibModalInstance.dismiss('cancel');
                };
                this.deleteConfirmed = function() {
                    onConfirm();
                    $uibModalInstance.dismiss('ok');
                };
            },
            controllerAs: 'mc'
        });
        modalInstance.result.then(function(selectedItem) {}, function() {});
    };
}]);

thesaurexApp.directive('resizeWatcher', function($window) {
    return function($scope) {
        var bottomPadding = 20;
        var listPadding = 40;

        $scope.getWindowSize = function() {
            var height = $window.innerHeight;
            var width = $window.innerWidth;
            var isSm = window.matchMedia("(max-width: 991px)").matches;
            var controlElement = $('.control-elements')[0];
            var controlHeight = controlElement.offsetHeight + controlElement.offsetTop;
            if(isSm) {
                $('#master-tree').css('height', '');
                $('#project-tree').css('height', '');
                $('#broader-list').css('height', '');
                $('#narrower-list').css('height', '');
                $('#preferred-list').css('height', '');
                $('#alternative-list').css('height', '');
            } else {
                var headerHeight = document.getElementById('main-container').offsetTop;
                var informationHeight = document.getElementById('information-header').offsetHeight;
                var informationAlertHeight = document.getElementById('information-alert').offsetHeight;
                informationHeight += informationAlertHeight;
                //use broader-header height as subHeaderHeight, since all *-header should have the same height
                var subHeader = document.getElementById('broader-header');
                var subHeaderHeight = subHeader.offsetHeight + subHeader.offsetTop;

                var containerHeight = height - controlHeight - headerHeight - bottomPadding;
                var rightHeight = height - headerHeight - (bottomPadding - (listPadding/4)) - informationHeight - listPadding;
                var labelHeight = (rightHeight - (2 * subHeaderHeight)) / 2;

                $('#master-tree').css('height', containerHeight);
                $('#project-tree').css('height', containerHeight);
                $('#broader-list').css('height', labelHeight);
                $('#narrower-list').css('height', labelHeight);
                $('#preferred-list').css('height', labelHeight);
                $('#alternative-list').css('height', labelHeight);
            }
        };

        //recalculate window size if information-alert gets toggled (and thus toggle information container as well)
        var alertElement = "#information-alert";
        $scope.$watch(function() {
            return angular.element(alertElement).is(':visible');
        }, function() {
            $scope.getWindowSize();
        });

        return angular.element($window).bind('resize', function() {
            $scope.getWindowSize();
            return $scope.$apply();
        });
    };
});

thesaurexApp.directive('myDirective', function(httpPostFactory, scopeService) {
    return {
        restrict: 'A',
        scope: false,
        link: function(scope, element, attr) {
            element.bind('change', function() {
                var formData = new FormData();
                formData.append('file', element[0].files[0]);
            });
        }
    };
});

thesaurexApp.directive('formField', function() {
    return {
        restrict: 'E',
        templateUrl: 'includes/inputFields.html',
        scope: {
            fields: '=',
            output: '='
        }
    };
});

thesaurexApp.directive("number", function() {
    return {
        restrict: "A",
        require: "ngModel",
        link: function(scope, element, attributes, ngModel) {
            ngModel.$validators.number = function(modelValue) {
                return isFinite(modelValue);
            };
        }
    };
});

thesaurexApp.filter('bytes', function() {
	return function(bytes, precision) {
        var units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
		if(isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '0 ' + units[0];
		if(typeof precision === 'undefined') precision = 1;
		var number = Math.floor(Math.log(bytes) / Math.log(1024));
		return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
	};
});

thesaurexApp.filter('overallLength', function() {
    return function(obj) {
        var count = 0;
        angular.forEach(obj, function(value, key) {
            count += value.length;
        });
        return count;
    };
});

thesaurexApp.filter('truncate', function () {
    return function (value, max, atword, suffix) {
        if(!value) return '';
        if(!max || value.length <= max) return value;

        value = value.substr(0, max);
        if(atword) {
            var lastWordIndex = value.lastIndexOf(' ');
            if(lastWordIndex != -1) {
                if(value.endsWith(',', lastWordIndex) || value.endsWith('.', lastWordIndex)) lastWordIndex--;
                value = value.substr(0, lastWordIndex);
            }
        }
        return value + (suffix || '…');
    };
});

thesaurexApp.factory('httpPostPromise', function($http) {
    var getData = function(file, data) {
        return $http({
            url: file,
            method: "POST",
            data: data,
            headers: {
                'Content-Type': undefined
            }
        }).then(function(result) {
            return result.data;
        });
    };
    return { getData: getData };
});

thesaurexApp.factory('httpPostFactory', function($http) {
    return function(file, data, callback) {
        $http({
            url: file,
            method: "POST",
            data: data,
            headers: {
                'Content-Type': undefined
            }
        }).success(function(response) {
            callback(response);
        });
    };
});

thesaurexApp.factory('httpGetPromise', function($http) {
    var getData = function(file) {
        return $http({
            url: file,
            method: "GET",
            headers: {
                'Content-Type': undefined
            }
        }).then(function(result) {
            return result.data;
        });
    };
    return { getData: getData };
});

thesaurexApp.factory('httpGetFactory', function($http) {
    return function(file, callback) {
        $http({
            url: file,
            method: "GET",
            headers: {
                'Content-Type': undefined
            }
        }).success(function(response) {
            callback(response);
        });
    };
});

thesaurexApp.factory('scopeService', function($http) {
    var service = {
    };
    return service;
});

thesaurexApp.config(function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/tree', {
            templateUrl: 'includes/tree.html'
        })
        /*.when('/user/role/:activeRole', {
            template: '',
            controller: 'headerCtrl'
        })*/
        .otherwise({
            redirectTo: '/tree'
        });

    //$locationProvider.html5Mode(true);
});
