/**
 * Gemini API連携機能
 * Google Gemini APIを使用して人物検索・チャット機能を提供
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { PersonInfo, ChatMessage } from '../types';
import { AdvancedSearchEngine, AdvancedSearchResult, AggregationResult } from './advanced-search-engine';



// 高度な検索エンジンのインスタンス
const advancedSearchEngine = new AdvancedSearchEngine();

// Gemini APIインスタンスを取得
function getGeminiAPI() {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('Gemini APIキーが設定されていません。.env.localファイルでNEXT_PUBLIC_GEMINI_API_KEYを設定してください。');
  }
  
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Gemini APIが利用可能かチェック
 * @returns 利用可能な場合はtrue
 */
export function isGeminiAvailable(): boolean {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    return !!(apiKey && apiKey !== 'your_gemini_api_key_here');
  } catch (error) {
    console.error('Gemini API利用可能性チェックエラー:', error);
    return false;
  }
}

/**
 * Gemini APIキーの詳細情報を取得
 * @returns APIキーの状態情報
 */
export function getGeminiStatus(): {
  isAvailable: boolean;
  hasApiKey: boolean;
  isConfigured: boolean;
  message: string;
} {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  if (!apiKey) {
    return {
      isAvailable: false,
      hasApiKey: false,
      isConfigured: false,
      message: 'APIキーが設定されていません'
    };
  }
  
  if (apiKey === 'your_gemini_api_key_here') {
    return {
      isAvailable: false,
      hasApiKey: true,
      isConfigured: false,
      message: 'APIキーがデフォルト値のままです'
    };
  }
  
  return {
    isAvailable: true,
    hasApiKey: true,
    isConfigured: true,
    message: 'APIキーが正常に設定されています'
  };
}

/**
 * Gemini APIを使用して応答を生成
 * @param prompt プロンプト
 * @returns 生成された応答
 */
async function generateResponse(prompt: string): Promise<string> {
  try {
    // Gemini APIが利用可能かチェック
    if (!isGeminiAvailable()) {
      const status = getGeminiStatus();
      throw new Error(`Gemini APIが利用できません: ${status.message}`);
    }
    
    const genAI = getGeminiAPI();
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text.trim();
  } catch (error) {
    console.error('Gemini API応答生成エラー:', error);
    return '応答生成中にエラーが発生しました。';
  }
}

/**
 * 人物情報を検索エンジンに初期化
 * @param persons 人物情報配列
 */
export function initializeSearchEngine(persons: PersonInfo[]): void {
  console.log('🔧 検索エンジン初期化開始');
  advancedSearchEngine.initialize(persons);
}

/**
 * 高度な人物検索を実行
 * @param query 検索クエリ
 * @param persons 人物情報配列
 * @returns 検索結果文字列
 */
export async function searchPersonsWithGemini(query: string, persons: PersonInfo[]): Promise<string> {
  try {
    console.log('🔍 高度な人物検索開始:', query);
    
    if (!persons || persons.length === 0) {
      return '人物情報が登録されていません。まずファイルをアップロードしてください。';
    }

    if (!query || query.trim() === '') {
      return '検索クエリが入力されていません。';
    }

    // 検索エンジンが初期化されていない場合は初期化
    if (persons.length > 0) {
      initializeSearchEngine(persons);
    }

    // 高度な検索を実行
    const searchResult = await advancedSearchEngine.search(query);
    
    // 質問タイプに応じた処理
    if (searchResult.shouldUseGemini) {
      console.log('🤖 Geminiを使用して回答を生成');
      return await generateIntelligentResponse(query, persons, searchResult.queryType);
    }
    
    // 結果をフォーマット
    const formattedResult = advancedSearchEngine.formatResults(
      searchResult.results, 
      searchResult.aggregation
    );
    
    console.log('✅ 高度な検索完了');
    return formattedResult;
    
  } catch (error) {
    console.error('❌ 高度な検索エラー:', error);
    return '検索中にエラーが発生しました。';
  }
}

