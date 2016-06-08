// This is a JavaScript file
var console = window.console;

var my = {
  definition: require("./specification"),
}

require("imports?persistencejs&persistenceSql!persistenceCordova");
var persistence = window.persistence;

module.exports = {
  init: function() {

    var db = persistence.store.cordovasql.config(
      persistence,
      "medicine_note",
      "1.0",
      "Medicine Note",
      8 * 1024 * 1024,
      0, 0
    );

    var definition = this.definition = {
      init: function() {
        var self = this;

        this.schemas = _.chain(my.definition.schemas)
          .map(function(row) { return self.createSchema(row[0], row[1], row[2], row[3], row[4], row[5], row[6]) })
          .indexBy("no")
          .value();

        this.props = _.chain(my.definition.props)
          .map(function(row) { return self.createProp(row[0], row[1], row[2], row[3], row[4]) })
          .groupBy("no")
          .value();

        this.schemasDbNameIndex = _(this.schemas).indexBy("dbName");

        this.schemas = _(this.schemas)
          .mapObject(function(schema) {
            schema.children = _(self.schemas).filter(function(scm) {
              return scm.parentNo === schema.no;
            });
            schema.props = _(self.props[schema.no]).indexBy("dbName");
            return schema;
          });
      },

      schema: function(key) {
        return this.schemas[key] || this.schemasDbNameIndex[key];
      },

      prop: function(no, specName) {
        return specName ? _(this.props[no]).find(function(row) { return row.specName === specName.trim() })
                        : this.props[no];
      },

      createSchema: function(no, specName, dbName, viewName, parentNo, isMulti, childrenNo) {
        specName = specName.trim();
        dbName = dbName.trim();

        return {
          no: parseInt(no, 10),
          specName: specName,
          dbName: dbName,
          foreignName: dbName.charAt(0).toLowerCase() + dbName.slice(1),
          viewName: viewName.trim() || specName,
          childrenNo: childrenNo,
          parentNo: parentNo,
          isMulti: isMulti
        };
      },

      createProp: function(no, specName, dbName, viewName, dbType) {
        specName = specName.trim();

        return {
          no: parseInt(no, 10),
          specName: specName,
          dbName: dbName.trim(),
          viewName: viewName.trim() || specName,
          dbType: dbType
        };
      },

      schemas: null,
      props: null,
      schemasDbNameIndex: null
    };

    this.definition.init();

    this.schemas = {
      init: function() {
        var self = this;

        _(definition.schemas).each(function(schema) {
          var attr = _.chain(schema.props).map(_.property("dbName"))
            .zip(_(schema.props).map(_.property("dbType")))
            .object()
            .value();

          // スキーマを定義する
          self[schema.dbName] = persistence.define(schema.dbName, attr);
        });

        // リレーションを定義する
        _.chain(definition.schemas).filter(function(schema) {
          return _.isNumber(schema.parentNo);
        }).each(function(childDef) {
          var parentDef = definition.schema(childDef.parentNo);
          var parent = self[parentDef.dbName];
          var child = self[childDef.dbName];
          if (childDef.isMulti) {
            parent.hasMany(childDef.foreignName, child, parentDef.foreignName);
          } else {
            parent.hasOne(childDef.foreignName, child);
          }
        });

        persistence.schemaSync();
      }
    };

    this.schemas.init();
  }
}