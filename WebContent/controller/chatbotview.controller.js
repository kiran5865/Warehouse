sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/Fragment",
	"KapselStaNS/controller/BaseController"
], function(jQuery, Fragment, BaseController) {
	"use strict";
	return BaseController.extend("KapselStaNS.controller.chatbotview", {

		onInit: function() {

		},
		onAfterRendering: function() {
			this.getView().addStyleClass("background_default");
		}
	});
});