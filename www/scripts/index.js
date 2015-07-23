// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397704
// To debug code on page load in Ripple or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
(function () {
    "use strict";

    angular.module('YciApp', ['YciApp.services', 'YciApp.controllers', 'YciApp.directives','ionic']);
    //angular.module('YciApp', ['YciApp.services', 'YciApp.controllers', 'YciApp.directives']);
    angular.module('YciApp.directives', []);
    angular.module('YciApp.controllers', ['uiGmapgoogle-maps']);
    angular.module('YciApp.services', ['ngResource']);

       // Google Maps SDK
angular.module('YciApp').config(function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        key: '', //You have to use your own google developer key
        v: '3.17',
        libraries: 'geometry,visualization'
    });
});

angular.module('YciApp').config(function($ionicConfigProvider) {
    $ionicConfigProvider.tabs.position("bottom"); //Places them at the bottom for all OS
    $ionicConfigProvider.tabs.style("standard"); //Makes them all look the same across all OS
});


//Tab Routing
angular.module('YciApp').config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('tabs', {
      url: "/tab",
      abstract: true,
      templateUrl: "templates/tabs.html"
    })
    .state('tabs.home', {
      url: "/home",
      views: {
        'home-tab': {
          templateUrl: "templates/home.html"
        }
      }
    })
    .state('tabs.about', {
      url: "/about",
      views: {
        'about-tab': {
          templateUrl: "templates/info.html"
        }
      }
    })
    .state('tabs.basic', {
      url: "/basic",
      views: {
        'about-tab': {
          templateUrl: "one.tpl.html"
        }
      }
    })
    .state('tabs.legist', {
      url: "/legist",
      views: {
        'about-tab': {
          templateUrl: "two.tpl.html"
        }
      }
    })
    .state('tabs.area', {
      url: "/area",
      views: {
        'about-tab': {
          templateUrl: "three.tpl.html"
        }
      }
    })
    .state('tabs.school', {
      url: "/school",
      views: {
        'about-tab': {
          templateUrl: "four.tpl.html"
        }
      }
    })
    .state('tabs.location', {
      url: "/location",
      views: {
        'location-tab': {
          templateUrl: "templates/location.html"
        }
      }
    });


   $urlRouterProvider.otherwise("/tab/home");

})



} )();