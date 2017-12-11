sap.ui.define(["KapselStaNS/controller/BaseController"], function(BaseController) {
	"use strict";
	return BaseController.extend("KapselStaNS.controller.appHome", {
		onInit:function(){
			
			
		},

		onAfterRendering: function() {
			this.getView().addStyleClass("background_default");

		},
		report: function() {
			this.getRouter().navTo("report");
		},

		settings: function() {
			this.getRouter().navTo("settings");
		},

		issue: function() {
			this.getRouter().navTo("issue");
		},

		receipt: function() {
			this.getRouter().navTo("receipt");
		},
			dynamic: function() {
			this.getRouter().navTo("dynamicPallet");
		}
	});
});