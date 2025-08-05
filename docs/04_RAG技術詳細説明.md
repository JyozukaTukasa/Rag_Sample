# RAG技術詳細説明

## 📚 RAG（Retrieval-Augmented Generation）とは？

RAGは、**検索（Retrieval）**と**生成（Generation）**を組み合わせた最新のAI技術です。従来のAIは事前に学習した知識のみで回答していましたが、RAGでは動的に情報を検索してから回答を生成するため、より正確で最新の情報を提供できます。

## 🔄 RAGの基本フロー

```
ユーザーの質問
    ↓
関連情報の検索（Retrieval）
    ↓
検索結果を基にAIが回答生成（Generation）
    ↓
自然言語での回答
```

### 従来のAI vs RAG

| 特徴 | 従来のAI | RAG |
|------|----------|-----|
| **知識の範囲** | 学習時のデータのみ | 動的に追加可能 |
| **情報の鮮度** | 学習時の時点で固定 | 常に最新 |
| **回答の根拠** | 不明（ブラックボックス） | 検索結果に基づく |
| **カスタマイズ性** | 低い | 高い |
| **情報の信頼性** | 学習データに依存 | 検索対象に依存 |

## 🏗️ RAGの技術構成

### 1. 検索システム（Retrieval）

#### キーワードマッチング
```typescript
// 完全一致検索
function exactMatch(query: string, data: string[]): boolean {
  return data.some(item => item.toLowerCase() === query.toLowerCase());
}

// 部分一致検索
function partialMatch(query: string, data: string[]): boolean {
  return data.some(item => item.toLowerCase().includes(query.toLowerCase()));
}
```

#### ベクトル検索（コサイン類似度）
```typescript
// 2つのベクトル間の類似度を計算
function calculateCosineSimilarity(vec1: number[], vec2: number[]): number {
  const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
  const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
  const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitude1 * magnitude2);
}
```

### 2. 生成システム（Generation）

#### プロンプトエンジニアリング
```typescript
// 効果的なプロンプトの例
const prompt = `
以下の人事データから、質問「${query}」に対する回答を生成してください。

検索結果：
${searchResults}

回答の要件：
1. 自然な会話形式で回答
2. 具体的な人名を含める
3. 根拠となる情報を明記
4. 簡潔で分かりやすく
`;
```

## 📊 このアプリでのRAG実装

### 1. データ構造設計

```typescript
interface PersonInfo {
  name: string;           // 氏名
  department: string;     // 部署
  skills: string[];       // スキル（プログラミング言語など）
  qualifications: string[]; // 資格
  experience: string;     // 経験年数
  selfPR: string;        // 自己PR
}
```

### 2. 検索アルゴリズム

#### 検索タイプの自動判定
```typescript
function determineSearchType(query: string): SearchType {
  if (query.includes('何人')) return 'AGGREGATION';
  if (query.includes('さん') || query.includes('氏')) return 'EXACT_NAME';
  if (query.includes('部')) return 'DEPARTMENT';
  if (query.includes('得意') || query.includes('できる')) return 'SKILL';
  return 'SIMILARITY';
}
```

#### 重み付け検索
```typescript
function calculateRelevanceScore(query: string, person: PersonInfo): number {
  let score = 0;
  
  // 名前の完全一致（最高重み）
  if (person.name.toLowerCase().includes(query.toLowerCase())) {
    score += 100;
  }
  
  // 部署の完全一致（高重み）
  if (person.department.toLowerCase().includes(query.toLowerCase())) {
    score += 80;
  }
  
  // スキルの完全一致（中重み）
  if (person.skills.some(skill => skill.toLowerCase().includes(query.toLowerCase()))) {
    score += 60;
  }
  
  // 資格の完全一致（中重み）
  if (person.qualifications.some(qual => qual.toLowerCase().includes(query.toLowerCase()))) {
    score += 50;
  }
  
  return score;
}
```

### 3. AI回答生成

#### Gemini APIとの連携
```typescript
async function generateResponse(query: string, searchResults: SearchResult[]): Promise<string> {
  const prompt = `
以下の人事データから、質問「${query}」に対する回答を生成してください。

検索結果：
${formatSearchResults(searchResults)}

回答は自然な会話形式で、具体的な人名と根拠を含めてください。
`;

  const response = await geminiAPI.generateText(prompt);
  return response.text;
}
```

## 🎯 検索アルゴリズムの詳細

### 1. 完全一致検索
- **対象**: 名前、部署、スキル、資格
- **処理**: 大文字小文字を無視した完全一致
- **優先度**: 最高

### 2. 部分一致検索
- **対象**: 名前、部署、スキル、資格、自己PR
- **処理**: キーワードが含まれているかのチェック
- **優先度**: 高

