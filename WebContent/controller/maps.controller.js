sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/Fragment",
	"KapselStaNS/controller/BaseController"
], function(jQuery, Fragment, BaseController) {
	"use strict";
	var oModel;
	var xyz;
	var address = [];
	var pallet = [];
	var oModelJson = new sap.ui.model.json.JSONModel();
	var i = "";
	var distanc = [];
	var xmlDoc = "";
	var lat = [];
	var content = [];
	var CombinedLL = "";
	var long = [];
	var lat2 = "";
	var long2 = "";
	var loc = "";
	var lowestDistance = [];
	var index;
	var directionsService = new google.maps.DirectionsService();
	var directionsDisplay = new google.maps.DirectionsRenderer();
	return BaseController.extend("KapselStaNS.controller.maps", {

		onInit: function() {
			oModel = this.getOwnerComponent().getModel("myDataModel");
			this.getView().setModel(oModel);
			loc = window.localStorage.Location;
			lat2 = window.localStorage.Latitude;
			long2 = window.localStorage.Longitude;
		},
		onAfterRendering: function() {
			this.getView().addStyleClass("background_default");
			this.initMap();
		},
		EmailTrigger: function() {
			sap.m.URLHelper.triggerEmail("madhukumar.j@atos.net", "Stock Replenishment",
				"Dear Procurement Manager,,\n\n" +
				" The stock of pallets reached minimum quanity point, please order approriate stock for replenishment\n\n Regards,\n Mohammed Safwan"
			);
		},
		//Map Starts
		initMap: function() {
			var CombinedLL = new google.maps.LatLng(lat2, long2);
			console.log(loc);
			//var abc=this.getView().byId("map_canvas").getDomRef();
			var directionsService = new google.maps.DirectionsService;
			var directionsDisplay = new google.maps.DirectionsRenderer;
			var map = new google.maps.Map(this.getView().byId("map_canvas").getDomRef(), {
				zoom: 7,
				center: CombinedLL
			});
			var abc = this.getView().byId("map_canvas").getDomRef();

			var oModelJson = new sap.ui.model.json.JSONModel();
			oModel.read("/GOODSISSUE?$filter=LOCATION%20eq%20%27" + loc + "%27", null, null, false, function(odata) {
				oModelJson.setData(odata);
			}, function(oError) {

			});

			var Quantity = oModelJson.oData.results[0].QUANTITY;
			Location = oModelJson.oData.results[0].LOCATION;
			if (Quantity <= 10) {
				this.getView().ById("NearBy").setVisible = true;
				this.getView().ById("email").setVisible = true;
			}

			var contentString = '<b><div> Location : ' + Location + '</div>' + '<div> Quantity : ' + Quantity + '</div></b>';

			var infowindow = new google.maps.InfoWindow({
				content: contentString
			});

			var marker = new google.maps.Marker({
				position: CombinedLL,
				map: map,
				title: 'Mumbai Warehouse'
			});
			infowindow.open(map, marker);
			marker.addListener('click', function() {
				infowindow.open(map, marker);
			});
			{
				directionsDisplay.setMap(map);
				var onChangeHandler = function() {
					calculateAndDisplayRoute(directionsService, directionsDisplay);
				};
			}

			function calculateAndDisplayRoute(directionsService, directionsDisplay) {
				directionsService.route({
					origin: "Bengaluru",
					destination: "Chennai",
					travelMode: 'DRIVING'
				}, function(response, status) {
					if (status === 'OK') {
						directionsDisplay.setDirections(response);
					} else {
						window.alert('Directions request failed due to ' + status);
					}
				});
			}
		},
		rad: function(x) {
			return x * Math.PI / 180;
		},

		findnearb: function() {
			//Getting Cities
			oModel.read("/REPORTS?$filter=CITY%20ne%20%27" + Location + "%27", null, null, false, function(odata) {
				oModelJson.setData(odata);
			}, function() {

			});

			for (i = 0; i < oModelJson.oData.results.length; i++) {
				address[i] = oModelJson.oData.results[i].CITY;
				pallet[i] = oModelJson.oData.results[i].PALLETQUANTITY;
				lat[i] = oModelJson.oData.results[i].LATITUDE;
				long[i] = oModelJson.oData.results[i].LONGITUDE;
			}
			for (i = 0; i < address.length; i++) {
				this.distanc2(i);
			}
		},

		distanc2: function(i) {
			var R = 6371; // Radius of the earth in km
			var dLat = this.rad(lat2 - lat[i]); // deg2rad below
			var dLon = this.rad(long2 - long[i]);
			var a =
				Math.sin(dLat / 2) * Math.sin(dLat / 2) +
				Math.cos(this.rad(lat[i])) * Math.cos(this.rad(lat2)) *
				Math.sin(dLon / 2) * Math.sin(dLon / 2);
			var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
			var d = R * c; // Distance in km
			distanc[i] = d;
			lowestDistance = distanc;
		},

		NearestWarehouseCalc: function() {
			for (i = 0; i < address.length; i++) {
				var minimum = lowestDistance[0];
				index = 0;
				var position = 1;
				for (var j = 1; j < lowestDistance.length; j++) {
					if (lowestDistance[j] < lowestDistance[index]) {
						minimum = lowestDistance[j];
						index = j;
					}
				}
			}
		},

		onPersonalizationDialogPress: function(oEvent) {
			this.findnearb();
			this.NearestWarehouseCalc();
			this.maps();
		},

			maps: function() {
			this.getView().byId("map_canvas").addStyleClass("myMap");
			var m = 12.9538477;
			var n = 77.3507357;
			this.initialized = true;
			this.geocoder = new google.maps.Geocoder();
			var latlng = new google.maps.LatLng(m, n);
			var contentString = '<b><div> Location : ' + loc + '</div>' + '<div> Quantity : ' + pallet + '</div></b>';
			var infowindow = new google.maps.InfoWindow({content: contentString});
			
			var marker = new google.maps.Marker({
				position: latlng,
				title: "Bangalore",
				animation: google.maps.Animation.BOUNCE
			});
			
			var mapOptions = {
				center: latlng,
				zoom: 15,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			};
			this.map = new google.maps.Map(this.getView().byId("map_canvas").getDomRef(),mapOptions);
			directionsDisplay.setMap(this.map);
			this.calculateAndDisplayRoute(directionsService, directionsDisplay);
	},
		calculateAndDisplayRoute: function(directionsService,directionsDisplay)  {
			directionsService.route({
          origin: loc,
          destination: address[index],
          travelMode: 'DRIVING'
        }, function(response, status) {
          if (status === 'OK') {
            directionsDisplay.setDirections(response);
          } else {
            alert('Directions request failed due to ' + status);
          }
        });
      

		}

	});
});