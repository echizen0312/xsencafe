var loginApp = angular.module('loginApp', []);
loginApp.controller('loginCtl', ['$scope', '$http', function ($scope, $http) {
    $scope.showMsg = function (msg) {
        $('#msgBody').html(msg);
        $('#msgP').modal('show');
    };
    $scope.goReg = function () {
        $scope.showMsg('不提供这个功能');
    };
    $scope.goLogin = function () {
        if ($scope.mobile != '' && $scope.password != '') {
            var data = {
                mobile: $scope.mobile,
                password: $scope.password
            }
            $('#loadP').modal('show');
            $http.post('../login', data).success(function (data) {
                $('#loadP').modal('hide');
                if (data.success) {
                    location.href = 'index.html';
                } else {
                    $scope.showMsg(data.msg);
                }
            }).error(function () {
                $('#loadP').modal('hide');
                $scope.showMsg('访问不了服务器');
            });
        } else {
            $scope.showMsg('输入不完全');
        }
    };
    $scope.mobile = '';
    $scope.password = '';
}]);