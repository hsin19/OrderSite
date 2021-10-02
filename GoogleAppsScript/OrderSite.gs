class OrderSide {
    constructor(ss) {
      this._ss = ss;
    }
  
    createSystem() {
      this._createProductPage();
      this._createOrderPage();
      this._createCompletedOrderPage();
      this._createSellListPage()
      this._createSystemPage();
    }
  
    _createProductPage() {
      let shName = "Products";
      let headers = ["Product", "Price", "Stock", "Ordered", "Quantity on sale", "Image", "Status"];
      let sh = this._createSheet(shName, headers);
      let colStatus = sh.getRange("G2:G");
      let rule = SpreadsheetApp.newDataValidation()
        .requireValueInList(["Publish", "Delist", "Delete"])
        .setAllowInvalid(false)
        .build();
      colStatus.setDataValidation(rule);
      sh.getRange("1:1").protect().setWarningOnly(true);
      sh.getRange("1:1").setBackground("#e9ecef");
      sh.getRange("D:E").protect().setWarningOnly(true);
      sh.getRange("D:E").setBackground("#e9ecef");
    }
  
    _createOrderPage() {
      let shName = "Orders";
      let headers = ["Creation Time", "Products", "Quantity", "Subtotal", "Status", "Customer", "Phone", "Note"];
      let sh = this._createSheet(shName, headers);
      let colStatus = sh.getRange("E2:E");
      let rule = SpreadsheetApp.newDataValidation()
        .requireValueInList(["Unchecked", "Unpaid", "To ship", "Shipping", "Completed", "Cancellation"])
        .setAllowInvalid(false)
        .build();
      colStatus.setDataValidation(rule);
      sh.getRange("1:1").protect().setWarningOnly(true);
      sh.getRange("1:1").setBackground("#e9ecef");
    }
  
    _createCompletedOrderPage() {
      let shName = "Completed Orders";
      let headers = ["Creation Time", "Product", "Quantity", "Subtotal", "Status", "Customer", "phone", "note", "End Time"];
      let sh = this._createSheet(shName, headers);
      sh.protect().setWarningOnly(true);
    }
  
    _createSellListPage() {
      let shName = "SellList";
      let sh = this._ss.getSheetByName(shName);
      if (sh) this._ss.deleteSheet(sh);
      sh = this._ss.insertSheet(shName);
      sh.getRange(1, 1).setValue(`=QUERY(Products!A:G,"SELECT A,B,E,F WHERE A IS NOT NULL AND B>0 AND E>0 AND G='Publish' LABEL E 'Quantity'",1)`);
      sh.hideSheet();
      sh.protect().setWarningOnly(true);
    }
  
    _createSystemPage() {
      let shName = "System";
      let sh = this._ss.getSheetByName(shName);
      if (sh) this._ss.deleteSheet(sh);
      sh = this._ss.insertSheet(shName);
      let data = [`=QUERY({arrayformula(row(Products!G:G)), Products!G:G},"SELECT Col1 WHERE Col2='Delete'",0)`,
        `=QUERY({arrayformula(row(Orders!E:E)), Orders!E:E},"SELECT Col1,Col2 WHERE Col2 MATCHES'(Completed|Cancellation)'",0)`];
      sh.getRange(1, 1, 1, data.length).setValues([data]);
      sh.hideSheet();
      sh.protect().setWarningOnly(true);
    }
  
    _createSheet(name, headers) {
      let sh = this._ss.getSheetByName(name);
      if (sh) this._ss.deleteSheet(sh);
      sh = this._ss.insertSheet(name);
      sh.getRange(1, 1, 1, headers.length).setValues([headers]);
      sh.setFrozenRows(1);
      return sh;
    }
  
    addOrder(e) {
      if (!e) return false;
      const shName = "Orders";
      let sh = this._ss.getSheetByName(shName);
      let header = sh.getSheetValues(1, 1, 1, sh.getLastColumn())[0];
      let row = sh.getLastRow() + 1;
      let isEmpty = true;
      for (let i = 0; i < header.length; i++) {
        let item = ("" + header[i]).toLowerCase();
        if (item === "creation time") {
          let dateTime = Utilities.formatDate(new Date(), Session.getTimeZone(), "yyyy-MM-dd HH:mm");
          sh.getRange(row, i + 1).setValue(dateTime);
        } else if (item === "products" && Array.isArray(e[item])) {
          let r = row;
          const quantityIndex = header.indexOf("Quantity") + 1;
          for (const product of e[item]) {
            if (product.name && product.num) {
              sh.getRange(r, i + 1).setValue(product.name);
              sh.getRange(r, quantityIndex).setValue(product.num);
              r++;
              isEmpty = false;
            }
          }
          if (r - row > 1) {
            for (let j = 0; j < header.length; j++) {
              if (j !== i && j !== quantityIndex - 1) {
                sh.getRange(row, j + 1, r - row).merge();
              }
            }
          }
        } else if (item === "quantity") {
          continue;
        } else if (item === "status") {
          sh.getRange(row, i + 1).setValue("Unchecked");
        } else if (e[item]) {
          sh.getRange(row, i + 1).setValue(e[item]);
          isEmpty = false;
        }
      }
      if (isEmpty) {
        sh.deleteRow(row);
        return false;
      }
      return true;
    }
  
    deleteProduct(row) {
      row = +row;
      if (!Number.isInteger(row) || row <= 0) return;
      const shName = "Products";
      let sh = this._ss.getSheetByName(shName);
      sh.deleteRow(row);
    }
  
    endOrder(row, reduceStock = true) {
      row = +row;
      if (!Number.isInteger(row) || row <= 0) return;
      let shFrom = this._ss.getSheetByName("Orders");
      let shTo = this._ss.getSheetByName("Completed Orders");
      const length = shFrom.getLastColumn();
      const rowNum = shFrom.getRange(row, 1).getMergedRanges()[0]?.getNumRows() ?? 1;
  
      let toCopy = shFrom.getRange(row, 1, rowNum, length);
      let rowFrom = shTo.getLastRow() + 1;
      let toPaste = shTo.getRange(rowFrom, 1, rowNum, length);
      toCopy.copyTo(toPaste);
      if (reduceStock) {
        let data = toPaste.getValues();
        const shName = "Products";
        let sh = this._ss.getSheetByName(shName);
        let productList = sh.getRange(2, 1, sh.getLastRow() - 1).getValues();
        for (let col of data) {
          for (let i = 0; i < productList.length; i++) {
            if (productList[i][0] == col[1]) {
              let stock = sh.getRange(2 + i, 3).getValues();
              stock -= col[2];
              sh.getRange(2 + i, 3).setValue(stock);
              break;
            }
          }
        }
      }
      const dateTime = Utilities.formatDate(new Date(), Session.getTimeZone(), "yyyy-MM-dd HH:mm");
      shTo.getRange(rowFrom, length + 1, rowNum).merge().setValue(dateTime);
  
      shFrom.deleteRows(row, rowNum);
    }
  
    getSellList() {
      const shName = "SellList";
      let sh = this._ss.getSheetByName(shName);
      let data = sh.getDataRange().getValues();
      let header = data.shift();
      return data.map(e => e.reduce((acc, curr, index) => ({ ...acc, [header[index]]: curr }), {}));
    }
  
    fillProduct() {
      const shName = "Products";
      let sh = this._ss.getSheetByName(shName);
      let lastRow = sh.getLastRow();
      let template = sh.getRange("D2:E2");
      if (template.getFormulas()[0][0] !== `=SUMIF(Orders!B:B,"="&OFFSET($A$1,ROW()-1,0),Orders!C:C)`
        || template.getFormulas()[0][1] !== `=OFFSET($C$1,ROW()-1,0)-OFFSET($D$1,ROW()-1,0)`) {
        template.setValues([[`=SUMIF(Orders!B:B,"="&OFFSET($A$1,ROW()-1,0),Orders!C:C)`, `=OFFSET($C$1,ROW()-1,0)-OFFSET($D$1,ROW()-1,0)`]]);
      }
      template.autoFill(sh.getRange(2, 4, lastRow - 1, 2), SpreadsheetApp.AutoFillSeries.DEFAULT_SERIES);
    }
  }
  