jQuery.sap.require("KapselStaNS.devapp");
sap.ui.define([
		'jquery.sap.global',
		'KapselStaNS/controller/BaseController',
		'sap/m/MessageToast',
		'sap/m/MessageBox'
	],
	function(jQuery, BaseController, MessageToast, MessageBox) {
		"use strict";
		var voiceText = [];
		var oModel;
		var dialog;

		return BaseController.extend("KapselStaNS.controller.settings", {

			//One time Initialization of Model
			onInit: function() {var a = this.getView().byId("test123");
				dialog = new sap.m.BusyDialog({
					text: 'Recording...',
					title: 'Speech Recognition'
				});
				oModel = this.getOwnerComponent().getModel("myDataModel");
				this.getView().setModel(oModel);
				$(window).keydown(function(e) {
					var keycode = ((typeof e.keyCode !='undefined' && e.keyCode) ? e.keyCode : e.which);
					if (keycode === 27)
						a.setVisible(false);
				});
			},

			onSuccessCall: function(contact) {

			},

			onErrorCall: function(contactError) {
				sap.m.MessageBox.show("Call to Customer failed ", sap.m.MessageBox.Icon.ERROR, "Call Customer");
			},
			callContact: function(oEvent) {
				
			sap.m.MessageBox.show("Customer Care  :  +91 012345678 ", sap.m.MessageBox.Icon.ERROR, "Call Customer Care for More Information");
				var custPhone = "7760666559";
				window.plugins.CallNumber.callNumber(this.onSuccessCall, this.onErrorCall, custPhone);
			},

			//Hiding The panel in View as it is empty,will show when list pops up
			onAfterRendering: function() {
				this.getView().addStyleClass("background_default");
				var wPanelId = this.byId("warehousePanel");
				wPanelId.setVisible(false);
			},

			//Get the warehouses names by selected location and bind it to list and display the Panel
			displayList: function(oEvt) {
				var that = this;
				var id = oEvt.getSource().getId().split("--");
				id = id[1];
				var selectedLocation;
				var comboValue = this.byId("mcb").getSelectedKey();
				var recValue = this.getView().byId("__input0").getValue();
				if (id === "mcb") {
					selectedLocation = comboValue;
				} else if (id === "voice_btn") {
					selectedLocation = recValue;
				}
				var oModelJson = new sap.ui.model.json.JSONModel();
				oModel.read("/LOCATIONS?$filter=LOCATION%20eq%20%27" + selectedLocation + "%27", null, null, false, function(odata) {
					oModelJson.setData(odata);
				}, function(oError) {
					var errorObj1 = JSON.parse(oError.response.body);
					MessageBox.error(
						"Location Not Found." + errorObj1.error.message.value.substr(24)
					);
				});
				that.getView().byId("idList").setModel(oModelJson);
				var wPanelId = this.byId("warehousePanel");
				wPanelId.setVisible(true);
			},

			//update the Database corresponding to the Location and warehouses names selected by the User
			submitData: function() {
				var messageText = "";
				var selectedItems = this.byId("mcb").getSelectedKey();
				var oList = this.byId("idList");
				var items = oList.getSelectedItems();
				if (selectedItems.length === 0 && items.length === 0) {
					messageText = "Please Choose any Options";
					MessageToast.show(messageText, {
						width: "auto"
					});
				} else {
					for (var i = 0; i < items.length; i++) {
						var item = items[i];
						var context = item.getBindingContext();
						var obj = context.getProperty(null, context);
						var oEntry = {};
						oEntry.DASID = "A638029";
						oEntry.NAME = obj.NAME;
						oEntry.LOCATION = obj.LOCATION;
						oModel.create("/WAREHOUSELOCATIONS", oEntry, null, function() {
							messageText += "Successully Granted Access to Warehouse : ";
							messageText += "'" + obj.NAME + "'";
							messageText += "\n";
						}, function() {
							messageText += "Access already Granted For " + obj.NAME;
							messageText += "\n";
						});
					}
					MessageToast.show(messageText, {
						width: "auto"
					});
				}
			},

			//Speech recognition Starts,as we have used two speech,one is for desktop and Mobile
			rec: function() {
				voiceText = this.getView().byId("__input0");
				try {
					dialog.open();
					var isCordovaApp = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;
					if (isCordovaApp) {
						this.recMobileCordova();
					} else {
						this.recDesktop();
					}
				} catch (e) {
					dialog.close();
					alert("Please try agian");
				}
			},

			//Speech Recognition for Desktop using Webkit which doesn't work for Mobile
			recDesktop: function() {
				var speechRecognizer = new webkitSpeechRecognition();
				voiceText.setValue("Recording");
				speechRecognizer.lang = "en-IN";
				speechRecognizer.interimResults = false;
				speechRecognizer.maxAlternatives = 5;
				speechRecognizer.start();
				speechRecognizer.onresult = function(event) {
					voiceText.setValue(event.results[0][0].transcript);
					dialog.close();
				};
				speechRecognizer.onend = function() {
					dialog.close();
					if (voiceText.getValue() === "Recording") {
						MessageBox.alert(
							"Didn't get You! Please try again."
						);
						voiceText.setValue("");
					}
				};
			},
				gotochat: function() {
			this.getRouter().navTo("chatbotview");
		},

			//speech recognition for Mobile Cordova as it doen't support Desktop Platforms
			recMobileCordova: function() {
				var recognition = [];
				voiceText.setValue("Recording starts after Beep");
				document.addEventListener("deviceready", function() {
					recognition = new SpeechRecognition();
					recognition.onresult = function(event) {
						voiceText.setValue(event.results[0][0].transcript);
						dialog.close();
					};
					recognition.onend = function() {
						dialog.close();
					};
					recognition.onerror = function() {
						dialog.close();
						MessageBox.alert(
							"Didn't get You! Please try again."
						);
					};
				}, false);
				recognition.start();
			}
		});
	});