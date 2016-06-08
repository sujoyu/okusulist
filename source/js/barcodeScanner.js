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

        if (result.format !== "QR_CODE") {
          $("#qrcode-error").data("barcodes", barcodes).openModal();
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
//        swal({
//          title: "エラー",
//          text: "ふぇ、エラーだよ...ごめんなさい...",
//          type: "error",
//          showCancelButton: true,
//          confirmButtonText: "仕方がないな",
//          cancelButtonText: "ゆるさん！"
//        }).then(function (isConfirm) {
//          if (!isConfirm) {
//            // エラー情報を送信する
//          }
//        });
      }
    );
  },

  // レコードをパースして保存する。
  saveRecord: function(barcodes, callback) {
    var self = this;
    try {
      barcodes = _(barcodes).map(function(barcode) {
        return _(barcode.split("\n")).map(function(row) { return self.csvToArray(row) });
      });

      var barcode = this.arrangeBarcodes(barcodes);

      console.log(barcode);

      try {
      this.save(barcode, callback);
      } catch (e) {
        throw "データを解析できなかったよ。";
      }
    } catch (e) {
      console.error(e);
      Materialize.toast(e + "ごめん...", 4000);
    }
  },

  // バーコードの中身をパースしやすいように整形する。
  arrangeBarcodes: function(barcodes) {
    var definition = my.init.definition;
    var schemas = my.init.schemas;

    var barcode = _(barcodes).reduce(function(memo, code) { return memo.concat(code) }, []);

    if (!barcode[0]
      || !barcode[0][0]
      || !barcode[0][0].startsWith("JAHISTC")) {
      throw "CSVの形式が違うよ。";
    }
    // バージョン情報のためのダミー番号
    barcode[0].unshift(definition.schema("QRcodeVersion").no.toString());

    // 調剤明細全体スキーマのためのダミー番号
    barcode.unshift([definition.schema("Dispensing").no.toString(), moment()]);

    try {
      // RP情報の起点となるレコードが無いため（クソ・オブ・クソ）
      // 起点となるダミーレコードを挿入する
      var dispDateIndices = _.chain(barcode).map(function(row, index) {
        return parseInt(row[0]) === definition.schema("DispDate").no ? index : null;
      }).filter(function(index) {
        return _.isNumber(index);
      }).value();

      dispDateIndices.reverse();

      // No.5 のレコードで切って
      _(dispDateIndices).each(function(index, i) {
        var codes = barcode.slice(index, dispDateIndices[i - 1]);
        var originalLength = codes.length;

        // RP情報の要素レコードからRP番号の一覧を作る
        var rpNos = _.chain(codes).filter(function(row) {
          var no = definition.schema("RPInfo").childrenNo;
          return _(no).contains(parseInt(row[0]));
        }).map(_.property(1))
        .uniq()
        .value();

        rpNos.reverse();

        // 後ろからRP情報用のダミーレコードをつっこんでいく
        // そうすればindexがずれないでしょ？
        _.chain(rpNos).each(function(rpNo) {
          var rpIndex = _(codes).findIndex(function(row) { return row[1] === rpNo });
          codes.splice(rpIndex, 0, [definition.schema("RPInfo").no.toString(), rpNo.toString()]);
        });

        // 処方－医師情報が無ければ、ダミーレコードをつっこむ
        // （親子関係を維持する気がないデータ構造すごい（すごい））
        if (!_(codes).find(function(row) {
          return parseInt(row[0]) === definition.schema("PrescriptionDoctor").no;
        })) {
          var medicineIndex = _(codes).findIndex(function(row) {
            return parseInt(row[0]) === definition.schema("RPInfo").no;
          });
          codes.splice(medicineIndex, 0, [definition.schema("PrescriptionDoctor").no.toString()]);
        }

        // 可変長引数に配列を渡すためapplyを使う
        barcode.splice.apply(barcode, [index, originalLength].concat(codes));
      });
    } catch (e) {
      throw "読み取ったデータを初期化できなかったよ。"
    }

    return barcode;
  },

  // DBに保存する。
  save: function(barcode, callback) {
    var definition = my.init.definition;
    var schemas = my.init.schemas;

    // 先祖マップ
    var parents = {};
    _.chain(barcode).filter(function(row) {
      return definition.schema(parseInt(row[0]));
    }).each(function(row) {
      var no = parseInt(row[0]);
      var schemaDef = definition.schema(no);
      var schema = schemas[schemaDef.dbName];
      var data = schemaDef.props;

      row = row.slice(1);
      row = _.chain(data).map(_.property("dbType"))
        .zip(row)
        .map(function(val) {
          val[1] = (val[0] && val[0].toUpperCase() === "DATE") ? moment(val[1]) : val[1];
          return val[1];
        }).value();

      var prop = _.chain(data).map(_.property("dbName"))
        .zip(row)
        .object()
        .value();

      var record = new schema(prop);

      parents[schemaDef.dbName] = record;

      // リレーションを設定する
      if (_.isNumber(schemaDef.parentNo)) {
        var parentDef = definition.schema(schemaDef.parentNo);
        var parentRecord = parents[parentDef.dbName];

        if (schemaDef.isMulti) {
          parentRecord[schemaDef.foreignName].add(record);
        } else {
          parentRecord[schemaDef.foreignName] = record;
        }
      }
    });

    persistence.flush(callback);
  },

  // http://stackoverflow.com/questions/8493195/how-can-i-parse-a-csv-string-with-javascript-which-contains-comma-in-data
  // Return array of string values, or NULL if CSV string not well formed.
  csvToArray: function(text) {
    var re_valid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
    var re_value = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;
    // Return NULL if input string is not well formed CSV string.
    if (!re_valid.test(text)) return null;
    var a = [];                     // Initialize array to receive values.
    text.replace(re_value, // "Walk" the string using replace with callback.
        function(m0, m1, m2, m3) {
            // Remove backslash from \' in single quoted values.
            if      (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"));
            // Remove backslash from \" in double quoted values.
            else if (m2 !== undefined) a.push(m2.replace(/\\"/g, '"'));
            else if (m3 !== undefined) a.push(m3);
            return ''; // Return empty string.
        });
    // Handle special case of empty last value.
    if (/,\s*$/.test(text)) a.push('');
    return a;
  },
}