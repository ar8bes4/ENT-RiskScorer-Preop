# 2026-10-09 修正・再検証記録

## 対象
MICA係数、ARISCAT/HNSRI時間区分、無効入力とコピー操作。患者情報は使わず架空入力のみ。実装ソースの修正前はGit履歴で復元可能です。

## 判定
依頼された修正の回帰確認: PASS。ツール全体の医学的妥当性・臨床適用の保証は対象外です。

- Playwright + Chromeで118件の数値・入力・時間区分チェックが成功。
- MICAは原著Table 2の手術21分類×ASA5分類の組合せを独立期待式と照合。標準入力は0.57%。ASA5は基準値0。
- 空欄、負値、0、15、121、小数年齢で全結果を消去しコピー停止。16/120歳で復帰。未選択を拒否。
- 16歳はMICA原著集団の下限、120歳は運用上の誤入力防止上限。適用保証の上限ではない。
- ARISCATの選択肢は≤2、>2〜≤3、>3時間。HNSRIは<4、4〜≤8、>8時間。各選択値の点数と表記を確認。
- コピー成功とブラウザによる拒否の両方を確認。拒否時は手動コピー案内を表示。未処理例外なし。
- 1280px/390pxで横方向のページはみ出しなし。
- Clinical SPA検品スクリプト: PASS（外部依存、JSONデータ、印刷スタイル等の静的確認）。

## Visual QA Audit Report
- Contract: 既存の青・白配色とカード構成を保持。計算値0.57%、時間区分、入力エラーが読めること。
- Attempts: 2（静的検品で指摘されたJSONデータ分離・印刷スタイルを補完）。
- Final status: PASS（今回変更した画面要素の範囲）。
- Artifact integrity: 単一HTML、UTF-8、ブラウザ読込・3タブ切替成功。
- Text integrity: DOMの数値と時間区分をテスト。PCの心血管・呼吸器・入力エラー画面をローカルVision OCRで確認。OCR固有の記号誤認は元テキストと目視で区別。
- Render/vision: PCの3タブと入力エラー、390px画面を確認。変更箇所に重なり・文字化けなし。モバイルのネイティブ選択欄は長い既存ラベルが省略されるため、選択時に全文確認が必要（MINOR）。モバイルの全スクロール領域のOCRは未実施。
- Preview evidence: 一時画像は`/private/tmp/ent-final-*.png`。再生成はブラウザテストに`QA_DIR`を指定。

## 未確認事項
PRFの原著係数表、HN-CCIの重みの原著照合は未完了で、今回変更していません。PRFはENT固定でMICA手術分類と連動しません。RCRIの全予後確率の根拠再監査も今回対象外です。

公開表の丸め済み係数と本文の症例値には小差があります。70歳・ASA3・正常Cr・自立・脳手術では表から1.25%、本文例1.22%。係数の不一致による旧実装の差と区別します。

## 根拠
- [Gupta 2011 Table 1・2](https://d1xe7tfg0uwul9.cloudfront.net/cbc-portal/wp-content/uploads/2013/08/062013-CIRC2.pdf)
- [Canet 2010 Table 6](https://www.hospitaldelmar.cat/media/upload_web/pdf/article_Anesthesiology_editora_46_3389_1.pdf)
- [Mascarella 2019 Table 2](https://jamanetwork.com/journals/jamaotolaryngology/fullarticle/2725439)
