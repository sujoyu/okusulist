// This is a JavaScript file
var console = window.console;

var my = {
  init: require("./../initSchema"),
  fileSystem: require("./../fileSystem"),
  barcodeScanner: require("./../barcodeScanner")
}

var dataFormat = require("./../dataFormat");

var Promise = require("es6-promise-polyfill").Promise;

module.exports = {
  init: function() {
    var self = this;

    $('.modal-trigger').leanModal();
    Materialize.updateTextFields();

    $("#export").click(function() {
      my.init.schemas.Dispensing.all().list(function(disps) {
        Promise.all(_(disps).map(function(disp, index) {
          return dataFormat.generateCsv(disp);
        })).then(function(csvs) {
          var csvs = _(disps).zip(csvs).map(function(arr) {
            return {
              name: moment(arr[0].date).format(_.uniqueId("YYYY-MM-DD_")),
              code: arr[1]
            };
          })
          my.fileSystem.openChooser(true, "エクスポートするディレクトリを選んでね。", function(url) {
            var count = 0;
            my.fileSystem.export(url, csvs, function(isSuccess, url, dirUrl) {
              count++;
              if (isSuccess) {
                if (csvs.length === count) {
                  Materialize.toast(dirUrl + " に保存しました。", 4000);
                }
              } else {
                Materialize.toast(url + " への保存に失敗しました。", 4000);
              }
            });
          });
        });
      })
    });

    $("#export-single").click(function() {
      my.init.schemas.Dispensing.all().list(function(disps) {
        Promise.all(_(disps).map(function(disp, index) {
          return dataFormat.generateCsv(disp);
        })).then(function(csvs) {
          var csvs = _(disps).zip(csvs).map(function(arr) {
            return {
              name: moment(arr[0].date).format(_.uniqueId("YYYY-MM-DD_")),
              code: arr[1]
            };
          })
          my.fileSystem.openChooser(true, "エクスポートするディレクトリを選んでね。", function(url) {
            my.fileSystem.export(url, csvs, function(isSuccess, url) {
              if (isSuccess) {
                Materialize.toast(url + " に保存しました。", 4000);
              } else {
                Materialize.toast(url + " への保存に失敗しました。", 4000);
              }
            }, true);
          });
        });
      })
    });

    $("#import").click(function() {
      my.fileSystem.openChooser(false, "インポートするファイルを選んでね。", function(url) {
        my.fileSystem.load(url).then(function(result) {
          dataFormat.saveRecord([result], function() {
            Materialize.toast('処方箋を追加したよ。', 4000);
          });
        });
      });
    });

    $("#import-directory").click(function() {
      my.fileSystem.openChooser(true, "インポートするディレクトリを選んでね。", function(url) {
        my.fileSystem.importDir(url, function(results) {
          dataFormat.saveRecord(results, function() {
            Materialize.toast('処方箋を追加したよ。', 4000);
          });
        });
      });
    });

    $("#clear-db").click(function() {
      persistence.transaction(function(tx) {
        _(my.init.definition.schemas).each(function(schema) {
          tx.executeSql("drop table " + schema.dbName);
        });
        Materialize.toast("データベースを初期化したよ。", 4000)
      });
    });

    $("#create-csv").click(function() {
      window.cordova.InAppBrowser.open($(this).attr("href"), '_system');
      return false;
    });

    $("#import-csv .import").click(function() {
      dataFormat.saveRecord([$("#import-csv_text").val()], function() {
        $("#import-csv_text").val("").trigger('autoresize');
        Materialize.updateTextFields();
        Materialize.toast('処方箋を追加したよ。', 4000);
      });
    })
  }
}