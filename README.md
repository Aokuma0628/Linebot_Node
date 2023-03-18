# Linebot
## アプリ実行方法

### docker構築
```
$ docker-compose up -d
```

### テスト
```bash
$ npm run test
```

### アプリビルド
```bash
$ npm run build
```

### 設定ファイルの編集
以下のファイルを編集する。<br>
- dist/config/appconf.json
- dist/config/logconf.js

### 実行
ビルド後に下記コマンドを実行する。
```
$ npm start
```