/**
 * 知的な回答を生成（Gemini使用）
 * @param query クエリ
 * @param persons 人物情報
 * @param queryType 質問タイプ
 * @returns 回答
 */
async function generateIntelligentResponse(
  query: string, 
  persons: PersonInfo[], 
  queryType: string
): Promise<string> {
  try {
    // 人物情報のサマリーを作成
    const personSummary = createPersonSummary(persons);
    
    // 質問タイプに応じたプロンプトを生成
    const prompt = generatePromptByType(query, personSummary, queryType);
    
    const response = await generateResponse(prompt);
    console.log('✅ 知的な回答生成完了');
    
    return response;
  } catch (error) {
    console.error('❌ 知的な回答生成エラー:', error);
    return '回答生成中にエラーが発生しました。';
  }
}

/**
 * 人物情報のサマリーを作成
 * @param persons 人物情報配列
 * @returns サマリー文字列
 */
function createPersonSummary(persons: PersonInfo[]): string {
  const departments = [...new Set(persons.map(p => p.department))];
  const allSkills = persons.flatMap(p => p.skills);
  const uniqueSkills = [...new Set(allSkills)];
  const allQualifications = persons.flatMap(p => p.qualifications);
  const uniqueQualifications = [...new Set(allQualifications)];
  
  const avgExperience = persons.reduce((sum, p) => sum + p.yearsOfExperience, 0) / persons.length;
  const maxExperience = Math.max(...persons.map(p => p.yearsOfExperience));
  const minExperience = Math.min(...persons.map(p => p.yearsOfExperience));
  
  // 部署別統計
  const deptStats = departments.map(dept => {
    const deptPersons = persons.filter(p => p.department === dept);
    const avgExp = deptPersons.reduce((sum, p) => sum + p.yearsOfExperience, 0) / deptPersons.length;
    const skills = [...new Set(deptPersons.flatMap(p => p.skills))];
    return {
      name: dept,
      count: deptPersons.length,
      avgExperience: Math.round(avgExp * 10) / 10,
      skills: skills.slice(0, 5) // 上位5スキルのみ
    };
  });
  
  // スキル別統計
  const skillStats = uniqueSkills.map(skill => {
    const skillPersons = persons.filter(p => p.skills.includes(skill));
    return {
      name: skill,
      count: skillPersons.length,
      departments: [...new Set(skillPersons.map(p => p.department))]
    };
  }).sort((a, b) => b.count - a.count).slice(0, 10); // 上位10スキル
  
  return `
【組織概要】
総人数: ${persons.length}人
部署数: ${departments.length}部署
平均経験年数: ${Math.round(avgExperience * 10) / 10}年
最高経験年数: ${maxExperience}年
最低経験年数: ${minExperience}年

【部署別情報】
${deptStats.map(dept => 
  `${dept.name}: ${dept.count}人 (平均経験${dept.avgExperience}年)
  主なスキル: ${dept.skills.join(', ')}`
).join('\n')}

【主要スキル】
${skillStats.map(skill => 
  `${skill.name}: ${skill.count}人が保有 (部署: ${skill.departments.join(', ')})`
).join('\n')}

【保有資格】
${uniqueQualifications.join(', ')}

【詳細人物情報】
${persons.map(p => 
  `${p.name} (${p.department})
  スキル: ${p.skills.join(', ')}
  資格: ${p.qualifications.join(', ')}
  経験: ${p.experience} (${p.yearsOfExperience}年)
  自己PR: ${p.selfPR}`
).join('\n\n')}
  `.trim();
}

/**
 * 質問タイプに応じたプロンプトを生成
 * @param query クエリ
 * @param personSummary 人物サマリー
 * @param queryType 質問タイプ
 * @returns プロンプト
 */
