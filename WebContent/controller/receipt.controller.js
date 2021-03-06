sap.ui.define(["KapselStaNS/controller/BaseController",
	"sap/m/MessageBox"
], function(BaseController, MessageBox) {
	"use strict";
	var oModel;

	return BaseController.extend("KapselStaNS.controller.receipt", {

		onInit: function() {
			oModel = this.getOwnerComponent().getModel("myDataModel");

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
									"Order_NAME": item.Order_NAME,
									"Quantity": item.Quantity,
									"PRODUCTID": item.PRODUCTID,
									"PRICE": item.PRICE,
									"WEIGHT": item.WEIGHT
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

		Display_Manual_Entry: function() {
			var vl = this.getView().byId("__form1");
			vl.setVisible(true);
		},

		submitItem: function() {
			var oModelData = this.getView().getModel();
			var oData = oModelData.getData();
			var sucess = 0;
			var fail = 0;
			var updateFail;
			var oEventInbound;
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			for (var i = 0; i < oData.OrderList.length; i++) {

				updateFail = 0;
				oModel.read("/outboundItemsList?$filter=Order_NAME%20eq%20%27" + oData.OrderList[i].Order_NAME + "%27", null, null, false,
					function(oEvent) {
						oModel.read("/inboundItemList?$filter=Order_NAME%20eq%20%27" + oData.OrderList[i].Order_NAME + "%27", null, null, false,
							function(oEventRead) {
								oEventRead.results[0].Quantity -= oData.OrderList[i].Quantity;
								oEventRead.results[0].PRICE = (parseFloat(oEventRead.results[0].PRICE) - parseFloat(oData.OrderList[i].PRICE)).toString();
								oEventRead.results[0].WEIGHT = (parseFloat(oEventRead.results[0].WEIGHT) - parseFloat(oData.OrderList[i].WEIGHT)).toString();
								oEventInbound = oEventRead;
							});
						if (oEvent.results.length === 1 && oEventInbound.results[0].Quantity >= 0) {
							oEvent.results[0].Quantity += oData.OrderList[i].Quantity;
							oEvent.results[0].PRICE = (parseFloat(oEvent.results[0].PRICE) + parseFloat(oData.OrderList[i].PRICE)).toString();
							oEvent.results[0].WEIGHT = (parseFloat(oEvent.results[0].WEIGHT) + parseFloat(oData.OrderList[i].WEIGHT)).toString();
							oModel.update("/outboundItemsList(" + oEvent.results[0].Order_ID + ")", oEvent.results[0], null, function() {
								sucess += 0.5;
							}, function(oError) {
								fail += 0.5;
								++updateFail;
							});
						} else if (oEventInbound.results[0].Quantity >= 0) {
							oModel.create("/outboundItemsList", oData.OrderList[i], null, function() {
								sucess += 0.5;
							}, function() {
								fail += 0.5;
								++updateFail;
							});
						}
						if (updateFail === 0 && oEventInbound.results[0].Quantity >= 0) {
							oModel.update("/inboundItemList(" + oEventInbound.results[0].Order_ID + ")", oEventInbound.results[0], null, function() {
								sucess += 0.5;
							}, function(oError) {
								fail += 0.5;
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
		}
	});
});