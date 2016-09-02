var regApp = angular.module('regApp', []);
regApp.controller('regCtl', ['$scope', '$http', function ($scope, $http) {
    $scope.showMsg = function (msg) {
        $('#msgBody').html(msg);
        $('#msgP').modal('show');
    };
    $scope.goLogin = function () {
        location.href = 'login.html';
    };
    $scope.goReg = function () {
        if ($scope.pkgName.length < 6 || $scope.pkgName.length > 24) {
            $scope.showMsg('包名长度只能6-24位');
        } else if ($scope.password.length < 6 || $scope.password.length > 12) {
            $scope.showMsg('密码长度只能6-12位');
        } else if ($scope.passwordR != $scope.password) {
            $scope.showMsg('重复输入密码不符合');
        } else {
            var data = {
                pkgName: $scope.pkgName,
                password: $scope.password,
                code: $scope.code
            }
            $('#loadP').modal('show');
            $http.post('../addUser', data).success(function (data) {
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
        }
    };
    $scope.pkgName = '';
    $scope.password = '';
    $scope.passwordR = '';
    $scope.code = '';
}]);