function generatePromptByType(query: string, personSummary: string, queryType: string): string {
  switch (queryType) {
    case 'general_question':
      return `あなたは会社の人事データを分析する専門家です。以下の人物情報を参考に、ユーザーの質問に自然で親しみやすく答えてください。

人物情報:
${personSummary}

ユーザーの質問: ${query}

回答のポイント:
- データに基づいた具体的な情報を提供
- 必要に応じて分析や洞察を加える
- 自然で親しみやすい口調で回答
- 100文字以内で簡潔に回答
- ユーザーの意図を理解して適切な情報を提供
- 必要に応じて推奨や提案も含める

回答:`;
        
    case 'analytical':
      return `あなたは人事データの分析専門家です。以下の人物情報を基に、ユーザーの分析的な質問に回答してください。

人物情報:
${personSummary}

ユーザーの質問: ${query}

分析のポイント:
- データに基づいた客観的な分析
- 数値や統計を活用
- 傾向や特徴を指摘
- 実用的な洞察を提供
- 比較やランキングがある場合は明確に示す
- 分析結果の意味や影響も説明

回答:`;
        
    case 'fuzzy_search':
      return `あなたは人物検索の専門家です。以下の人物情報から、ユーザーの曖昧な検索要求に最も適した人物を推薦してください。

人物情報:
${personSummary}

ユーザーの検索: ${query}

推薦のポイント:
- 検索意図を推測して最適な人物を選択
- 選択理由を明確に説明
- 複数の候補がある場合は比較して推薦
- 親しみやすい口調で回答
- ユーザーのニーズに合わせた提案
- 必要に応じて代替案も提示

回答:`;
        
    case 'exact_search':
      return `あなたは人物検索の専門家です。以下の人物情報から、ユーザーの具体的な検索要求に最も適した人物を見つけてください。

人物情報:
${personSummary}

ユーザーの検索: ${query}

検索のポイント:
- 具体的なキーワードに基づく検索
- 完全一致を優先
- 部分一致も考慮
- 関連性の高い順に表示
- 検索結果がない場合は類似する候補を提案
- 検索条件を明確に説明

回答:`;
        
    default:
      return `以下の人物情報を参考に、ユーザーの質問に自然で分かりやすく答えてください。

人物情報:
${personSummary}

ユーザーの質問: ${query}

回答のポイント:
- データに基づいた具体的な情報を提供
- 自然で親しみやすい口調で回答
- ユーザーの意図を理解して適切な情報を提供
- 必要に応じて分析や洞察を加える

回答:`;
  }
}

/**
 * 人物情報とチャット
 * @param message ユーザーメッセージ
 * @param persons 人物情報配列
 * @param chatHistory チャット履歴
 * @returns チャット応答
 */
export async function chatWithPersons(
  message: string, 
  persons: PersonInfo[], 
  chatHistory: ChatMessage[] = []
): Promise<string> {
  try {
    console.log('💬 高度なチャット開始:', message);
    
    if (!persons || persons.length === 0) {
      return '人物情報が登録されていません。まずファイルをアップロードしてください。';
    }

    // 検索エンジンが初期化されていない場合は初期化
    if (persons.length > 0) {
      initializeSearchEngine(persons);
    }

    // 高度な検索を実行
    const searchResult = await advancedSearchEngine.search(message);
    
    // 集計結果がある場合はそのまま返す
    if (searchResult.aggregation) {
      return searchResult.aggregation.description;
    }
    
    // 検索結果が少ない場合はGeminiで補完
    if (searchResult.results.length === 0) {
      return '該当する人物が見つかりませんでした。別のキーワードで検索してみてください。';
    }
    
    // 簡潔なプロンプト
    const prompt = `以下の人物情報を参考に、ユーザーの質問に簡潔に答えてください。

人物情報:
${searchResult.results.map((result, index) => 
  `${index + 1}. ${result.person.name} (${result.person.department})
    スキル: ${result.person.skills.join(', ')}
    関連性: ${result.relevance.toFixed(2)}`
).join('\n\n')}

ユーザーの質問: ${message}

回答は100文字以内で簡潔に答えてください。`;
    
    const response = await generateResponse(prompt);
    console.log('✅ 高度なチャット完了');
    
    return response;
  } catch (error) {
    console.error('❌ 高度なチャットエラー:', error);
    return '応答生成中にエラーが発生しました。';
  }
}