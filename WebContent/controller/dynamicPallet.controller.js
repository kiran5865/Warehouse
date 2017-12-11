sap.ui.define([
	"KapselStaNS/controller/BaseController",
	"sap/m/MessageBox",
	"sap/ui/core/Fragment"
], function(BaseController, MessageBox, Fragment) {
	"use strict";
	var sno = 1;
	var oModel;
	return BaseController.extend("KapselStaNS.controller.dynamicPallet", {

		//Bind model with the view
		onInit: function() {
	
			oModel = this.getOwnerComponent().getModel("myDataModel");
			this.getView().addStyleClass("background_default");
			var data = {
				"OrderCollection": []
			};
			this.addPallet();
			var JsonModel = new sap.ui.model.json.JSONModel();
			JsonModel.setData(data);
			this.getView().setModel(JsonModel);
		},

		//Add scan order to the selected pallet
		addOrder: function() {
			var that = this;
			try {
				cordova.plugins.barcodeScanner.scan(function(result) {
					that.addProduct(result,that);
				}, function(error) {
					sap.m.MessageBox.show("Barcode scanning failed: ", error, "");
				});
			} catch (e) {
				sap.m.MessageBox.show(e.message + "Cordova plugin is not available.", "");
			}
		},
		
		addOrderbyTextbox: function() {
			var pallet = this.byId("inputProductid");
			var result = {
							text: pallet.getValue(), 
							format: "txtBox"
						};
			this.addProduct(result,this);
		},
		
		//adding product to pallet
		addProduct: function(result,that) {
			var JsonModel = that.getView().getModel();
			var oData = JsonModel.getData();
			var qtyFlag = 0;
			if (result.text !== null && result.text !== "") {
						oModel.read("/PRODUCTTABLE?$filter=PRODUCTID%20eq%20%27" + result.text + "%27", null, null, false, function(
							oEvent) {
							$.each(oEvent.results, function(j, item) {
								for (var i = 0; i < oData.OrderCollection.length; i++) {
									if (oData.OrderCollection[i].PRODUCTID === result.text && oData.OrderCollection[i].Pallet_ID === that.byId("pallet")._getSelectedItemText()) {
										++oData.OrderCollection[i].Quantity;
										oData.OrderCollection[i].PRICE = (parseFloat(oData.OrderCollection[i].PRICE) + parseFloat(item.PRICE)).toString();
										oData.OrderCollection[i].WEIGHT = (parseFloat(oData.OrderCollection[i].WEIGHT) + parseFloat(item.WEIGHT)).toString();
										qtyFlag = 1;
										break;
									}
								}
								if (qtyFlag === 0) {
									oData.OrderCollection.push({
										"Order_ID": sno++,
										"PRODUCTID": item.PRODUCTID,
										"Order_NAME": item.PRODUCTNAME,
										"PRICE": item.PRICE,
										"WEIGHT": item.WEIGHT,
										"Quantity": 1,
										"Pallet_ID": that.byId("pallet")._getSelectedItemText()
									});
								}
							});
							if (oEvent.results.length === 0) {
								MessageBox.error(result.text + " item not found.");
							} else {
								JsonModel.setData(oData);
							}
						}, function(oError) {
							var errorObj1 = JSON.parse(oError.response.body);
							MessageBox.error(
								"Item not found." + errorObj1.error.message.value.substr(24)
							);
						});
					} else {
						sap.m.MessageBox.show("Please try again. Barcode not Capture.");
					}	
		},

		//add pallet for order
		addPallet: function() {
			var oDate = new Date();
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "YYYYMMDDHHMMSSmm" });   
			var dateFormatted = dateFormat.format(oDate);
			var pallet = this.byId("pallet");
			var palletItem = new sap.ui.core.Item({
				text: dateFormat.format(new Date())
			});
			pallet.addItem(palletItem);
			pallet.setSelectedItem(palletItem);
		},

		//reset pallet tp pallet 1
		resetPallet: function() {
			var pallet = this.byId("pallet");
			sno = 1;
			pallet.removeAllItems();
			this.addPallet();
		},

		//delete order from pallet
		deleteOrder: function(oEvent) {
			var path = oEvent.getSource().getBindingContext().getPath();
			var oModelData = this.getView().getModel();
			var oData = oModelData.getData();
			oData.OrderCollection.splice(path.slice(17), 1);
			this.getView().getModel().setData(oData);
		},

		//push all the order into the HANA MDC using OData service
		submitOrder: function(oEvent) {
			var oModelData = this.getView().getModel();
			var oData = oModelData.getData();
			var sucess = 0;
			var fail = 0;
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			for (var i = 0; i < oData.OrderCollection.length; i++) {
				oModel.create("/OrderList", oData.OrderCollection[i], null, function() {
					++sucess;
				}, function() {
					++fail;
				});
			}
			if (sucess !== 0 && fail === 0) {
				var totalOrder = oData.OrderCollection.length;
				oData.OrderCollection = [];
				this.getView().getModel().setData(oData);
				this.resetPallet();
				MessageBox.success(sucess + " Order placed out of " + totalOrder + ".", {
					actions: [
						MessageBox.Action.OK
					],
					onClose: function(oAction) {
						if (oAction === "OK") {
							oRouter.navTo("OrderList");
						}
					}
				});
			} else {
				MessageBox.error(fail + " out of " + oData.OrderCollection.length + " order fail.");
			}
		}
	});
});