// This is a JavaScript file

module.exports = {
  prepare: function() {
    window.plugins = {};
    window.plugins.barcodeScanner = {
      counter: 0,
      results: [
      "JAHISTC04,2\r\n\
1,長谷部素生,1,19890728,,,,,,,\r\n\
3,ばふぁりん,20160529,20160530",
      "JAHISTC01\r\n\
1,長谷部　素生,1,19890728\r\n\
5,20160510\r\n\
11,あかまつ薬局,13,4,1655091\r\n\
15,山内 孝拓\r\n\
51,青葉こころのクリニック,13,1,1633882\r\n\
55,鈴木 宏,【内科】\r\n\
201,1,スルピリド錠１００ｍｇ「アメル」,2,錠,4,1179016F1159\r\n\
281,1,◆一般名称:【般】スルピリド錠１００ｍｇ\r\n\
301,1,１日２回 朝夕食後,14,日分,1,1\r\n\
201,2,ブロチゾラムＯＤ錠０．２５ｍｇ「サワイ」,1,錠,4,1124009F2076\r\n\
281,2,◆一般名称:【般】ブロチゾラム口腔内崩壊錠０．２５ｍｇ",

  "201,2,トラゾドン塩酸塩錠５０ｍｇ「アメル」,1,錠,4,1179037F2050\r\n\
281,2,◆一般名称:【般】トラゾドン塩酸塩錠５０ｍｇ\r\n\
201,2,セレスタミン配合錠,1,錠,4,2459100F1162\r\n\
281,2,◆一般名称:【般】ベタメタゾン・ｄ－クロルフェニラミン配合錠\r\n\
201,2,セルトラリン錠１００ｍｇ「アメル」,1,錠,4,1179046F3039\r\n\
281,2,◆一般名称:【般】セルトラリン錠１００ｍｇ\r\n\
301,2,１日１回 就寝前,14,日分,1,1,501,正しい飲み方は薬袋等をご覧ください。",

    "5,20330510\r\n\
11,薬局,13,4,1655091\r\n\
15,山孝\r\n\
201,1,ふがふが,1,錠,4,2459100F1162\r\n\
281,1,◆一般名称:【般】ふがふが\r\n\
281,1,◆一般名称:【般】ふがふが2\r\n\
301,1,１日１回 就寝前,14,日分,1,1,501,正しい飲み方は薬袋等をご覧ください。\r\n\
311,1,ようほうほそく\r\n\
311,1,ようほうほそく2\r\n\
391,1,しょほうふくようちゅうい！！！！\r\n\
391,1,しょほうふくようちゅうい2！！！！\r\n\
401,ふくようちゅうい！！！！！！\r\n\
401,ふくようちゅうい2！！！！！！\r\n\
"
      ],
      scan: function(callback, errorCallback) {
        callback({
          cancelled: false,
          text: this.results[this.counter++],
          format: "QR_CODE"
        });
      }
    }
  }
};
