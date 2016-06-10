# okusulist

マルチプラットフォームなお薬手帳アプリ。
Cordovaプロジェクトです。

Android, iOSで動作確認していますが、Appleの開発者登録が高いのでiOS版は頒布できません。

お金ください。

リファクタリングしてないのでお察しクオリティ。

## 機能

https://yakutai.ddc.co.jp/okusuri-techo-contents.html
こちらの要件を満たしています。（乳幼児向けを除く）

- ファイルエクスポート
- ファイルインポート
- 日付検索
- スタンドアロン型（ネットワーク通信なし）

## TODO

### 優先度中
- 複数ファイルインポート
- 一つのファイルに複数のデータが入ってるインポート
- 単一処方データのエクスポート
- 一つのファイルに複数のデータを入れるエクスポート
- 単一処方データのQRコード表示
- 処方データの手動入力、編集
- 薬品の詳細情報表示
- スキンでデザインを変える（萌えスキンを作りたい）

### 優先度低
- 薬品名による検索
- バックアップ、リストア
- リファクタリング
- DBマイグレーション
