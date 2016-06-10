// This is a JavaScript file
var console = window.console;

var my = {
  init: require("./../initSchema"),
  fileSystem: require("./../fileSystem"),
  barcodeScanner: require("./../barcodeScanner"),
  user: require("./../user"),
}

var Promise = require("es6-promise-polyfill").Promise;

var Materialize = window.Materialize;

module.exports = {
  doneFirst: false,
  onlyFirst: function() {
    var self = this;
    if (this.doneFirst) {
      return;
    }

    var $cameraContinue = $("#camera-continue");
    $cameraContinue.find(".complete").click(function() {
      var barcodes = $cameraContinue.data("barcodes");
      my.barcodeScanner.saveRecord(barcodes, function() {
        self.init();
        Materialize.toast('処方箋を追加したよ。', 4000);
      });
    });
    $cameraContinue.find(".leaving").click(function() {
      var barcodes = $cameraContinue.data("barcodes");
      $cameraContinue.closeModal({
        complete: function() {
          my.barcodeScanner.scan(barcodes);
        }
      });

      return false;
    });

    var $saveQrcode = $("#save-qrcode")
    $saveQrcode.find(".save").click(function() {
      var barcodes = $saveQrcode.data("barcodes");
      my.barcodeScanner.saveRecord(barcodes, function() {
        self.init();
        Materialize.toast('処方箋を追加しました。', 4000);
      });
    });

    var $qrcodeError = $("#qrcode-error");
    $qrcodeError.find(".retry").click(function() {
      var barcodes = $qrcodeError.data("barcodes");
      $qrcodeError.closeModal({
        complete: function() {
          my.barcodeScanner.scan(barcodes);
        }
      });
    });

    $("#confirm-delete").find(".delete").click(function() {
      var id = $(this).data("id");
      var schema = $(this).data("schema");
      if (!id) {
        return;
      }
      if (!schema) {
        schema = "DispDate";
      }

      $(this).removeData("id").removeData("schema");
      my.init.schemas[schema].load(id, function(date) {
        persistence.remove(date);
        self.init();
        Materialize.toast('削除したよ。', 4000);
      });
    });

    $("#edit-comment").find(".save").click(function() {
      var id = $(this).data("id");
      var schema = $(this).data("schema");
      if (!id) {
        return;
      }
      if (!schema) {
        schema = "DispDate";
      }

      $(this).removeData("id").removeData("schema");

      persistence.transaction(function(tx) {
      my.init.schemas[schema].load(tx, id, function(date) {
        date.patientComment.one(tx, function(comment) {
          if (!comment) {
            comment = new my.init.schemas.PatientComment();
          }
          comment.comment = $("#edit-comment_patient-comment").val();
          date.patientComment.add(comment);
          persistence.flush(tx, function() {
            $("#edit-comment_patient-comment").val("")
              .trigger("autoresize");
            Materialize.updateTextFields();
            self.init();
            Materialize.toast('患者等記入情報を保存したよ。', 4000);
          });
        });
      });
    });


    });
    this.doneFirst = true;
  },

  init: function() {
    var self = this;

    this.onlyFirst();

    var date;
    var dateParam = this.getParameterByName("date");
    if (dateParam) {
      date = moment(dateParam);
      $("#logo-container").text(date.format("YYYY/MM/DD") + " の処方");
    };

    this.initDatepicker();

    this.showList(date);
  },

  initDatepicker: function() {
    var self = this;
    var $listTarget = $("#list-target");

    $listTarget.bootstrapMaterialDatePicker({
      lang: "ja",
      weekStart : 0,
      time: false,
      cancelText: "やめた"
    }).on("dateSelected", function(e, date) {
      self.jump({ date: date.format("YYYYMMDD") })
      $(this).bootstrapMaterialDatePicker("hide");
    });

    self.updateEnableDates();

    $("i.material-icons").each(function() {
      var icon = $(this).text().trim();
      var map = {
        chevron_left: "&#xE5CB;",
        chevron_right: "&#xE5CC;"
      }
      var code = map[icon];
      if (code) {
        $(this).html(code);
      }
    });

    // datepickerのinitDate()をインターセプトする
    var plugin = $listTarget.data("plugin_bootstrapMaterialDatePicker");
    var tmp = plugin.__proto__.initDate;
    plugin.__proto__.initDate = function(d) {
      var plugin = this;

      tmp.bind(this)(d);

      this.$dtpElement.find('a.dtp-select-day').each(function() {
        var date = $(this).parent().data("date");
        var moment = plugin.currentDate.clone().date(date).startOf("day");
        if (!_(self.enableDates).contains(moment.valueOf())) {
          $(this).addClass("dtp-disable-day").off("click");
        }
      });
    };

    $(document).off("click", "#calendar");
    $(document).on("click", "#calendar", function() {
      if (self.enableDates && self.enableDates.length > 0) {
        $listTarget.trigger("focus");
      } else {
        Materialize.toast('まずは処方箋を読み込んでね。', 4000)
      }
    });
  },

  updateEnableDates: function() {
    var self = this;

    my.init.schemas.DispDate
      .all()
      .order("date")
      .list(function(dispDates) {
        my.init.schemas.OtcMedicine
          .all()
          .list(function(otcs) {
            var dates = _(otcs).map(function(otc) {
              return moment(otc.startDate).startOf("day").valueOf();
            });

            dates = self.enableDates = _(dates.concat(_(dispDates).map(function(date) {
              return moment(date.date).startOf("day").valueOf();
            }))).uniq().sort();

            $("#list-target").bootstrapMaterialDatePicker("setMinDate", moment(_(dates).first()))
              .bootstrapMaterialDatePicker("setMaxDate", moment(_(dates).last()));
          });
      });
  },

  jump: function(params) {
    var url = "index.html";
    var query = _(params).map(function(val, key) {
      return encodeURIComponent(key) + "=" + encodeURIComponent(val);
    }).join("&");

    if (query) {
      url = url + "?" + query;
    }

    location.href = url;
  },

  showList: function(date) {
    //console.log("showList");

    var definition = my.init.definition;
    var schemas = my.init.schemas;
    var weh = this.withErrorHandler;

    var self = this;
    var $temp = $("#template");
    var $techo = $("#techo");

    $techo.empty().append($temp)

    // callback地獄を避けるため
    // next()で次に呼ぶ関数を準備。complete()で実行。
    var funcs = [
      // 調剤日付ごと
      function(context, next, complete) {
        context.$list = $();

        var query;
        if (date) {
          query = schemas.DispDate
            .all()
            .filter("date", ">=", date.startOf("day").valueOf())
            .filter("date", "<=", date.endOf("day").valueOf());
        } else {
          query = schemas.DispDate
            .all()
            .order("date", false)
            .limit(100);
        }

        query.prefetch("dispensing")
          .prefetch("dispHospital")
          .prefetch("dispDoctor")
          .prefetch("prescriptionHospital")
          .list(context.tx, function(dispDates) {
            var dates =  _(dispDates).map(weh(function(dispDate) {
              var date = moment(dispDate.date).format("YYYY/MM/DD");
              var section = new Section(date + " : " + dispDate.dispHospital.name, true, dispDate.id)
              // .addDef(dispDate.dispensing.otcMedicine, "OtcMedicine", "name", true)
              .addDef(dispDate.dispDoctor, "DispDoctor", "name", true)
              .addDef(dispDate.prescriptionHospital, "PrescriptionHospital", "name", true)
              .addDef(dispDate.prescriptionHospital, "PrescriptionHospital", "contact", true);

              dispDate.dosingCaution.list(function(cautions) {
                _(cautions).each(weh(function(caution) {
                  section.addDef(caution, "DosingCaution", "content", true);
                }));

                dispDate.note.list(function(notes) {
                  _(notes).each(weh(function(note) {
                    section.addDef(note, "Note", "noteInfo", true);
                  }));

                  dispDate.patientComment.list(function(comments) {
                    _(comments).each(weh(function(comment) {
                      section.addDef(comment, "PatientComment", "comment", true);
                    }));
                  });
                });
              });

              return [date, function() {
                context.$list = context.$list.add(section.$obj);

                var localContext = _.clone(context);
                localContext.dispDate = dispDate;
                localContext.section = section;

                next(localContext)
              }];
            }));

            var medQuery;
            if (date) {
              medQuery = schemas.OtcMedicine
                .all()
                .filter("startDate", ">=", date.startOf("day").valueOf())
                .filter("startDate", "<=", date.endOf("day").valueOf());
            } else {
              medQuery = schemas.OtcMedicine
                .all()
                .order("startDate", false)
                .limit(100);
            }

            medQuery.list(context.tx, function(otcs) {
                var otcDates = _(otcs).map(weh(function(otc) {
                  var start = moment(otc.startDate).format("YYYY/MM/DD");
                  var end = moment(otc.endDate).format("YYYY/MM/DD");
                  var parser = function(prop) {
                    return moment(prop).format("YYYY/MM/DD");
                  }

                  var section = new Section(start + " - " + end + " : " + otc.name, true, otc.id, "OtcMedicine")
                    .addDef(otc, "OtcMedicine", "name", false)
                    .addDef(otc, "OtcMedicine", "startDate", false, parser)
                    .addDef(otc, "OtcMedicine", "endDate", false, parser);

                  return [start, function() {
                    context.$list = context.$list.add(section.trim().$obj);
                  }];
                }));

                _(_(dates.concat(otcDates)).sortBy(0).reverse()).each(function(date) {
                  date[1]();
                });

                complete();
              });
          });
      },
      // 処方ごと
      function(context, next, complete) {
        context.dispDate.prescriptionDoctor
          .list(context.tx, function(doctors) {
            _(doctors).each(weh(function(doctor) {
              var text = doctor.name
                ? "処方医師: " + doctor.name
                : "処方";
              var section = new Section(text);

              context.section.addSec(section.$obj);

              var localContext = _.clone(context);
              localContext.doctor = doctor;
              localContext.section = section;

              next(localContext);
            }));
            context.section.trim();
            complete();
          });
      },
      // RP情報
      function(context, next, complete) {
        context.doctor.rPInfo
          .prefetch("usage")
          .list(context.tx, function(infos) {
            _(infos).each(weh(function(info) {
              var section = new Section(info.usage.name)
                .addDef("数量", info.usage.volume + " " + info.usage.unit, true);

              info.usage.usageComplement.list(function(comps) {
                _(comps).each(function(comp) {
                  section.addDef(comp, "UsageComplement", "info", true)
                });

                info.usageCaution.list(function(cautions) {
                  _(cautions).each(function(caution) {
                    section.addDef(caution, "UsageCaution", "content", true);
                  });
                });
              });

              context.section.addSec(section.$obj);

              var localContext = _.clone(context);
              localContext.rpInfo = info;
              localContext.section = section;

              next(localContext);
            }));
            context.section.trim();
            complete();
          });
      },
      // 薬品情報
      function(context, next, complete) {
        context.rpInfo.medicine
          .list(context.tx, function(medicines) {
            _(medicines).each(weh(function(medicine) {
              var section = new Section(medicine.name)
                .addDef("用量", medicine.dose + " " + medicine.unitName);

              context.section.addSec(section.$obj.addClass("small"));

              var localContext = _.clone(context);
              localContext.medicine = medicine;
              localContext.section = section;

              next(localContext);
            }));
            context.section.trim();
            complete();
          })
      },

      function(context, next, complete) {
        context.medicine.medicineComplement
          .list(context.tx, function(complements) {
            _(complements).each(weh(function(comp) {
              context.section.addDef(comp, "MedicineComplement", "info");
            }));

            context.medicine.medicineCaution
             .list(context.tx, function(cautions) {
               _(cautions).each(weh(function(caution) {
                 context.section.addDef(caution, "MedicineCaution", "content", true);
               }));
             });

            context.section.trim();
            complete();
          });


      }
    ];

    persistence.transaction(function(tx) {
      self.chain(funcs, function(context) {
        //console.log("chain finish.")

        if (context.$list[0]) {
          $("#empty-message").addClass("hide");
          $("#welcome-message").addClass("hide");
          $techo.removeClass("hide");
        } else {
          if (date) {
            $("#empty-message").removeClass("hide");
            $("#welcome-message").addClass("hide");
            $techo.addClass("hide");
          } else {
            $("#empty-message").addClass("hide");
            $("#welcome-message").removeClass("hide");
            $techo.addClass("hide");
          }
        }

        self.updateEnableDates();

        $techo.append(context.$list);

        $techo.find('.collapsible').collapsible();
        $techo.find('.modal-trigger').leanModal();
        $techo.find('.dropdown-button').dropdown();

        $techo.find(".techo-submenu-button").click(function() {
          $(this).trigger("open");
          return false;
        })

        $techo.find(".modal-trigger.edit")
          .click(function() {
            var submenu = $(this).parents(".techo-submenu");
            var id = submenu.data("id");
            var schema = submenu.data("schema")
            $("#edit-comment").find(".save").data({
              id: id,
              schema: schema
            });
            var modal = $($(this).attr("href"));

            schemas.DispDate.load(id, function(date) {
              date.patientComment.one(function(comment) {
                $("#edit-comment_patient-comment").val(comment && comment.comment ? comment.comment : "")
                  .trigger('autoresize');
                Materialize.updateTextFields();
                modal.openModal();
              })
            })

            return false;
          });

        $techo.find(".modal-trigger.delete")
          .click(function() {
            var submenu = $(this).parents(".techo-submenu");
            var id = submenu.data("id");
            var schema = submenu.data("schema")
            $("#confirm-delete").find(".delete").data({
              id: id,
              schema: schema
            });
            $($(this).attr("href")).openModal();
            return false;
          });

        my.user.isEmpty(function(empty) {
          if (empty) {
            $("#edit-patient-message").removeClass("hide");
          }
        })
      }, { tx: tx });
    });


    function createDef(entity, schemaName, propName, parser) {
      var dtText;
      var ddText;
      if (_.isString(propName)) {
        if (!entity || !entity[propName]) {
          return $();
        }

        var prop = entity[propName];
        if (_.isFunction(parser)) {
          prop = parser(prop);
        }
        dtText = definition.schema(schemaName).props[propName].viewName;
        ddText = prop;
      } else {
        dtText = entity;
        ddText = schemaName;
      }

      var $dt = $("<dt></dt>").addClass("col s4 m4 l2 clear").append(
        $("<span></span>").text(dtText)
      );
      var $dd = $("<dd></dd>").addClass("col s8 m4 l2").append(
        $("<span></span>").text(ddText)
      );

      return $dt.add($dd);
    }

    function Section(name, isHeader, id, schema) {
      var $obj = $temp.clone(true).removeAttr("id").removeClass("hide");

      if (!isHeader) {
        $obj.find(".techo-submenu-button").detach();
        $obj.find(".accent-icon").detach();
      } else {
        var submenuId = "techo-submenu-" + id;
        $obj.find(".techo-submenu-button").attr("data-activates", submenuId);
        $obj.find(".techo-submenu").attr("id", submenuId)
          .data({
            id: id,
            schema: schema
          });

        if (schema && schema !== "DispDate") {
          $obj.find(".techo-submenu .edit").parents("li").detach();
        }
      }

      $obj.find(".collapsible-header").find(".header-text").text(name);

      this.$obj = $obj;
      this.$firstContentsList = $obj.find(".first-contents-list");
      this.$lastContentsList = $obj.find(".last-contents-list");
      this.$sectionList = $obj.find(".section-list");

      this.addDef = function(entity, schemaName, propName, isLast, parser) {
        if (_.isBoolean(propName)) {
          isLast = propName;
        }

        var $contentsList = isLast ? this.$lastContentsList : this.$firstContentsList;

        $contentsList.find("dl").append(
          createDef(entity, schemaName, propName, parser)
        );

        return this;
      };

      this.addSec = function($section) {
        this.$sectionList.append($section);

        return this;
      };

      this.trim = function() {
        if (!this.$firstContentsList.has("dt")[0]) {
          this.$firstContentsList.detach();
        }

        if (!this.$lastContentsList.has("dt")[0]) {
          this.$lastContentsList.detach();
        }

        if (!this.$sectionList.has(".techo-section")[0]) {
          this.$sectionList.detach();
        }

        return this;
      }
    }
  },

  // funcsの非同期処理を再帰的に実行、すべて終了したらcallbackを実行する。
  chain: function(funcs, callback, context, failed) {
    context = context || {};
    recurse(context, 0).then(function() {
      callback(context);
    }).catch(failed);

    // 再帰用の関数
    function recurse(context, index) {
      return new Promise(function(resolve, reject) {
        if (funcs.length > index) {
          var promises = [];
          funcs[index](context, function(context) {
            // nextが呼ばれたら、再帰処理をスタックに積んでいく
            promises.push(recurse(context, index + 1));
          }, function() {
            // completeが呼ばれたら、同期実行
            // 全部終わったら、このPromiseを終了する
            Promise.all(promises).then(resolve).catch(reject);
          });
        } else {
          resolve();
        }
      });
    };
  },

  withErrorHandler: function(func) {
    return function() {
      try {
        return func.apply(this, arguments);
      } catch(e) {
        Materialize.toast("データが壊れてるのか、ちゃんと表示できない処方があるよ...", 4000);
        console.error(e);
      }
    };
  },

  // http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
  getParameterByName: function(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  },


};