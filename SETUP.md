# 🚀 プロジェクトセットアップガイド

## 📋 前提条件

### 必要なソフトウェア
- **Node.js**: 18.x以上
- **npm**: 最新版推奨
- **Git**: バージョン管理用
- **ブラウザ**: Chrome, Firefox, Safari, Edge（最新版）

### 推奨開発環境
- **IDE**: Visual Studio Code
- **拡張機能**: 
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
  - ESLint
  - Prettier

## 🔧 セットアップ手順

### Step 1: プロジェクトのクローン・ダウンロード
```bash
# Gitリポジトリからクローンの場合
git clone [repository-url]
cd rag_portfolio

# または、ZIPファイルをダウンロードして展開
# rag_portfolioフォルダに移動
```

### Step 2: 依存関係のインストール
```bash
# プロジェクトディレクトリに移動
cd rag_portfolio

# 依存関係をインストール
npm install
```

### Step 3: 環境変数の設定
1. **Gemini APIキーの取得**
   - [Google AI Studio](https://makersuite.google.com/app/apikey)にアクセス
   - Googleアカウントでログイン
   - 「Create API Key」をクリック
   - 生成されたAPIキーをコピー

2. **環境変数ファイルの作成**
   ```bash
   # プロジェクトルートに.env.localファイルを作成
   cp env.example .env.local
   ```

3. **APIキーの設定**
   ```env
   # .env.localファイルを編集
   NEXT_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here
   ```

### Step 4: 開発サーバーの起動
```bash
# 開発サーバーを起動
npm run dev
```

### Step 5: アプリケーションの確認
- ブラウザで http://localhost:3000 にアクセス
- アプリケーションが正常に表示されることを確認

## 🧪 動作確認

### 1. 基本動作確認
1. **ファイルアップロード機能**
   - `data/sample_personnel.csv` または `data/[RAG研修用]サンプルデータ.xlsx` をアップロード
   - アップロード成功メッセージが表示されることを確認

2. **検索機能**
   - 検索例ボタンをクリック
   - 適切な検索結果が表示されることを確認

3. **チャット機能**
   - チャットボックスに質問を入力
   - Gemini APIからの回答が表示されることを確認

### 2. エラー確認
- **APIキー未設定**: 赤いエラー表示
- **ファイル形式エラー**: サポートされていないファイル形式のアップロード
- **ネットワークエラー**: インターネット接続を一時的に切断

## 🔍 トラブルシューティング

### よくある問題と解決方法

#### 問題1: `npm install`でエラーが発生
```bash
# Node.jsバージョンを確認
node --version

# npmキャッシュをクリア
npm cache clean --force

# node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

#### 問題2: 開発サーバーが起動しない
```bash
# ポート3000が使用中の場合
# 別のポートで起動
npm run dev -- -p 3001

# または、使用中のプロセスを終了
# Windows: netstat -ano | findstr :3000
# macOS/Linux: lsof -i :3000
```

#### 問題3: Gemini APIが動作しない
1. **APIキーの確認**
   ```bash
   # .env.localファイルの内容を確認
   cat .env.local
   ```

2. **APIキーの有効性確認**
   - Google AI StudioでAPIキーが有効か確認
   - 利用制限に達していないか確認

3. **環境変数の再読み込み**
   ```bash
   # 開発サーバーを再起動
   npm run dev
   ```

#### 問題4: ファイルアップロードでエラー
1. **ファイル形式の確認**
   - サポート形式: `.xlsx`, `.xls`, `.csv`
   - ファイルサイズ: 10MB以下推奨

2. **ファイル内容の確認**
   - 必須列: 氏名, 部署, スキル, 資格, 経験, 経験年数
   - データ形式が正しいか確認

## 📚 開発者向け情報

### 開発コマンド
```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm run start

# 型チェック
npm run type-check

# リンター実行
npm run lint
```

### ファイル構造の理解
```
src/
├── components/     # Reactコンポーネント
├── lib/           # ビジネスロジック
└── types/         # TypeScript型定義

docs/              # プロジェクトドキュメント
data/              # サンプルデータ
```

### 主要ファイルの役割
- `app/page.tsx`: メインアプリケーション
- `src/lib/advanced-search-engine.ts`: 検索エンジン
- `src/lib/gemini-api.ts`: AI API連携
- `src/components/ChatUI.tsx`: チャットインターフェース

## 🎯 次のステップ

### 学習リソース
- [Next.js公式ドキュメント](https://nextjs.org/docs)
- [React公式ドキュメント](https://react.dev)
- [TypeScript公式ドキュメント](https://www.typescriptlang.org/docs)
- [Tailwind CSS公式ドキュメント](https://tailwindcss.com/docs)

### 拡張アイデア
1. **データベース連携**: localStorageから外部DBへの移行
2. **認証機能**: ユーザー管理システムの追加
3. **ファイル形式拡張**: PDFやその他形式のサポート
4. **UI/UX改善**: より高度なインターフェースの実装

## 📞 サポート

技術的な質問や問題がある場合は、以下を確認してください：

1. **プロジェクトドキュメント**: `docs/`フォルダ内のドキュメント
2. **開発記録**: `03_開発の流れ_実装記録.md`
3. **GitHub Issues**: プロジェクトのIssuesページ

---

**最終更新**: 2024年12月  
**バージョン**: 1.0.0 