(function () {
	'use strict';

	angular.module('YciApp.services').service('address', ['$rootScope', '$q', '$window', 'cordova', Address]);

	function Address($rootScope, $q, $window, cordova) {
		this.$rootScope = $rootScope;
		this.$q = $q;
		this.$window = $window;
		this.cordova = cordova;
	}

	Address.prototype.getCurrentPosition = function () {
		var _this = this;
		return this.cordova.ready.then(function () {
			var deferred = _this.$q.defer();
			_this.$window.navigator.geolocation.getCurrentPosition(function (successValue) {
			    //_this.$timeout(function() {
			    //    deferred.resolve(successValue);
			    //}.bind(_this),7000)
//			    if (_this.$rootScope.$$phase != '$apply' && _this.$rootScope.$$phase != '$digest') {
			    _this.$rootScope.$applyAsync(function () {
			            deferred.resolve(successValue);
			        }.bind(_this));
//			    }
			}, function (errorValue) {
			    //_this.$timeout(function () {
			    //    deferred.resolve(errorValue);
			    //}.bind(_this),7000)
//			    if (_this.$rootScope.$$phase != '$apply' && _this.$rootScope.$$phase != '$digest') {
			    _this.$rootScope.$applyAsync(function () {
			            deferred.reject(errorValue);
			        }.bind(_this));
//			    }
			});

			return deferred.promise;
		});
	};

})();