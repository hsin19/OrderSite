function onOpen() {
    _menu();
}

function onEdit(e) {
    const shName = e.range.getSheet().getName();
    if (shName == "Products" && e.value == "Delete") _productsStatusCheck();
    else if (shName == "Orders" && (e.value == "Cancellation" || e.value == "Completed")) _ordersStatusCheck();
    else if (shName == "Products") {
        let orderSite = new OrderSide(SpreadsheetApp.getActive());
        orderSite.fillProduct();
    }
}

function doGet(e) {
    let orderSite = new OrderSide(SpreadsheetApp.getActive());
    let sellList = orderSite.getSellList();
    return ContentService.createTextOutput(JSON.stringify(sellList)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
    let data = JSON.parse(e.postData.contents);
    let orderSite = new OrderSide(SpreadsheetApp.getActive());
    let result = orderSite.addOrder(data);
    if (result) result = "Thank you for your order, we will confirm the order with you within 3 working days.";
    else result = "The order was unsuccessful due to some errors.";
    return ContentService.createTextOutput(result);
}

function _menu() {
    let menu = SpreadsheetApp.getUi().createMenu("Order Site");
    if (PropertiesService.getScriptProperties().getProperty("initialization") !== "done")
        menu.addItem("Create System", "_create");
    else {
        menu.addItem("Check System", "_check");
    }
    menu.addItem("About", "_about");
    menu.addToUi();
}

function _create() {
    let orderSite = new OrderSide(SpreadsheetApp.getActive());
    orderSite.createSystem();
    PropertiesService.getScriptProperties().setProperty("initialization", "done");
    _menu();
}

function _check() {
    _productsStatusCheck();
    _ordersStatusCheck();
    let orderSite = new OrderSide(SpreadsheetApp.getActive());
    orderSite.fillProduct();
}

function _about() {
    let html = HtmlService.createHtmlOutputFromFile("about").setWidth(300).setHeight(150);
    SpreadsheetApp.getUi().showModalDialog(html, "About");
}

function _productsStatusCheck() {
    let shName = "System";
    let sh = SpreadsheetApp.getActive().getSheetByName(shName);
    let deleteProductList = sh.getRange("A:A").getDisplayValues();
    if (deleteProductList[0][0] != "#N/A") {
        deleteProductList = deleteProductList.filter(item => item[0]).map(item => item[0]);
        let ui = SpreadsheetApp.getUi();
        let response = ui.alert(
            "Are you sure you wnt to delete " + deleteProductList.length + " product?",
            ui.ButtonSet.YES_NO
        );
        if (response == ui.Button.YES) {
            let orderSite = new OrderSide(SpreadsheetApp.getActive());
            for (let i = deleteProductList.length - 1; i >= 0; i--) {
                orderSite.deleteProduct(deleteProductList[i]);
            }
        }
    }
}

function _ordersStatusCheck() {
    let shName = "System";
    let sh = SpreadsheetApp.getActive().getSheetByName(shName);
    let moveOrdersList = sh.getRange("B:C").getDisplayValues();
    if (moveOrdersList[0][0] != "#N/A") {
        moveOrdersList = moveOrdersList.filter(item => item[0]);
        let ui = SpreadsheetApp.getUi();
        let response = ui.alert(
            "Are you sure you wnt to complete/cancel " + moveOrdersList.length + " order?",
            ui.ButtonSet.YES_NO
        );
        if (response == ui.Button.YES) {
            let orderSite = new OrderSide(SpreadsheetApp.getActive());
            for (let i = moveOrdersList.length - 1; i >= 0; i--) {
                orderSite.endOrder(moveOrdersList[i][0], moveOrdersList[i][1] == "Completed");
            }
        }
    }
}
