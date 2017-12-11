sap.ui.define(["KapselStaNS/controller/BaseController",
	"sap/m/MessageBox"
], function(BaseController, MessageBox) {
	"use strict";
	var oModel;

	return BaseController.extend("KapselStaNS.controller.issue", {
		onInit: function() {

			oModel = this.getOwnerComponent().getModel("myDataModel");

		},
		onBeforeRendering: function() {

		},
		onAfterRendering: function() {
			this.getView().addStyleClass("background_default");

		},
		enterpallet: function() {
			var manual = this.getView().byId("__input0").getValue();
			var data = {
				"OrderList": []
			};
			var oModelJson = new sap.ui.model.json.JSONModel();
			oModelJson.setData(data);
			this.getView().setModel(oModelJson);
			var oData = oModelJson.getData();
			var that = this;

			if (this.getView().byId("__input0").getValue() !== "" && this.getView().byId("__input0").getValue() !== null) {

				oModel.read("/OrderList?$filter=Pallet_ID%20eq%20%27" + manual + "%27", null, null, false, function(oEvent) {
					$.each(oEvent.results, function(i, item) {
						oData.OrderList.push({
							"Order_ID": item.Order_ID,
							"Order_NAME": item.Order_NAME,
							"Quantity": item.Quantity,
							"PRODUCTID": item.PRODUCTID,
							"PRICE": item.PRICE,
							"WEIGHT": item.WEIGHT
								/*"Pallet_ID": item.Pallet_ID*/
						});
					});

					if (oEvent.results.length === 0) {
						MessageBox.error(manual + " pallet not found.");
					} else {
						that.getView().getModel().setData(oData);
					}
				}, function(oError) {
					var errorObj1 = JSON.parse(oError.response.body);
					MessageBox.error(
						"Pallet not found." + errorObj1.error.message.value.substr(24)
					);
				});
			} else {
				sap.m.MessageBox.show("Invalid Pallet ID.Please Try Again");
			}

		},
		//Scan Pallet and show containing items
		scanPallet: function() {
			var data = {
				"OrderList": []
			};
			var oModelJson = new sap.ui.model.json.JSONModel();
			oModelJson.setData(data);
			this.getView().setModel(oModelJson);
			var oData = oModelJson.getData();
			var that = this;
			try {
				cordova.plugins.barcodeScanner.scan(function(result) {
					if (result.text !== null && result.text !== "") {

						oModel.read("/OrderList?$filter=Pallet_ID%20eq%20%27" + result.text + "%27", null, null, false, function(oEvent) {
							$.each(oEvent.results, function(i, item) {
								oData.OrderList.push({
									"Order_ID": item.Order_ID,
									"PRODUCTID": item.PRODUCTID,
									"Order_NAME": item.Order_NAME,
									"PRICE": item.PRICE,
									"WEIGHT": item.WEIGHT,
									"Quantity": item.Quantity
										/*"Pallet_ID": item.Pallet_ID*/
								});
							});
							if (oEvent.results.length === 0) {
								MessageBox.error(result.text + " pallet not found.");
							} else {
								that.getView().getModel().setData(oData);
							}
						}, function(oError) {
							var errorObj1 = JSON.parse(oError.response.body);
							MessageBox.error(
								"Pallet not found." + errorObj1.error.message.value.substr(24)
							);
						});

					} else {
						sap.m.MessageBox.show("Please try again. Barcode not Captured.");
					}
				}, function(error) {
					sap.m.MessageBox.show("Barcode scanning failed: ", error, "");
				});
			} catch (e) {
				sap.m.MessageBox.show(e.message + "Cordova plugin is not available.", "");
			}
		},

		submitItem: function() {
			var oModelData = this.getView().getModel();
			var oData = oModelData.getData();
			var sucess = 0;
			var fail = 0;
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

			for (var i = 0; i < oData.OrderList.length; i++) {

				oModel.read("/inboundItemList?$filter=Order_NAME%20eq%20%27" + oData.OrderList[i].Order_NAME + "%27", null, null, false, function(
					oEvent) {
					if (oEvent.results.length === 1) {
						oData.OrderList[i].Quantity += oEvent.results[0].Quantity;
						oData.OrderList[i].PRICE = (parseFloat(oData.OrderList[i].PRICE) + parseFloat(oEvent.results[0].PRICE)).toString();
						oData.OrderList[i].WEIGHT = (parseFloat(oData.OrderList[i].WEIGHT) + parseFloat(oEvent.results[0].WEIGHT)).toString();
						oModel.update("/inboundItemList(" + oEvent.results[0].Order_ID + ")", oData.OrderList[i], null, function() {
							++sucess;
						}, function(oError) {
							++fail;

						});
					} else {
						oModel.create("/inboundItemList", oData.OrderList[i], null, function() {
							++sucess;
						}, function() {
							++fail;

						});
					}
				});
			}

			if (sucess !== 0 && fail === 0) {
				var totalOrder = oData.OrderList.length;
				oData = null;
				this.getView().getModel().setData(oData);
				MessageBox.success(sucess + " Order placed out of " + totalOrder + ".", {
					actions: [
						MessageBox.Action.OK
					],
					onClose: function(oAction) {
						if (oAction === "OK") {
							//oRouter.navTo("OrderList");
						}
					}
				});
			} else {
				MessageBox.error(fail + " out of " + oData.OrderList.length + " order fail.");
			}
		},
		Display_Manual_Entry: function() {
			var vl = this.getView().byId("__form1");
			vl.setVisible(true);
		}
	});
});