# daily-report-app

日報/週報/月報をまとめて記録できるローカルWebアプリです。  
以下の5項目を日付ごとに記録でき、さらに週報/月報も画面から直接入力できます。

- やったこと
- 良かったこと
- 反省点
- 感謝すること
- 明日やること

データはブラウザの `localStorage` に保存されます。

## 使い方

1. `index.html` をブラウザで開く
2. 日付と5項目を入力して保存
3. 一覧から過去分を確認・削除
4. バックアップしたいときは `JSON出力`
5. 体裁を揃えて書き出したいときは以下から選択（`日付`で選んだ月のデータから自動生成）
   - `Markdown（日報）出力`（`daily-YYYY-MM.md` をDL）
   - `Markdown（日報：週ごと集約）出力`（`daily-compact-YYYY-MM.md` をDL）
   - `Markdown（週報）出力`（`weekly-YYYY-MM.md` をDL）
   - `Markdown（月報）出力`（`monthly-YYYY-MM.md` をDL）
6. 復元したいときは `JSON読込`

## 補足

- 同じ日付で保存すると上書き確認が表示されます
- 保存先はブラウザ内のため、別端末/別ブラウザには自動同期されません
- ブラウザデータ削除で消える可能性があるため、必要なら定期的にJSON出力してください
- `日報/週報/月報` のMarkdown出力は、`daily-report-app` 内の `localStorage` から自動生成します

## ローカルでサーバ起動（任意）

```sh
cd daily-report-app
python3 -m http.server 8081
```

ブラウザで `http://localhost:8081/` を開いてください。