### 3. 類似性検索
- **対象**: 関連スキル、類似部署
- **処理**: コサイン類似度による計算
- **優先度**: 中

### 4. 集計検索
- **対象**: 人数カウント、統計情報
- **処理**: 条件に合致するデータの集計
- **優先度**: 特殊

## 🔍 実際の検索例

### 例1: 「Pythonが得意な人はいますか？」

#### 検索プロセス
1. **検索タイプ判定**: SKILL
2. **キーワード抽出**: "Python"
3. **完全一致検索**: skills配列で"Python"を検索
4. **結果ランキング**: 関連性スコアでソート
5. **AI回答生成**: 検索結果を基に自然言語で回答

#### 期待される結果
```
田中さんがPythonを得意としています。
スキル: Python, JavaScript, React
部署: 開発部
経験年数: 3年
```

### 例2: 「開発部に所属している人は何人ですか？」

#### 検索プロセス
1. **検索タイプ判定**: AGGREGATION
2. **キーワード抽出**: "開発部"
3. **部署完全一致**: department = "開発部"を検索
4. **人数カウント**: 条件に合致する人数を計算
5. **AI回答生成**: 集計結果を自然言語で回答

#### 期待される結果
```
開発部に所属している人は3名います。
- 田中さん（Python, JavaScript）
- 佐藤さん（Java, Spring Boot）
- 鈴木さん（React, TypeScript）
```

## 🚀 パフォーマンス最適化

### 1. 検索効率化
```typescript
// インデックス作成
const skillIndex = new Map<string, string[]>();
persons.forEach(person => {
  person.skills.forEach(skill => {
    if (!skillIndex.has(skill)) {
      skillIndex.set(skill, []);
    }
    skillIndex.get(skill)!.push(person.name);
  });
});
```

### 2. キャッシュ機能
```typescript
// 検索結果のキャッシュ
const searchCache = new Map<string, SearchResult[]>();

function getCachedSearch(query: string): SearchResult[] | null {
  return searchCache.get(query) || null;
}
```

### 3. タイムアウト処理
```typescript
// 非同期処理のタイムアウト
async function withTimeout<T>(
  promise: Promise<T>, 
  timeoutMs: number
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Timeout')), timeoutMs);
  });
  
  return Promise.race([promise, timeoutPromise]);
}
```

## 🔧 技術的な課題と解決策

### 1. 検索精度の向上
**課題**: 類似性計算が不正確
**解決策**: 重み付けシステムの導入

```typescript
// フィールド別重み付け
const WEIGHTS = {
  name: 1.0,        // 最高重み
  department: 0.8,  // 高重み
  skills: 0.6,      // 中重み
  qualifications: 0.5, // 中重み
  experience: 0.3,  // 低重み
  selfPR: 0.2       // 最低重み
};
```

### 2. 応答速度の改善
**課題**: 大量データでの検索が遅い
**解決策**: インデックス作成とキャッシュ

### 3. 自然言語理解の向上
**課題**: 複雑な質問への対応
**解決策**: 質問タイプの自動分類

## 📈 今後の技術拡張

### 1. ベクトルデータベース
- **Pinecone**: 高次元ベクトルの効率的な検索
- **Weaviate**: スキーマベースのベクトルDB
- **Qdrant**: 高速な類似性検索

### 2. 高度なNLP技術
- **BERT**: 文脈を理解した検索
- **Sentence Transformers**: 文の意味的類似性計算
- **Named Entity Recognition**: 人名・組織名の自動抽出

### 3. 機械学習の統合
- **学習型ランキング**: ユーザーの行動から学習
- **推薦システム**: 関連する情報の自動推薦
- **異常検知**: データの異常を自動検出

## 🎓 学習のポイント

### 1. RAGの理解
- **検索の重要性**: 正確な情報の取得
- **生成の工夫**: 自然な回答の作成
- **組み合わせの効果**: 両者の相乗効果

### 2. 実装のコツ
- **データ構造設計**: 検索しやすい形式
- **アルゴリズム選択**: 用途に応じた最適化
- **プロンプトエンジニアリング**: AIへの効果的な指示

### 3. 運用の注意点
- **パフォーマンス監視**: 応答時間の測定
- **精度の評価**: 検索結果の妥当性確認
- **ユーザーフィードバック**: 改善点の収集

## 📚 参考資料

### 技術ドキュメント
- [RAG: Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401)
- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Next.js Documentation](https://nextjs.org/docs)

### 実装例
- [LangChain RAG Implementation](https://python.langchain.com/docs/use_cases/question_answering/)
- [Hugging Face RAG Examples](https://huggingface.co/docs/transformers/rag)

---

**このドキュメントは、RAG技術の理解と実装に役立つことを目的としています。** 