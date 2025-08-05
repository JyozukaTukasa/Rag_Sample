# 🚀 RAGチャットボット - 人物スキル検索システム

## 📋 プロジェクト概要

このプロジェクトは、**RAG（Retrieval-Augmented Generation）**技術を活用した人物スキル検索チャットボットです。Excel/CSVファイルから人物情報を読み込み、自然言語での質問に対して適切な回答を提供します。

### 🎯 主な機能
- **ファイルアップロード**: Excel/CSVファイルから人物データを読み込み
- **自然言語検索**: 「開発部にいる人は？」「Pythonが得意な人は？」などの質問に対応
- **集計機能**: 「開発部は何人？」などの集計質問に対応
- **チャット機能**: 会話形式での情報検索
- **データ永続化**: ローカルストレージでのデータ保存

### 🏗️ 技術スタック
- **フロントエンド**: Next.js 14, React 18, TypeScript
- **スタイリング**: Tailwind CSS
- **AI**: Google Gemini API
- **データ処理**: xlsx, papaparse
- **ストレージ**: localStorage

## 🚀 クイックスタート

### 1. 環境セットアップ
```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

### 2. Gemini API設定
1. [Google AI Studio](https://makersuite.google.com/app/apikey)でAPIキーを取得
2. プロジェクトルートに`.env.local`ファイルを作成
3. 以下の内容を記述：
```env
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

### 3. アプリケーション起動
- ブラウザで http://localhost:3000 にアクセス
- サンプルデータファイルをアップロード
- チャットで質問を開始

## 📁 プロジェクト構造

```
rag_portfolio/
├── 📄 README.md                    # プロジェクト概要
├── 📄 package.json                 # 依存関係管理
├── 📄 next.config.ts              # Next.js設定
├── 📄 tailwind.config.js          # Tailwind CSS設定
├── 📄 tsconfig.json               # TypeScript設定
├── 📄 .env.local                  # 環境変数（要作成）
│
├── 📁 app/                        # Next.js App Router
│   └── 📄 page.tsx               # メインページ
│
├── 📁 src/                        # ソースコード
│   ├── 📁 components/            # Reactコンポーネント
│   │   ├── 📄 ChatUI.tsx        # チャットインターフェース
│   │   ├── 📄 FileUpload.tsx    # ファイルアップロード
│   │   ├── 📄 SearchExamples.tsx # 検索例ボタン
│   │   └── 📄 ChatUI.module.css # チャットUIスタイル
│   │
│   ├── 📁 lib/                   # ビジネスロジック
│   │   ├── 📄 advanced-search-engine.ts # 高度な検索エンジン
│   │   ├── 📄 data-manager.ts    # データ管理
│   │   ├── 📄 gemini-api.ts     # Gemini API連携
│   │   ├── 📄 excel-reader.ts   # Excelファイル解析
│   │   ├── 📄 csv-reader.ts     # CSVファイル解析
│   │   └── 📄 file-reader.ts    # ファイル読み込み統合
│   │
│   └── 📁 types/                 # 型定義
│       └── 📄 index.ts          # 共通型定義
│
├── 📁 docs/                      # ドキュメント
│   ├── 📄 00_ドキュメント一覧.md # ドキュメント索引
│   ├── 📄 04_RAG技術詳細説明.md # RAG技術解説
│   └── 📄 05_ユーザーガイド.md   # ユーザーガイド
│
├── 📁 data/                      # サンプルデータ
│   ├── 📄 sample_personnel.csv   # CSVサンプル
│   └── 📄 [RAG研修用]サンプルデータ.xlsx # Excelサンプル
│
└── 📄 03_開発の流れ_実装記録.md   # 開発履歴
```

## 🔧 主要コンポーネント

### 📊 データ構造
```typescript
interface PersonInfo {
  name: string;           // 氏名
  department: string;     // 部署
  skills: string[];       // スキル（配列）
  qualifications: string[]; // 資格（配列）
  selfPR: string;        // 自己PR
  experience: string;     // 経験
  yearsOfExperience: number; // 経験年数
}
```

### 🔍 検索エンジン
- **キーワード完全一致**: 正確な検索
- **部分一致**: 類似キーワードの検索
- **集計機能**: 人数や統計の計算
- **会話的検索**: 自然言語での質問対応

### 💬 チャット機能
- **リアルタイム応答**: Gemini APIによる即座の回答
- **履歴管理**: チャット履歴の保存・表示
- **エラーハンドリング**: 適切なエラー表示

## 📚 ドキュメント

詳細な情報は`docs/`フォルダ内のドキュメントを参照：

- **[00_ドキュメント一覧.md](docs/00_ドキュメント一覧.md)**: 全ドキュメントの索引
- **[04_RAG技術詳細説明.md](docs/04_RAG技術詳細説明.md)**: RAG技術の詳細解説
- **[05_ユーザーガイド.md](docs/05_ユーザーガイド.md)**: ユーザー向け操作ガイド

## 🛠️ 開発者向け情報

### 開発環境セットアップ
```bash
# 依存関係インストール
npm install

# 型チェック
npm run type-check

# 開発サーバー起動
npm run dev
```

### 主要スクリプト
- `npm run dev`: 開発サーバー起動
- `npm run build`: 本番ビルド
- `npm run start`: 本番サーバー起動

### 技術的考慮事項
- **クライアントサイド処理**: ファイル解析はブラウザで実行
- **API制限**: Gemini APIの利用制限に注意
- **データ永続化**: localStorageを使用（ブラウザ依存）
- **エラーハンドリング**: タイムアウト機能付き

## 🤝 引き継ぎ時の注意点

### 必須確認事項
1. **Gemini APIキー**: `.env.local`ファイルの設定確認
2. **依存関係**: `npm install`の実行確認
3. **Node.js バージョン**: 18.x以上が必要
4. **ブラウザ対応**: モダンブラウザでの動作確認

### よくある問題
- **API制限エラー**: Gemini APIの利用制限に達した場合
- **ファイル読み込みエラー**: サポートされていないファイル形式
- **ネットワークエラー**: API接続の問題

### 拡張可能な領域
- **データベース連携**: localStorageから外部DBへの移行
- **認証機能**: ユーザー管理システムの追加
- **ファイル形式**: PDFやその他形式のサポート
- **UI/UX**: より高度なインターフェースの実装

## 📄 ライセンス

このプロジェクトは学習・研修目的で作成されています。

---

**開発者**: RAG研修プロジェクト  
**最終更新**: 2024年12月