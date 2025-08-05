/**
 * 検索例コンポーネント
 * 事前定義された検索例を表示
 */

import React from 'react';

// プロパティの型定義
interface SearchExamplesProps {
  onExampleClick: (example: string) => void;
}

/**
 * 検索例コンポーネント
 */
export default function SearchExamples({ onExampleClick }: SearchExamplesProps) {
  // 多様な検索例でRAG機能をテスト
  const examples = [
    'Pythonが得意な人はいますか？',
    'AWSの資格を持っている人を教えてください',
    '開発部で優秀な人は誰ですか？',
    'Web系のエンジニアはいますか？',
    '新人向けのメンターを探しています',
    'インフラの専門家は誰ですか？',
    'デザインができる人はいますか？',
    '経験年数が長い人は誰ですか？',
    '複数のスキルを持っている人は？',
    '若手で成長している人はいますか？'
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
      <h3 className="text-sm font-semibold text-gray-800 mb-2">検索例</h3>
      <div className="space-y-1">
        {examples.map((example, index) => (
          <button
            key={index}
            className="w-full text-left px-2 py-1 text-xs text-gray-700 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 rounded border border-gray-200 transition-colors duration-200"
            onClick={() => onExampleClick(example)}
            title={example}
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}