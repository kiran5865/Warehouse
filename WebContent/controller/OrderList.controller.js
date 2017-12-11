sap.ui.define([
	"KapselStaNS/controller/BaseController"
], function(BaseController) {
	"use strict";

	return BaseController.extend("KapselStaNS.controller.OrderList", {

			onInit: function() {
			var oModel = oModel = this.getOwnerComponent().getModel("myDataModel");
			oModel.refresh(true);
			this.getView().setModel(oModel);
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("OrderList").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
		},
		
		handleRouteMatched: function(oEvent) {
			var model = this.getView().getModel();
			model.refresh();
		}
	});

});