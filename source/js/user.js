require("imports?persistencejs&persistenceSql!persistenceCordova");
var persistence = window.persistence;

module.exports = {
	schemas: {},

	init: function() {
		var schemas = this.schemas;

		schemas.Patient = persistence.define('Patient', {
		  name: "TEXT",
		  birth: "DATE",
		  contact: "TEXT",
		  historyOfAllergy: "TEXT",
		  historyOfSideEffect: "TEXT",
		  medicalHistory: "TEXT"
		});

		// schemas.HistoryOfAllergy = persistence.define("HistoryOfAllergy", {
		// 	note: "TEXT"
		// });

		// schemas.HistoryOfSideEffect = persistence.define("HistoryOfSideEffect", {
		// 	note: "TEXT"
		// });

		// schemas.MedicalHistory = persistence.define("MedicalHistory", {
		// 	note: "TEXT"
		// });

		// schemas.Patient.hasMany("historyOfAllergy", schemas.HistoryOfAllergy, "patient");
		// schemas.Patient.hasMany("historyOfSideEffect", schemas.HistoryOfSideEffect, "patient");
		// schemas.Patient.hasMany("medicalHistory", schemas.MedicalHistory, "patient");

		persistence.schemaSync();
	},

	save: function(patient, callback) {

		// _(historyOfAllergy).each(function(hist) {
		// 	patient.historyOfAllergy.add(new schemas.HistoryOfAllergy({ note: hist }));
		// });

		// _(historyOfSideEffect).each(function(hist) {
		// 	patient.historyOfSideEffect.add(new schemas.HistoryOfSideEffect({ note: hist }));
		// });

		// _(medicalHistory).each(function(hist) {
		// 	patient.medicalHistory.add(new schemas.MedicalHistory({ note: hist }));
		// });

		persistence.add(patient);
		persistence.flush(callback);
	},

	loadOrCreate: function(callback) {
		var schemas = this.schemas;

		schemas.Patient.all().one(function(patient) {
			callback(patient || new schemas.Patient());
		});
	},

	isEmpty: function(callback) {
		this.schemas.Patient.all().count(function(count) {
			callback(count === 0);
		});
	}

}