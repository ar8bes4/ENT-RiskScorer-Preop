# ENT-RiskScorer-Preop

HTML・CSS・JavaScriptだけで動作する術前スコア計算補助ツールです。`index.html`をブラウザで開いて利用します。

## 機能
- MICA、RCRI、Gupta PRF、ARISCAT、HNSRI、HN-CCIの結果表示とテキストサマリーのコピー。
- ASA-PS・年齢・機能状態などの入力に応じた更新。
- 無効な入力では結果を消去し、コピーを停止。
- アプリからの外部通信・患者入力の保存はありません。

## 2026-10-09の修正
MICAのASA5を基準値0に修正し、手術分類21件の係数を原著Table 2に合わせました。曖昧な「一般外科」を廃止し、甲状腺・副甲状腺を独立させました。

ARISCATは「2時間以下／2時間超〜3時間以下／3時間超」、HNSRIは「4時間未満／4時間以上〜8時間以下／8時間超」です。

年齢は整数16〜120歳を本アプリの入力範囲とします。下限はMICA原著の対象集団、上限は誤入力防止の運用上限で、モデルの適用保証ではありません。空欄・範囲外・小数・未選択では計算しません。

## 検証と限界
MICA原著Table 2の公開済み丸め係数を使用します。原著本文の症例数値との小差は、丸め係数を用いるため生じます（70歳・ASA3・自立・正常Cr・脳手術: 表から1.25%、本文1.22%）。

PRFはENT手術固定で、MICA手術選択とは連動しません。PRF原著係数表とHN-CCIの重みの原著照合は未完了です。臨床判断の代替には使用しないでください。

## 再検証
`tests/browser-regression.cjs`はPlaywrightとChromeを使用し、架空入力だけで係数・年齢・時間区分・コピー・画面幅を確認します。

```sh
PLAYWRIGHT_MODULE=/path/to/playwright CHROME_PATH=/path/to/chrome node tests/browser-regression.cjs
```

## 根拠
- [Gupta 2011: MICA Table 1・2](https://d1xe7tfg0uwul9.cloudfront.net/cbc-portal/wp-content/uploads/2013/08/062013-CIRC2.pdf)
- [Canet 2010: ARISCAT Table 6](https://www.hospitaldelmar.cat/media/upload_web/pdf/article_Anesthesiology_editora_46_3389_1.pdf)
- [Mascarella 2019: HNSRI Table 2](https://jamanetwork.com/journals/jamaotolaryngology/fullarticle/2725439)
