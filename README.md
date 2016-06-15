# okusulist

マルチプラットフォームなお薬手帳アプリ。
Cordovaプロジェクトです。

Android, iOSで動作確認していますが、Appleの開発者登録料が高いのでiOS版は頒布できません。

実装速度優先でリファクタリングしてないのでお察し。

## 機能

https://yakutai.ddc.co.jp/okusuri-techo-contents.html
こちらの要件を満たしています。（乳幼児向けを除く）

- 処方データQRコード読み取り（[電子版お薬手帳データフォーマット仕様書Ver.2.1](https://www.jahis.jp/files/user/images/%E9%9B%BB%E5%AD%90%E7%89%88%E3%81%8A%E8%96%AC%E6%89%8B%E5%B8%B3%E3%83%87%E3%83%BC%E3%82%BF%E3%83%95%E3%82%A9%E3%83%BC%E3%83%9E%E3%83%83%E3%83%88%E4%BB%95%E6%A7%98%E6%9B%B8Ver.2.1_20160308.pdf)準拠）
- 処方データの手動入力（外部サイト（ http://lifecloud.sfc.keio.ac.jp/mykarte/okusuri/prescription4QR/ ）を使用）
- 処方データのQRコード表示
- 薬品の詳細情報検索（[くすりのしおり](http://www.rad-ar.or.jp/siori/)、Google）
- 日付検索
- ファイルエクスポート
- ファイルインポート
- ファイルエクスポート・インポートによる擬似バックアップ・リストア
- スタンドアロン型（ネットワーク通信なし）

## TODO

### 優先度中
- スキンでデザインを変える（萌えスキンを作りたい）

### 優先度低
- OTC医薬品の詳細検索
- 薬品名による検索
- 複数アカウント
- リファクタリング
- DBマイグレーション
