
module.exports = {
  schemas: [
    // [ No., 仕様上の名前, DB上の名前, 表示名, 親のNo., 複数あるかどうか, [子孫のNo.]]
    [-1, "調剤明細", "Dispensing", "調剤明細"],
    [-2, "RP情報", "RPInfo", "RP情報", 55, true, [201, 281, 291, 391]],
    [0, "バージョンレコード", "QRcodeVersion", "バージョン", -1],
    [1, "患者情報レコード", "PatientInfo", "患者情報", -1],
    [2, "患者特記レコード", "PatientSpecMention", "患者特記", -1, true],
    [3, "一般用医薬品服用レコード", "OtcMedicine", "一般用医薬品服用", -1, true],
    [5, "調剤等年月日レコード", "DispDate", "調剤等年月日", -1, true],
    [11, "調剤－医療機関等レコード", "DispHospital", "調剤－医療機関等", 5],
    [15, "調剤－医師・薬剤師レコード", "DispDoctor", "調剤－医師・薬剤師", 5],
    [51, "処方－医療機関レコード", "PrescriptionHospital", "処方－医療機関", 5],
    [55, "処方－医師レコード", "PrescriptionDoctor", "処方－医師", 5, true],
    [201, "薬品レコード", "Medicine", "薬品", -2, true],
    [281, "薬品補足レコード", "MedicineComplement", "薬品補足", 201, true],
    [291, "薬品服用注意レコード", "MedicineCaution", "薬品服用注意", 201, true],
    [301, "用法レコード", "Usage", "用法", -2],
    [311, "用法補足レコード", "UsageComplement", "用法補足", 301, true],
    [391, "処方服用注意レコード", "UsageCaution", "処方服用注意", -2, true],
    [401, "服用注意レコード", "DosingCaution", "服用注意", 5, true],
    [411, "医療機関等提供情報レコード", "HospitalInfo", "医療機関等提供情報", 5, true],
    [501, "備考レコード", "Note", "備考", 5, true],
    [601, "患者等記入レコード", "PatientComment", "患者等記入", 5, true],
    [701, "かかりつけ薬剤師レコード", "PrimaryPharmacist", "かかりつけ薬剤師", -1]
  ],
  props: [
    [-1, "登録日時", "date", "", "DATE"],

    [-2, "RP番号", "rpNo", "", "INT"],

    [0, "バージョン情報", "version", "", "TEXT"],
    [0, "出力区分", "outputDivision", "", "INT"],

    [1, "患者氏名", "name", "", "TEXT"],
    [1, "患者性別", "sex", "", "INT"],
    [1, "患者生年月日", "birthDate", "", "DATE"],
    [1, "患者郵便番号", "postalCode", "", "TEXT"],
    [1, "患者住所", "address", "", "TEXT"],
    [1, "患者電話番号", "phoneNo", "", "TEXT"],
    [1, "緊急連絡先", "contact", "", "TEXT"],
    [1, "血液型", "bloodType", "", "TEXT"],
    [1, "体重", "weight", "", "TEXT"],
    [1, "患者氏名カナ", "nameKana", "", "TEXT"],

    [2, "患者特記種別", "type", "", "INT"],
    [2, "患者特記内容", "content", "", "TEXT"],
    [2, "レコード作成者", "author", "", "INT"],

    [3, "薬品名称", "name", "", "TEXT"],
    [3, "服用開始年月日", "startDate", "", "DATE"],
    [3, "服用終了年月日", "endDate", "", "DATE"],
    [3, "レコード作成者", "author", "", "INT"],

    [5, "調剤等年月日", "date", "", "DATE"],
    [5, "レコード作成者", "author", "", "TEXT"],

    [11, "医療機関等名称", "name", "医療機関等", "TEXT"],
    [11, "医療機関等都道府県", "prefecture", "", "TEXT"],
    [11, "医療機関等点数表", "scoreTable", "", "TEXT"],
    [11, "医療機関等コード", "code", "", "TEXT"],
    [11, "医療機関等郵便番号", "postalCode", "", "TEXT"],
    [11, "医療機関等住所", "address", "", "TEXT"],
    [11, "医療機関等電話番号", "phoneNo", "", "TEXT"],
    [11, "レコード作成者", "author", "", "INT"],

    [15, "医師・薬剤師氏名", "name", "医師・薬剤師", "TEXT"],
    [15, "医師・薬剤師連絡先", "contact", "", "TEXT"],
    [15, "レコード作成者", "author", "", "INT"],

    [51, "医療機関名称", "name", "医療機関", "TEXT"],
    [51, "医療機関都道府県", "prefecture", "", "TEXT"],
    [51, "医療機関点数表", "scoreTable", "", "TEXT"],
    [51, "医療機関コード", "code", "", "TEXT"],
    [51, "レコード作成者", "author", "", "INT"],

    [55, "医師氏名", "name", "医師", "TEXT"],
    [55, "診療科名", "department", "診療科", "TEXT"],
    [55, "レコード作成者", "author", "", "INT"],

    [201, "RP 番号", "rpNo", "", "INT"],
    [201, "薬品名称", "name", "", "TEXT"],
    [201, "用量", "dose", "", "TEXT"],
    [201, "単位名", "unitName", "", "TEXT"],
    [201, "薬品コード種別", "codeType", "", "INT"],
    [201, "薬品コード", "code", "", "TEXT"],
    [201, "レコード作成者", "author", "", "INT"],

    [281, "RP 番号", "rpNo", "", "INT"],
    [281, "薬品補足情報", "info", "補足情報", "TEXT"],
    [281, "レコード作成者 ", "author", "", "INT"],

    [291, "RP 番号", "rpNo", "", "INT"],
    [291, "内容", "content", "", "TEXT"],
    [291, "レコード作成者", "author", "", "INT"],

    [301, "RP 番号", "rpNo", "", "INT"],
    [301, "用法名称", "name", "", "TEXT"],
    [301, "調剤数量", "volume", "", "INT"],
    [301, "調剤単位", "unit", "", "TEXT"],
    [301, "剤型コード", "MedicineType", "", "TEXT"],
    [301, "用法コード種別", "codeType", "", "INT"],
    [301, "用法コード", "code", "", "TEXT"],
    [301, "レコード作成者", "author", "", "INT"],

    [311, "RP 番号", "prNo", "", "INT"],
    [311, "用法補足情報", "info", "用法補足", "TEXT"],
    [311, "レコード作成者", "author", "", "INT"],

    [391, "RP 番号", "rpNo", "", "INT"],
    [391, "内容", "content", "処方服用注意", "TEXT"],
    [391, "レコード作成者", "author", "", "INT"],

    [401, "内容", "content", "服用注意", "TEXT"],
    [401, "レコード作成者", "author", "", "INT"],

    [411, "内容", "content", "", "TEXT"],
    [411, "提供情報種別", "infoType", "", "INT"],
    [411, "レコード作成者", "author", "", "INT"],

    [501, "備考情報", "noteInfo", "備考", "TEXT"],
    [501, "レコード作成者", "author", "", "INT"],

    [601, "患者等記入情報", "comment", "患者等記入情報", "TEXT"],
    [601, "入力年月日", "date", "", "TEXT"],

    [701, "かかりつけ薬剤師氏名", "name", "", "TEXT"],
    [701, "勤務先薬局名称", "PharmacyName", "", "TEXT"],
    [701, "連絡先", "contact", "", "TEXT"],
    [701, "担当開始日", "respStart", "", "DATE"],
    [701, "担当終了日", "respEnd", "", "DATE"],
    [701, "レコード作成者", "author", "", "INT"],
  ]
}