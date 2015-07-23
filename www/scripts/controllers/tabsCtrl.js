
angular.module("YciApp.controllers").controller('TabsCtrl', ['$scope','maps','address','$state',function($scope,maps,address,$state) {
    this.maps = maps;
    this.address=address;

    $scope.census_basics = [];
    $scope.census_leg = [];
    $scope.census_area = [];
    $scope.census_school = [];

    $scope.msg = 'The draggable marker is current location';

    $scope.lat = 0;
    $scope.longt = 0;

    //$scope.lat = 38.8977;
    //$scope.longt = -77.0366;


    $scope.map = {
        //center: {
        //    latitude: $scope.lat,
        //    longitude: $scope.longt
        //},
        draggable: true,
        zoom: 15
    };

    // map options
    $scope.options = {
        scrollwheel: false,
        panControl: true,
        rotateControl: true,
        scaleControl: true,
        streetViewControl: false
    };

    // map marker
    $scope.marker = {
        id: 0,
        //coords: {
        //    latitude: $scope.lat,
        //    longitude: $scope.longt
        //},
        events: {
            dragend: function(markerModel,eventname,mesg){
                $scope.msg='*Double Click to get current position info';
            },
            dblclick: function(markerModel,eventname,mesg) {
                $scope.lat=markerModel.position.k;
                $scope.longt = markerModel.position.D;
                $scope.msg ='*Please allow up to 10 seconds to get data';
                $scope.tb.getInfoList();
                }

        },
        options: {
            draggable: true,
            title: 'Map',
            animation: 2 // 1: BOUNCE, 2: DROP
        },
        data: $scope.msg
    };

    this.getInfoList = function () {
        var _this = this;

        return _this.maps.getvalueFromPosition($scope.lat, $scope.longt)
            .then(function (infos) {
                //return infos;
                $scope.census_basics = [];
                $scope.census_basics.push({ "Name": "Designated Place", "Value": infos[6] });
                $scope.census_basics.push({ "Name": "Division", "Value": infos[7] });
                $scope.census_basics.push({ "Name": "Region", "Value": infos[8] });
                $scope.census_basics.push({ "Name": "Tracts", "Value": infos[9] });
                $scope.census_basics.push({ "Name": "Latitude", "Value": $scope.lat });
                $scope.census_basics.push({ "Name": "Longitude", "Value": $scope.longt });
                $scope.census_leg = [];
                $scope.census_leg.push({ "Name": "Senate", "Value": infos[14] });
                $scope.census_leg.push({ "Name": "Congress", "Value": infos[0] });
                $scope.census_leg.push({ "Name": "State Lower", "Value": infos[4] });
                $scope.census_leg.push({ "Name": "State Upper", "Value": infos[5] });
                $scope.census_area = [];
                $scope.census_area.push({ "Name": "Zip Code", "Value": infos[3] });
                $scope.census_area.push({ "Name": "Urban Area", "Value": infos[2] });
                $scope.census_area.push({ "Name": "Microdata Area", "Value": infos[1] });
                $scope.census_area.push({ "Name": "Statistical Area", "Value": infos[10] });
                $scope.census_school = [];
                $scope.census_school.push({ "Name": "Counties", "Value": infos[11] });
                $scope.census_school.push({ "Name": "County Subdivision", "Value": infos[12] });
                $scope.census_school.push({ "Name": "Metropolitan Division", "Value": infos[13] });
                $scope.census_school.push({ "Name": "School Districts", "Value": infos[15] });


                $scope.map.center = {
                    latitude: $scope.lat,
                    longitude: $scope.longt
                };

                // map marker
                $scope.marker.coords = {
                    latitude: $scope.lat,
                    longitude: $scope.longt
                };

                $scope.$apply();

                $state.go('tabs.about', {});


                return true;
            }, function (errorMessage) {
                return false;
            });
    };

    this.getAddress = function () {
        var _this = this;
        return this.address.getCurrentPosition()
                    .then(function (position) {
                        $scope.lat = position.coords.latitude;
                        $scope.longt = position.coords.longitude;
                        $scope.map.center = {
                            latitude: $scope.lat,
                            longitude: $scope.longt
                        };

                        // map marker
                        $scope.marker.coords = {
                            latitude: $scope.lat,
                            longitude: $scope.longt
                        };

                        $scope.msg = 'The draggable marker is current location';

                        $scope.$apply();

                        $state.go('tabs.home', {});



                        return true;
                    })
                };


    
    this.getAddress();

}]
);
