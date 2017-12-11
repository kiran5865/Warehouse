sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";
var oModel;
var location="";
var lat="";
var long="";
var login=0;
var oModelJson = new sap.ui.model.json.JSONModel();
	return Controller.extend("KapselStaNS.controller.Login", {
		onInit:function(){
			this.getView().addStyleClass("background_default");
			oModel = this.getOwnerComponent().getModel("myDataModel");
			this.getView().setModel(oModel);
		},
		nav: function() {
			var EmployeeNumber = this.getView().byId("inpLogin").getValue();
			var password = this.getView().byId("inpPWD").getValue();
			if (EmployeeNumber == "" || password == "") {
				alert("Enter the credentials");
				return;

			}
			if (password != "Atos@123") {
				alert("Password is wrong")
				return;
			}
			
				oModel.read("/LOGIN('"+EmployeeNumber+"')",null,null,false,function(odata) {
					oModelJson.setData(odata);
				location=	oModelJson.oData.LOCATION;
				lat=oModelJson.oData.LATITUDE;
				long=oModelJson.oData.LONGITUDE;
				login=1;
			
				},function(oError)
				{
					alert("Dasid is wrong, try again!!!!!");
					return;
				}); 
if(login==1)
{			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("appHome");
			window.localStorage.setItem("Location", location);
			window.localStorage.setItem("Latitude",lat);
			window.localStorage.setItem("Longitude",long);
		}
		}

	});

});