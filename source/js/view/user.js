var user = require("./../user.js");
var Materialize = window.Materialize;

module.exports = {
	init: function() {
    $('#historyOfAllergy, #historyOfSideEffect, #medicalHistory').characterCounter();

		$("#birth").bootstrapMaterialDatePicker({
      lang: "ja",
      weekStart : 0,
      time: false,
      cancelText: "やめた",
      okText: "いいよ",
      maxDate: moment(),
      format: "YYYY/MM/DD",
      clearButton: true,
      clearText: "消す",
    });

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

    $("#birth").change(function() {
      var val = $(this).val();
      if (val) {
        var duration = moment.duration(moment().diff(new Date(val)));
        $("#patient-age").val(duration.years() + "歳 " + duration.months() + "ヶ月");
      } else {
        $("#patient-age").val("");
      }
      Materialize.updateTextFields();
    });

    user.loadOrCreate(function(patient) {
    	var names = patient.name.trim().split(/\s/);
    	$("#last_name").val(names[0]);
    	$("#first_name").val(names[1]);
    	$("#birth").val(patient.birth ? moment(patient.birth).format("YYYY/MM/DD") : "").change();
    	$("#contact").val(patient.contact);
    	$("#historyOfAllergy").val(patient.historyOfAllergy).trigger('autoresize');
    	$("#historyOfSideEffect").val(patient.historyOfSideEffect).trigger('autoresize');
    	$("#medicalHistory").val(patient.medicalHistory).trigger('autoresize');

    	Materialize.updateTextFields();
    })

		$("#user-form").submit(function() {
			var $this = $(this);
			user.loadOrCreate(function(patient) {
				patient.name = $("#last_name").val() + "　" + $("#first_name").val();
				patient.birth = moment(new Date($("#birth").val()));
				patient.contact = $("#contact").val();
				patient.historyOfAllergy = $("#historyOfAllergy").val();
				patient.historyOfSideEffect = $("#historyOfSideEffect").val();
				patient.medicalHistory = $("#medicalHistory").val();

				user.save(patient, function() {
					Materialize.toast("あなたの情報を保存したよ。", 4000);
				});
			});

			return false;
		});
	}
}