(function lessonDirectives(angular) {
  'use strict';

  var app = angular.module('lessonDirectives', ['tangeloLessonServices']);

  app.directive('lessonForm', ['lessonService', '$location', function lessonFrom(lessonService, $location) {
    return {
      restrict: 'A',
      link: function ($scope, iElem, iAttrs, controller) {
        var hasSubmit = false;
        $scope.lesson = {};

        $scope.submit = function submitLessonForm() {
          if (hasSubmit) return;
          hasSubmit = true;

          // Load the file
          $scope.lesson.file = iElem.find('#fileUpload').get(0).files[0];
          $scope.lesson.size = $scope.lesson.file.size;

          var reader = new FileReader();
          reader.onloadend = function () {
            $scope.lesson.content = reader.result;
            lessonService.create($scope.lesson);

            // Redirects when done creating the files.
            $location.path('/lessons/');
          };

          reader.readAsBinaryString($scope.lesson.file);
        }
      }
    }
  }]);

  app.directive('lessonList', ['lessonService', '$location', '$http', function lessonList(lessonService, $location, $http) {
    return {
      scope: {},
      templateUrl: 'app/common/lessons/templates/lesson-list.html',
      restrict: 'E',
      replace: true,
      link: function ($scope, iElem, iAttrs, controller) {

        // $http.get('/uploads?{}').success(function (data) {
        $http.get('/file').success(function (data) {
          $scope.files = data;
          console.log('Scope Files: ' + $scope.files);
        });

        // TODO: Set this up to view a single file and its data.
        $scope.viewLesson = function viewLesson(file) {
          $location.path('/lessons/edit/' + file._id);
        };

        $scope.deleteLesson = function deleteLesson(file, elemID) {
          // console.log('Deleting file: ' + id + ' ID: ' + elemID);
          $(iElem).find('#' + elemID).remove();
          console.log('#' + elemID);
          $http.delete('/file/' + file._id).then(function (res) {
            // $location.path('/lessons');
          });
        };
      }
    };
  }]);

  app.directive('lessonEdit', ['lessonService', '$location', '$http', '$routeParams', '$sce', function lessonEdit(lessonService, $location, $http, $routeParams, $sce) {
    return {
      scope: {},
      templateUrl: 'app/common/lessons/templates/lessons-edit.html',
      restrict: 'E',
      replace: true,
      link: function ($scope, iElem, iAttrs, controller) {
        lessonService.get($routeParams._id).then(function (res) {
          var $e = $(iElem).find('.marked');
          var contentType = res.headers('content-type');

          switch( contentType.split('/')[0] ) {
            case "image":
                $e.append('<img src="http://33.33.33.10/uploads/' + $routeParams._id + '" />');
                break;

            case "text":
            case "application":
                // This is just the application type. Used to check if it's markdown or not.
                var justType = contentType.split(';')[0].split('/')[1];

                if( justType === 'x-markdown' || justType === 'markdown')
                    $e.html(marked(res.data));
                else
                    $e.html('<pre>' + res.data + '</pre>');
                break;
          }
        });
      }
    };
  }]);
})(angular);
