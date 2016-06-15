// This is a JavaScript file
var console = window.console;

var my = {
  init: require("./initSchema"),
}

module.exports = {
  // QRコードを読み取る
  scan: function(barcodes) {
    var self = this;
    barcodes = barcodes || [];
    // BarcodeScannerプラグインを利用してスキャン
    window.cordova.plugins.barcodeScanner.scan(
      // 成功時に実行されるコールバック（キャンセル時も含む）
      function(result) {
        if (result.cancelled) {
          if (barcodes.length > 0) {
            $("#save-qrcode").data("barcodes", barcodes).openModal();
          }
          return;
        }

        barcodes.push(result.text.trim());
        // 分割されているかどうか
        $("#camera-continue").data("barcodes", barcodes).openModal();
      },
      // エラー時に実行されるコールバック
      function(error) {
        console.error(error);
        Materialize.toast('ふぇぇ、エラーだよ...ごめんなさい...', 4000);
      },
      {
          "prompt" : "スキャン範囲にQRコードを写してね。", // supported on Android only
          "formats" : "QR_CODE", // default: all but PDF_417 and RSS_EXPANDED
          "orientation" : "landscape",
      }
    );
  },

}