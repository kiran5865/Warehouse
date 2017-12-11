sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/Fragment",
	"KapselStaNS/controller/BaseController",
], function(jQuery, Fragment, BaseController) {
	"use strict";
	var oModel;
	return BaseController.extend("KapselStaNS.controller.report", {

		onInit: function() {
			sap.ui.core.BusyIndicator.show();

			oModel = this.getOwnerComponent().getModel("myDataModel");
			this.getView().setModel(oModel);

			var oVizFrame = this.oVizFrame = this.getView().byId("idVizFrame");
			oVizFrame.setVizProperties({
				legend: {
					title: {
						visible: false
					}
				},
				title: {
					visible: true,
					text: "Reports"
				}
			});

			var oPopOver = this.getView().byId("idPopOver");
			oPopOver.connect(oVizFrame.getVizUid());
		},

		onAfterRendering: function() {
			this.getView().addStyleClass("background_default");
			sap.ui.core.BusyIndicator.hide();
		},
		
		EmailTrigger: function() {
			sap.m.URLHelper.triggerEmail("madhukumar.j@atos.net", "Stock Replenishment",
				"Dear Procurement Manager,,\n\n" +
				" The stock of pallets reached minimum quanity point, please order approriate stock for replenishment\n\n Regards,\n Mohammed Safwan"
			);
		},
		
		onMapsPress: function() {
			this.getRouter().navTo("maps");
		}

	});
});