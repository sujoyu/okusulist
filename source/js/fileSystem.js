// This is a JavaScript file
var console = window.console;

var pathjs = require("imports?define=>false&this=>window!./../lib/path.js/path.js");

module.exports = {

  path: null,
  isPc: false,

  init: function() {
    var device = window.device;

    if (device.platform === "Android") {
      this.path = window.cordova.file.externalRootDirectory;
    } else if (device.platform === "iOS") {
      this.path = window.cordova.file.syncedDataDirectory;
    } else {
      console.error("fileSystem initialize failed. unknown device.");
      this.path = "file://";
      this.isPc = true;
    }
  },

  export: function(path, csvs, callback, isSingle) {
    var self = this;
    var dirName = "おくすlist_" + moment().format("YYYY-MM-DD_HH-mm-ss.SSS");

    if (isSingle) {
      var code = _(csvs).reduce(function(memo, csv) {
        return memo + "\r\n" + csv.code
      }, []).trim();

      var uint8array = new Uint8Array(Encoding.convert(code, { to: "SJIS", type: "array" } ));
      var blob = new Blob([ uint8array ], {
        type: "text/plain",
      });

      self.save(path, dirName, "export_all.txt", blob, callback);
    } else {
      _(csvs).each(function(csv) {
        var uint8array = new Uint8Array(Encoding.convert(csv.code, { to: "SJIS", type: "array" } ));
        var blob = new Blob([ uint8array ], {
          type: "text/plain",
        });

        self.save(path, dirName, csv.name + "_export.txt", blob, callback);
      })
    }
  },

  save: function(path, dir, name, blob, callback) {
    var self = this;
    window.resolveLocalFileSystemURL(path, function(dirEntry) {
      if (dir) {
        dirEntry.getDirectory(dir, {create: true}, write, self.errorHandler);
      } else {
        write(dirEntry);
      }


      function write(dirEntry) {
        dirEntry.getFile(name, {create: true}, function(fileEntry) {
          console.log(fileEntry.toURL());

          // Create a FileWriter object for our FileEntry (log.txt).
          fileEntry.createWriter(function(fileWriter) {

            fileWriter.onwriteend = function(e) {
              console.log('Write completed.');
              callback(true, decodeURI(fileEntry.toURL()), decodeURI(dirEntry.toURL()));
              //Materialize.toast(decodeURI(fileEntry.toURL()) + " に保存しました。", 4000);
            };

            fileWriter.onerror = function(e) {
              console.log('Write failed: ' + e.toString());
              callback(false, decodeURI(fileEntry.toURL()), decodeURI(dirEntry.toURL()));
              //Materialize.toast(decodeURI(fileEntry.toURL()) + " への保存に失敗しました。", 4000);
            };

            fileWriter.write(blob);
          }, self.errorHandler);
        }, self.errorHandler);
      }
    }, this.errorHandler);
  },

  errorHandler: function(e) {
    var msg = '';

    switch (e.code) {
      case FileError.QUOTA_EXCEEDED_ERR:
        msg = 'QUOTA_EXCEEDED_ERR';
        break;
      case FileError.NOT_FOUND_ERR:
        msg = 'NOT_FOUND_ERR';
        break;
      case FileError.SECURITY_ERR:
        msg = 'SECURITY_ERR';
        break;
      case FileError.INVALID_MODIFICATION_ERR:
        msg = 'INVALID_MODIFICATION_ERR';
        break;
      case FileError.INVALID_STATE_ERR:
        msg = 'INVALID_STATE_ERR';
        break;
      default:
        msg = 'Unknown Error';
        break;
    };

    console.error('Error: ' + msg);
  },

  importDir: function(url, callback) {
    var self = this;
    this.readFileList(url, function(files) {
      var promises = _(files).map(function(entry) {
        if (entry.isFile) {
          return self.load(entry.toURL());
        }
        return Promise.resolve();
      });

      Promise.all(promises).then(callback);
    })
  },

  load: function(url) {
    var self = this;

    return new Promise(function(resolve, reject) {
      window.resolveLocalFileSystemURL(url, function(fileEntry) {
        fileEntry.file(function(file) {
          var reader = new FileReader();

          reader.onloadend = function(e) {

            var byteString = atob(this.result.split(',')[1]);

            var ab = new ArrayBuffer(byteString.length);
            var ia = new Uint8Array(ab);
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }

            console.log(Encoding.detect(ia));

            var unicode = Encoding.convert(ia, {
              to: "UNICODE",
              type: "string"
            });

            resolve(unicode);
          };

          reader.readAsDataURL(file);
        }, self.errorHandler);
      });
    });
  },

  openChooser: function(directory, message, callback) {
    var $modal = $("#file-chooser");

    $modal.find(".title").text(message);

    this.renderFileList(directory, this.path);
    $modal.openModal();

    $modal.find(".choose").off("click").click(function() {
      var $active = $modal.find(".file-list .active");

      if (!$active[0]) {
        Materialize.toast(message, 4000);
        return false;
      }

      var url = $active.data("url");
      callback(url);
      $modal.closeModal();
    });
  },

  renderFileList: function(directory, path) {
    var self = this;
    var $modal = $("#file-chooser");
    var $fileList = $modal.find(".file-list");
    var $breadcrumbs = $modal.find(".breadcrumbs");

    var pathObj = pathjs.parse(path);
    pathObj.path = pathjs.normalize(pathObj.path);
    var dirname = pathjs.dirname;
    var basename = pathjs.basename

    var names = [];

    var tmp = pathObj.path;
    for(var i = 0; dirname(tmp) && i < 3; i++) {
      tmp = dirname(tmp);
      names.unshift(decodeURI(basename(tmp)))
    }

    $breadcrumbs.empty();

    _(names).each(function(name, index) {
      $breadcrumbs.append(
        $("<a></a>")
        .attr("href", "#!")
        .addClass("breadcrumb")
        .text(name)
        .click(function() {
          var tmp = pathObj.path;
          for (var i = 0; i < names.length - index; i++) {
            tmp = dirname(tmp);
          }
          var path = pathObj.protocol + "//" + tmp + "/";

          self.renderFileList(directory, path);
          return false;
        })
      );
    });

    var $fragment = $();

    function createItem(isDir, name, url) {
      var $img = isDir ? $('<i></i>').addClass("material-icons small type-directory").text("folder") :
                                      $("<i></i>").addClass("material-icons small type-file").html("&#xE24D;");

      var $span = $("<span></span>").addClass("col m8 file-name").text(name);
      var $a = $();
      if (isDir) {
        $a = $("<a></a>")
          .attr("href", "#!")
          .addClass("secondary-content")
          .append($("<i></i>").addClass("material-icons type-chevron").html("&#xE5DA;"))//.html("&#xE5CC;"))
          .click(function() {
            self.renderFileList(directory, url);
          });
      }

      var $li = $("<li></li>").addClass("collection-item").append($img)
        .append($span)
        .append($a)
        .append($("<div></div>").addClass("clear"))
        .click(function() {
          if (!directory && isDir) {
            return false;
          }

          $fileList.find("li").removeClass("active");
          $(this).addClass("active").data("url", url);
          return false;
        });

      return $li;
    }

    $fragment = $fragment.add(createItem(true, "../ （上の階層）", path + "../"))
      .add(createItem(true, "./ （ここ）", path));

    function refreshFiles(files) {
      files.forEach(function(entry, i) {
        if (directory && entry.isFile) {
          return;
        }

        $fragment = $fragment.add(createItem(entry.isDirectory, entry.name, entry.toURL()));
      });

      $fileList.empty();

      $fileList.append($fragment);
    }

    // if (this.isPc) {
    //    var files = [
    //   {
    //     isDirectory: true,
    //      isFile: false,
    //      name: "hogeaaaaaaaaaaaaaaaaaa",
    //      toURL: function() {
    //        return path + "/" + this.name + "/"
    //      }
    //    },{
    //      isDirectory: true,
    //      isFile: false,
    //      name: "fugaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    //      toURL: function() {
    //        return path + "/" + this.name + "/"
    //      }
    //    },{
    //      isDirectory: false,
    //      isFile: true,
    //      name: "piyo",
    //      toURL: function() {
    //        return path + "/" + this.name
    //      }
    //    },{
    //      isDirectory: false,
    //      isFile: true,
    //      name: "piyopiyoaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    //      toURL: function() {
    //        return path + "/" + this.name
    //      }
    //    },
    //  ];

    //   refreshFiles(files);
    // } else {
      this.readFileList(path, refreshFiles);
    // }
  },

  readFileList: function(path, callback) {
    var self = this;

    function toArray(list) {
      return Array.prototype.slice.call(list || [], 0);
    }

    window.resolveLocalFileSystemURL(path, function(dirEntry) {
      var dirReader = dirEntry.createReader();
      var entries = [];

      // Call the reader.readEntries() until no more results are returned.
      var readEntries = function() {
         dirReader.readEntries (function(results) {
          if (!results.length) {
            callback(entries.sort());
          } else {
            entries = entries.concat(toArray(results));
            readEntries();
          }
        }, self.errorHandler);
      };

      readEntries(); // Start reading dirs.

    }, this.errorHandler);

  }

};