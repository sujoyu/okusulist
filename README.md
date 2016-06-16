# okusulist

マルチプラットフォームなお薬手帳アプリ。
Cordovaプロジェクトです。

Android, iOSで動作確認していますが、Appleの開発者登録料が高いのでiOS版は頒布できません。

実装速度優先でリファクタリングしてないのでお察し。

ダウンロードはこちら https://github.com/sujoyu/okusulist/releases

## スクリーンショット

![2016-06-10 13 25 36](https://cloud.githubusercontent.com/assets/11418915/16082025/0edd02ba-334b-11e6-8dab-c208c4a3265b.png)
![2016-06-10 13 26 14](https://cloud.githubusercontent.com/assets/11418915/16082039/20a7548c-334b-11e6-8eb8-b0b94615495a.png)
![2016-06-10 13 27 53](https://cloud.githubusercontent.com/assets/11418915/16082044/2353817e-334b-11e6-9d7f-f1bee5da50c5.png)
![2016-06-12 13 56 02](https://cloud.githubusercontent.com/assets/11418915/16082054/28d03cb4-334b-11e6-8b73-97fc4dcccf31.png)

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
