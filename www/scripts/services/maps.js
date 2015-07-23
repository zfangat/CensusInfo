(function () {
	'use strict';

	angular.module('YciApp.services').service('maps', ['$resource','cordova', Maps]);

	function Maps($resource,cordova) {
	    this.url = 'http://geocoding.geo.census.gov/geocoder/geographies/coordinates?x=:longitude&y=:latitude&benchmark=4&vintage=4&layers=all&format=jsonp';
	    this.$resource = $resource;
	    this.cordova = cordova;
	}

	/**
	 * Gets value array from a position.
	 * @params position
	 */
	Maps.prototype.getvalueFromPosition = function (lat,longt) {
		var _this = this;
        //var lat,longt;
        
        //lat = position.coords.latitude;
        //longt = position.coords.longitude;

		return this.$resource(_this.url, {})
			.get({ latitude: lat, longitude: longt })
			//.get({ latitude: 38.894629, longitude: -77.020269 })
			.$promise.then(function (response) {
			    //return [];
			    var vlist=[];
			    var vitem = response.result.geographies['114th Congressional Districts'];
			    if (!(vitem==null) && vitem.length) vlist.push(vitem[0].NAME);
			    else vlist.push('Not Provided');

			    vitem = response.result.geographies['2010 Census Public Use Microdata Areas'];
			    if (!(vitem==null) && vitem.length) vlist.push(vitem[0].NAME);
			    else vlist.push('Not Provided');

			    vitem = response.result.geographies['2010 Census Urbanized Areas'];
			    if (!(vitem==null) && vitem.length) vlist.push(vitem[0].NAME);
			    else vlist.push('Not Provided');

			    vitem = response.result.geographies['2010 Census ZIP Code Tabulation Areas'];
			    if (!(vitem==null) && vitem.length) vlist.push(vitem[0].BASENAME);
			    else vlist.push('Not Provided');

			    vitem = response.result.geographies['2014 State Legislative Districts - Lower'];
			    if (!(vitem==null) && vitem.length) vlist.push(vitem[0].NAME);
			    else vlist.push('Not Provided');

			    vitem = response.result.geographies['2014 State Legislative Districts - Upper'];
			    if (!(vitem==null) && vitem.length) vlist.push(vitem[0].NAME);
			    else vlist.push('Not Provided');

			    vitem = response.result.geographies['Census Designated Places'];
			    if (!(vitem==null) && vitem.length) vlist.push(vitem[0].NAME);
			    else vlist.push('Not Provided');

			    vitem = response.result.geographies['Census Divisions'];
			    if (!(vitem==null) && vitem.length) vlist.push(vitem[0].NAME);
			    else vlist.push('Not Provided');

			    vitem = response.result.geographies['Census Regions'];
			    if (!(vitem==null) && vitem.length) vlist.push(vitem[0].NAME);
			    else vlist.push('Not Provided');

			    vitem = response.result.geographies['Census Tracts'];
			    if (!(vitem==null) && vitem.length) vlist.push(vitem[0].NAME);
			    else vlist.push('Not Provided');

			    vitem = response.result.geographies['Combined Statistical Areas'];
			    if (!(vitem==null) && vitem.length) vlist.push(vitem[0].NAME);
			    else vlist.push('Not Provided');

			    vitem = response.result.geographies['Counties'];
			    if (!(vitem==null) && vitem.length) vlist.push(vitem[0].NAME);
			    else vlist.push('Not Provided');

			    vitem = response.result.geographies['County Subdivisions'];
			    if (!(vitem==null) && vitem.length) vlist.push(vitem[0].NAME);
			    else vlist.push('Not Provided');

			    vitem = response.result.geographies['Metropolitan Divisions'];
			    if (!(vitem==null) && vitem.length) vlist.push(vitem[0].NAME);
			    else vlist.push('Not Provided');

			    vitem = response.result.geographies['States'];
			    if (!(vitem==null) && vitem.length) vlist.push(vitem[0].NAME);
			    else vlist.push('Not Provided');

			    vitem = response.result.geographies['Unified School Districts'];
			    if (!(vitem==null) && vitem.length) vlist.push(vitem[0].NAME);
			    else vlist.push('Not Provided');

                vlist.push(lat);
			    vlist.push(longt);

			    return vlist;
			}, function (error) {
			    return [];
			});
	};
})();