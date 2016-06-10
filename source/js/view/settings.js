// This is a JavaScript file
var console = window.console;

var my = {
  init: require("./../initSchema"),
  fileSystem: require("./../fileSystem"),
  barcodeScanner: require("./../barcodeScanner")
}

module.exports = {
  init: function() {
    var self = this;

    $('.modal-trigger').leanModal();
    Materialize.updateTextFields();

    $("#export").click(function() {
      my.init.schemas.Dispensing.all().list(function(disps) {
        Promise.all(_(disps).map(function(disp, index) {
          return self.generateCsv(disp);
        })).then(function(csvs) {
          var csvs = _(disps).zip(csvs).map(function(arr) {
            return {
              name: moment(arr[0].date).format("YYYY-MM-DD_HH-mm-ss.SSS"),
              code: arr[1]
            };
          })
          my.fileSystem.openChooser(true, "エクスポートするディレクトリを選んでね。", function(url) {
            my.fileSystem.export(url, csvs);
          });
        });
      })
    });

    $("#import").click(function() {
      my.fileSystem.openChooser(false, "インポートするファイルを選んでね。", function(url) {
        my.fileSystem.load(url).then(function(result) {
          my.barcodeScanner.saveRecord([result], function() {
            Materialize.toast('処方箋を追加したよ。', 4000);
          });
        });
      });
    });

    $("#clear-db").click(function() {
      persistence.transaction(function(tx) {
        _(my.init.definition.schemas).each(function(schema) {
          tx.executeSql("drop table " + schema.dbName);
          // my.initSchema();
        });
        Materialize.toast("データベースを初期化したよ。", 4000)
      });
    });

    $("#create-csv").click(function() {
      window.open($(this).attr("href"), '_system');
      return false;
    });

    $("#import-csv .import").click(function() {
      my.barcodeScanner.saveRecord([$("#import-csv_text").val()], function() {
        $("#import-csv_text").val("").trigger('autoresize');
        Materialize.updateTextFields();
        Materialize.toast('処方箋を追加したよ。', 4000);
      });
    })
  },

  generateCsv: function(disp) {
    var self = this;
    var definition = my.init.definition;
    var schemas = my.init.schemas;

    var csv = "";

    return fetchChildren(definition.schema("Dispensing"), disp, true).then(function() {
      return csv;
    });

    function addRow(array) {
      csv += array.join(",") + "\r\n";
    }

    function fetchChildren(def, schema, isSingle) {
      var innerPromise = Promise.resolve();
      return  new Promise(function(resolve, reject) {
        if (isSingle) {
          if (schema) {
            generate(schema);
          }
          resolve();
        } else {
          new Promise(function(resolve, reject) {
            schema.list(function(list) {
              _(list).map(generate);
              resolve();
            });
          }).then(resolve);
        }
      }).then(function() {
        return innerPromise;
      });

      function generate(obj) {
        innerPromise = innerPromise.then(function() {
          if (def.no < 0) {
            return;
          }

          var values = _(definition.props[def.no]).map(function(prop) {
            return prop.dbType === "DATE" ? moment(obj[prop.dbName]).format("YYYYMMDD") : obj[prop.dbName];
          });

          if (def.no === 55 && !values[0]) {
            return;
          }
          if (def.no !== 0) {
            values.unshift(def.no.toString());
          }

          var lastIndex = _(values).findLastIndex(function(val) {
            return val !== null;
          });

          addRow(values.slice(0, lastIndex + 1));
        });

        _(def.children).each(function(childDef) {
          innerPromise = innerPromise.then(function() {
            return new Promise(function(resolve, reject) {
              if (!childDef.isMulti) {
                obj.fetch(childDef.foreignName, function() {
                  fetchChildren(childDef, obj[childDef.foreignName], true).then(resolve);
                });
              } else {
                fetchChildren(childDef, obj[childDef.foreignName]).then(resolve);
              }
            });
          });
        });
      }
    }
  }
}