// This is a JavaScript file
var console = window.console;

require("./../lib/material-icons/material-icons.css");
require("./../lib/bootstrap-material-datetimepicker/css/bootstrap-material-datetimepicker.css");
require("./../css/style.css");

require("materialize");
require("./../lib/fix-materialize-dropdown/dropdown.js");
require("imports?jQuery=jquery&moment=moment!./../lib/bootstrap-material-datetimepicker/js/bootstrap-material-datetimepicker.js");

var path = require("imports?define=>false&this=>window!./../lib/path.js/path.js");

var testing = require("./testing.js");
var schemas = require("./initSchema.js");
var user = require("./user.js");
var barcodeScanner = require("./barcodeScanner.js");

var view = {
  "": require("./view/index.js"),
  index: require("./view/index.js"),
  settings: require("./view/settings.js"),
  user: require("./view/user.js"),
}

var fileSystem = require("./fileSystem");

var isTesting = false;
// isTesting = true;

if(typeof device === 'undefined'){
  $(document).on("deviceready", onDeviceReady);
} else {
  onDeviceReady();
}

/////////////////////////////// エントリポイント //////////////////////////////
function onDeviceReady() {
  $(function() {
    if (!String.prototype.startsWith) {
      String.prototype.startsWith = function(searchString, position){
        position = position || 0;
        return this.substr(position, searchString.length) === searchString;
      };
    }

    if (isTesting) {
      testing.prepare();
    }

    schemas.init();
    user.init();
    fileSystem.init();

    /////////////////////////////// QRコード読み取り ///////////////////////////////

    // 「スキャンする」を押したときのイベント
//    $(document).off("click", "#ScanButton");
    $(document).on("click", "#ScanButton", function() {
        barcodeScanner.scan();
        return false;
    });

    if (device.platform === "iOS") {
      $("nav").addClass("ios-nav");
    }

    /////////////////////////////////// 一覧表示 ////////////////////////////////////
    var page = path.parse(location.href).base.split(".")[0];
    view[page].init();

    window.navigator.splashscreen.hide();
  });
};