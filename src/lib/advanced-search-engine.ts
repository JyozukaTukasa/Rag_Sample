/**
 * 高度な検索エンジン
 * チャンク化、コサイン類似度、集計機能を提供
 */

import { PersonInfo } from '../types';

// チャンク情報の型定義
export interface Chunk {
  id: string;
  content: string;
  personId: string;
  personName: string;
  chunkType: 'basic' | 'skills' | 'experience' | 'qualifications';
  metadata: {
    department: string;
    skills: string[];
    qualifications: string[];
    yearsOfExperience: number;
  };
}

// 検索結果の型定義
export interface AdvancedSearchResult {
  person: PersonInfo;
  relevance: number;
  matchedChunks: Chunk[];
  explanation: string;
  matchType: 'exact' | 'similar' | 'category' | 'aggregation';
}

// 集計結果の型定義
export interface AggregationResult {
  type: 'count' | 'list' | 'statistics';
  value: number | string[] | object;
  description: string;
  details?: any;
}

/**
 * 高度な検索エンジンクラス
 */
export class AdvancedSearchEngine {
  private chunks: Chunk[] = [];
  private persons: PersonInfo[] = [];
  
  /**
   * 人物情報をチャンク化して保存
   * @param persons 人物情報配列
   */
  public initialize(persons: PersonInfo[]): void {
    console.log('🔧 高度な検索エンジン初期化開始');
    this.persons = persons;
    this.chunks = this.createChunks(persons);
    console.log(`✅ 検索エンジン初期化完了: ${persons.length}人, ${this.chunks.length}チャンク`);
  }
  
  /**
   * 人物情報をチャンク化
   * @param persons 人物情報配列
   * @returns チャンク配列
   */
  private createChunks(persons: PersonInfo[]): Chunk[] {
    const chunks: Chunk[] = [];
    
    persons.forEach((person, personIndex) => {
      const personId = `person_${personIndex}`;
      
      // 基本情報チャンク
      const basicContent = `${person.name}は${person.department}に所属しています。${person.selfPR}`;
      chunks.push({
        id: `${personId}_basic`,
        content: basicContent,
        personId,
        personName: person.name,
        chunkType: 'basic',
        metadata: {
          department: person.department,
          skills: person.skills,
          qualifications: person.qualifications,
          yearsOfExperience: person.yearsOfExperience
        }
      });
      
      // スキルチャンク
      if (person.skills.length > 0) {
        const skillsContent = `${person.name}のスキル: ${person.skills.join(', ')}`;
        chunks.push({
          id: `${personId}_skills`,
          content: skillsContent,
          personId,
          personName: person.name,
          chunkType: 'skills',
          metadata: {
            department: person.department,
            skills: person.skills,
            qualifications: person.qualifications,
            yearsOfExperience: person.yearsOfExperience
          }
        });
      }
      
      // 経験チャンク
      if (person.experience) {
        const experienceContent = `${person.name}の開発経験: ${person.experience}（${person.yearsOfExperience}年）`;
        chunks.push({
          id: `${personId}_experience`,
          content: experienceContent,
          personId,
          personName: person.name,
          chunkType: 'experience',
          metadata: {
            department: person.department,
            skills: person.skills,
            qualifications: person.qualifications,
            yearsOfExperience: person.yearsOfExperience
          }
        });
      }
      
      // 資格チャンク
      if (person.qualifications.length > 0) {
        const qualificationsContent = `${person.name}の資格: ${person.qualifications.join(', ')}`;
        chunks.push({
          id: `${personId}_qualifications`,
          content: qualificationsContent,
          personId,
          personName: person.name,
          chunkType: 'qualifications',
          metadata: {
            department: person.department,
            skills: person.skills,
            qualifications: person.qualifications,
            yearsOfExperience: person.yearsOfExperience
          }
        });
      }
    });
    
    return chunks;
  }
  
  /**
   * 高度な検索を実行
   * @param query 検索クエリ
   * @returns 検索結果
   */
  public async search(query: string): Promise<{
    results: AdvancedSearchResult[];
    aggregation?: AggregationResult;
    queryType: 'exact_search' | 'fuzzy_search' | 'analytical' | 'general_question';
    shouldUseGemini: boolean;
  }> {
    console.log('🔍 高度な検索開始:', query);
    
    // 質問タイプを判定
    const queryType = this.analyzeQueryType(query);
    console.log(`📋 質問タイプ: ${queryType}`);
    
    // 集計クエリの判定
    const aggregationResult = this.detectAggregationQuery(query);
    if (aggregationResult) {
      return {
        results: [],
        aggregation: aggregationResult,
        queryType,
        shouldUseGemini: false
      };
    }
    
    // 質問タイプに応じた検索戦略
    switch (queryType) {
      case 'exact_search':
        return this.handleExactSearch(query);
      case 'fuzzy_search':
        return this.handleFuzzySearch(query);
      case 'analytical':
        return this.handleAnalyticalQuery(query);
      case 'general_question':
        return this.handleGeneralQuestion(query);
      default:
        return this.handleFuzzySearch(query);
    }
  }
  
  /**
   * 質問タイプを分析
   * @param query 検索クエリ
   * @returns 質問タイプ
   */
  private analyzeQueryType(query: string): 'exact_search' | 'fuzzy_search' | 'analytical' | 'general_question' {
    const queryLower = query.toLowerCase();
    
    // より詳細なキーワード分析
    const exactKeywords = [
      'python', 'java', 'javascript', 'react', 'vue', 'angular', 'node', 'aws', 'azure', 'gcp',
      'docker', 'kubernetes', 'sql', 'mongodb', 'redis', 'html', 'css', 'php', 'ruby', 'go',
      '開発部', 'インフラ部', 'デザイン部', '営業部', '企画部', '人事部', '総務部',
      '資格', '経験', '年数', 'スキル', '技術', 'プログラミング', 'コーディング'
    ];
    
    const analyticalKeywords = [
      '何人', '人数', '優秀', '経験', '年数', '多い', '少ない', '平均', '統計', '分析',
      'トップ', 'ベスト', '最優秀', '最高', '最低', '比較', 'ランキング', '順位',
      'どのくらい', 'どれくらい', '何割', '何パーセント', '割合', '比率'
    ];
    
    const generalKeywords = [
      '部署', '何がある', 'どんな', '特徴', '傾向', '比較', 'リスト', '一覧',
      '紹介', '教えて', '説明', '詳細', '概要', 'まとめ', 'サマリー',
      '会社', '組織', 'チーム', 'メンバー', '社員', '従業員'
    ];
    
    const conversationalKeywords = [
      'おすすめ', 'お勧め', '推奨', '適任', '向いている', '得意', '専門',
      '詳しい', '詳しく', '詳しい人', '専門家', 'エキスパート', 'ベテラン',
      '若手', '新人', '中堅', 'シニア', 'リーダー', 'マネージャー',
      'できる', '可能', '対応', '対応可能', '対応している', '担当'
    ];
    
    // 具体的な検索（人物名、部署名、スキル名など）
    if (exactKeywords.some(keyword => queryLower.includes(keyword))) {
      return 'exact_search';
    }
    
    // 会話的な質問（推奨、適任者など）
    if (conversationalKeywords.some(keyword => queryLower.includes(keyword))) {
      return 'general_question';
    }
    
    // 分析的な質問
    if (analyticalKeywords.some(keyword => queryLower.includes(keyword))) {
      return 'analytical';
    }
    
    // 一般的な質問
    if (generalKeywords.some(keyword => queryLower.includes(keyword))) {
      return 'general_question';
    }
    
    // 曖昧な質問や一般的な会話
    return 'fuzzy_search';
  }
  
  /**
   * 具体的な検索を処理
   * @param query 検索クエリ
   * @returns 検索結果
   */
  private handleExactSearch(query: string): {
    results: AdvancedSearchResult[];
    aggregation?: AggregationResult;
    queryType: 'exact_search';
    shouldUseGemini: boolean;
  } {
    const results = this.performSearch(query);
    return {
      results,
      queryType: 'exact_search',
      shouldUseGemini: results.length === 0
    };
  }
  
  /**
   * 曖昧な検索を処理
   * @param query 検索クエリ
   * @returns 検索結果
   */
  private handleFuzzySearch(query: string): {
    results: AdvancedSearchResult[];
    aggregation?: AggregationResult;
    queryType: 'fuzzy_search';
    shouldUseGemini: boolean;
  } {
    const results = this.performSearch(query);
    return {
      results,
      queryType: 'fuzzy_search',
      shouldUseGemini: results.length === 0
    };
  }
  
  /**
   * 分析的な質問を処理
   * @param query 検索クエリ
   * @returns 検索結果
   */
  private handleAnalyticalQuery(query: string): {
    results: AdvancedSearchResult[];
    aggregation?: AggregationResult;
    queryType: 'analytical';
    shouldUseGemini: boolean;
  } {
    const queryLower = query.toLowerCase();
    let aggregation: AggregationResult | undefined;
    
    // 部署別分析
    if (queryLower.includes('部署') && (queryLower.includes('何人') || queryLower.includes('優秀'))) {
      const departmentStats = this.analyzeDepartments();
      aggregation = {
        type: 'statistics',
        value: departmentStats,
        description: this.formatDepartmentAnalysis(departmentStats, queryLower),
        details: departmentStats
      };
    }
    
    // スキル別分析
    else if (queryLower.includes('スキル') || queryLower.includes('技術')) {
      const skillStats = this.analyzeSkills();
      aggregation = {
        type: 'statistics',
        value: skillStats,
        description: this.formatSkillAnalysis(skillStats, queryLower),
        details: skillStats
      };
    }
    
    // 経験年数分析
    else if (queryLower.includes('経験') || queryLower.includes('年数')) {
      const experienceStats = this.analyzeExperience();
      aggregation = {
        type: 'statistics',
        value: experienceStats,
        description: this.formatExperienceAnalysis(experienceStats, queryLower),
        details: experienceStats
      };
    }
    
    // 優秀な人材の分析
    else if (queryLower.includes('優秀')) {
      const topPerformers = this.findTopPerformers();
      return {
        results: topPerformers,
        queryType: 'analytical',
        shouldUseGemini: false
      };
    }
    
    return {
      results: [],
      aggregation,
      queryType: 'analytical',
      shouldUseGemini: !aggregation
    };
  }
  
  /**
   * 一般的な質問を処理
   * @param query 検索クエリ
   * @returns 検索結果
   */
  private handleGeneralQuestion(query: string): {
    results: AdvancedSearchResult[];
    aggregation?: AggregationResult;
    queryType: 'general_question';
    shouldUseGemini: boolean;
  } {
    const queryLower = query.toLowerCase();
    
    // 部署に関する質問
    if (queryLower.includes('部署') && queryLower.includes('何がある')) {
      const departments = this.getUniqueDepartments();
      const aggregation: AggregationResult = {
        type: 'list',
        value: departments,
        description: `当社には以下の部署があります：\n${departments.join('\n')}`,
        details: { departments }
      };
      return {
        results: [],
        aggregation,
        queryType: 'general_question',
        shouldUseGemini: false
      };
    }
    
    // スキルに関する質問
    if (queryLower.includes('スキル') || queryLower.includes('技術')) {
      const skills = this.getUniqueSkills();
      const aggregation: AggregationResult = {
        type: 'list',
        value: skills,
        description: `社員が持っているスキルは以下の通りです：\n${skills.join('\n')}`,
        details: { skills }
      };
      return {
        results: [],
        aggregation,
        queryType: 'general_question',
        shouldUseGemini: false
      };
    }
    
    // 会話的な質問（推奨、適任者など）
    if (queryLower.includes('おすすめ') || queryLower.includes('推奨') || queryLower.includes('適任')) {
      // 推奨者を検索してGeminiに委ねる
      const results = this.performSearch(query);
      return {
        results,
        queryType: 'general_question',
        shouldUseGemini: true
      };
    }
    
    // 専門家やエキスパートの検索
    if (queryLower.includes('専門') || queryLower.includes('エキスパート') || queryLower.includes('詳しい')) {
      const results = this.performSearch(query);
      return {
        results,
        queryType: 'general_question',
        shouldUseGemini: true
      };
    }
    
    // メンターや指導者の検索
    if (queryLower.includes('メンター') || queryLower.includes('指導') || queryLower.includes('新人')) {
      const results = this.performSearch(query);
      return {
        results,
        queryType: 'general_question',
        shouldUseGemini: true
      };
    }
    
    // 若手やベテランの検索
    if (queryLower.includes('若手') || queryLower.includes('ベテラン') || queryLower.includes('シニア')) {
      const results = this.performSearch(query);
      return {
        results,
        queryType: 'general_question',
        shouldUseGemini: true
      };
    }
    
    // その他の一般的な質問はGeminiに委ねる
    return {
      results: [],
      queryType: 'general_question',
      shouldUseGemini: true
    };
  }
  
  /**
   * 部署の分析
   * @returns 部署統計
   */
  private analyzeDepartments(): any {
    const departmentCounts: { [key: string]: number } = {};
    const departmentSkills: { [key: string]: string[] } = {};
    
    this.persons.forEach(person => {
      if (!departmentCounts[person.department]) {
        departmentCounts[person.department] = 0;
        departmentSkills[person.department] = [];
      }
      departmentCounts[person.department]++;
      departmentSkills[person.department].push(...person.skills);
    });
    
    return {
      counts: departmentCounts,
      skills: departmentSkills,
      total: this.persons.length
    };
  }
  
  /**
   * スキルの分析
   * @returns スキル統計
   */
  private analyzeSkills(): any {
    const skillCounts: { [key: string]: number } = {};
    const skillDepartments: { [key: string]: string[] } = {};
    
    this.persons.forEach(person => {
      person.skills.forEach((skill: string) => {
        if (!skillCounts[skill]) {
          skillCounts[skill] = 0;
          skillDepartments[skill] = [];
        }
        skillCounts[skill]++;
        if (!skillDepartments[skill].includes(person.department)) {
          skillDepartments[skill].push(person.department);
        }
      });
    });
    
    return {
      counts: skillCounts,
      departments: skillDepartments,
      total: this.persons.length
    };
  }
  
  /**
   * 経験年数の分析
   * @returns 経験統計
   */
  private analyzeExperience(): any {
    const experienceYears = this.persons.map(p => p.yearsOfExperience);
    const average = experienceYears.reduce((sum, year) => sum + year, 0) / experienceYears.length;
    const max = Math.max(...experienceYears);
    const min = Math.min(...experienceYears);
    
    return {
      average: Math.round(average * 10) / 10,
      max,
      min,
      total: this.persons.length
    };
  }
  
  /**
   * 優秀な人材を特定
   * @returns 優秀な人材リスト
   */
  private findTopPerformers(): AdvancedSearchResult[] {
    // 経験年数、スキル数、資格数を総合的に評価
    const scoredPersons = this.persons.map(person => {
      const skillScore = person.skills.length * 0.3;
      const qualificationScore = person.qualifications.length * 0.2;
      const experienceScore = person.yearsOfExperience * 0.1;
      const totalScore = skillScore + qualificationScore + experienceScore;
      
      return {
        person,
        relevance: totalScore,
        matchedChunks: [],
        explanation: `スキル: ${person.skills.length}個, 資格: ${person.qualifications.length}個, 経験: ${person.yearsOfExperience}年`,
        matchType: 'similar' as const
      };
    });
    
    return scoredPersons
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 3); // 上位3名
  }
  
  /**
   * 部署リストを取得
   * @returns 部署リスト
   */
  private getUniqueDepartments(): string[] {
    return [...new Set(this.persons.map(p => p.department))];
  }
  
  /**
   * スキルリストを取得
   * @returns スキルリスト
   */
  private getUniqueSkills(): string[] {
    const allSkills = this.persons.flatMap(p => p.skills);
    return [...new Set(allSkills)];
  }
  
  /**
   * 部署分析結果をフォーマット
   * @param stats 統計データ
   * @param query クエリ
   * @returns フォーマットされた説明
   */
  private formatDepartmentAnalysis(stats: any, query: string): string {
    const { counts, skills, total } = stats;
    let description = `部署別の分析結果：\n\n`;
    
    Object.entries(counts).forEach(([dept, count]) => {
      const deptSkills = skills[dept] || [];
      const uniqueSkills = [...new Set(deptSkills)];
      description += `${dept}: ${count}人\n`;
      description += `  主なスキル: ${uniqueSkills.slice(0, 3).join(', ')}\n\n`;
    });
    
    if (query.includes('優秀')) {
      const topDept = Object.entries(counts).sort((a, b) => (b[1] as number) - (a[1] as number))[0];
      description += `最も人数が多い部署は${topDept[0]}（${topDept[1]}人）です。`;
    }
    
    return description;
  }
  
  /**
   * スキル分析結果をフォーマット
   * @param stats 統計データ
   * @param query クエリ
   * @returns フォーマットされた説明
   */
  private formatSkillAnalysis(stats: any, query: string): string {
    const { counts, departments, total } = stats;
    let description = `スキル別の分析結果：\n\n`;
    
    const sortedSkills = Object.entries(counts).sort((a, b) => (b[1] as number) - (a[1] as number));
    
    sortedSkills.slice(0, 5).forEach(([skill, count]) => {
      const depts = departments[skill] || [];
      description += `${skill}: ${count}人が保有\n`;
      description += `  部署: ${depts.join(', ')}\n\n`;
    });
    
    if (query.includes('優秀')) {
      const topSkill = sortedSkills[0];
      description += `最も多くの人が保有しているスキルは${topSkill[0]}（${topSkill[1]}人）です。`;
    }
    
    return description;
  }
  
  /**
   * 経験分析結果をフォーマット
   * @param stats 統計データ
   * @param query クエリ
   * @returns フォーマットされた説明
   */
  private formatExperienceAnalysis(stats: any, query: string): string {
    const { average, max, min, total } = stats;
    let description = `経験年数の分析結果：\n\n`;
    
    description += `平均経験年数: ${average}年\n`;
    description += `最高経験年数: ${max}年\n`;
    description += `最低経験年数: ${min}年\n`;
    description += `総人数: ${total}人\n\n`;
    
    if (query.includes('優秀')) {
      const experiencedPersons = this.persons.filter(p => p.yearsOfExperience >= average);
      description += `平均以上の経験を持つ人は${experiencedPersons.length}人です。`;
    }
    
    return description;
  }
  
  /**
   * 集計クエリを判定
   * @param query 検索クエリ
   * @returns 集計結果
   */
  private detectAggregationQuery(query: string): AggregationResult | null {
    const queryLower = query.toLowerCase();
    
    // 人数集計
    if (queryLower.includes('何人') || queryLower.includes('人数')) {
      if (queryLower.includes('開発部')) {
        const count = this.persons.filter(p => p.department.includes('開発')).length;
        return {
          type: 'count',
          value: count,
          description: `開発部に所属している人は${count}人です。`,
          details: {
            department: '開発部',
            count: count,
            total: this.persons.length
          }
        };
      }
      
      if (queryLower.includes('インフラ')) {
        const count = this.persons.filter(p => p.department.includes('インフラ')).length;
        return {
          type: 'count',
          value: count,
          description: `インフラ部に所属している人は${count}人です。`,
          details: {
            department: 'インフラ部',
            count: count,
            total: this.persons.length
          }
        };
      }
      
      if (queryLower.includes('デザイン')) {
        const count = this.persons.filter(p => p.department.includes('デザイン')).length;
        return {
          type: 'count',
          value: count,
          description: `デザイン部に所属している人は${count}人です。`,
          details: {
            department: 'デザイン部',
            count: count,
            total: this.persons.length
          }
        };
      }
    }
    
    // スキル別集計
    if (queryLower.includes('スキル') && queryLower.includes('何人')) {
      const skillKeywords = ['python', 'javascript', 'java', 'react', 'aws', 'docker'];
      for (const skill of skillKeywords) {
        if (queryLower.includes(skill)) {
          const count = this.persons.filter(p => 
            p.skills.some((s: string) => s.toLowerCase().includes(skill))
          ).length;
          return {
            type: 'count',
            value: count,
            description: `${skill}スキルを持つ人は${count}人です。`,
            details: {
              skill: skill,
              count: count,
              total: this.persons.length
            }
          };
        }
      }
    }
    
    return null;
  }
  
  /**
   * 通常の検索を実行
   * @param query 検索クエリ
   * @returns 検索結果
   */
  private performSearch(query: string): AdvancedSearchResult[] {
    const queryLower = query.toLowerCase();
    const results: AdvancedSearchResult[] = [];
    
    console.log('🔍 検索クエリ:', queryLower);
    
    // 人物ごとに検索
    this.persons.forEach((person, personIndex) => {
      let maxRelevance = 0;
      const matchedChunks: Chunk[] = [];
      
      // 完全一致チェック（優先度最高）
      const exactMatch = this.checkExactMatch(queryLower, person);
      if (exactMatch > 0) {
        maxRelevance = exactMatch;
        // 該当するチャンクを追加
        this.chunks
          .filter(chunk => chunk.personId === `person_${personIndex}`)
          .forEach(chunk => matchedChunks.push(chunk));
      } else {
        // 各チャンクで類似度計算
        this.chunks
          .filter(chunk => chunk.personId === `person_${personIndex}`)
          .forEach(chunk => {
            const relevance = this.calculateCosineSimilarity(queryLower, chunk.content.toLowerCase());
            
            if (relevance > 0.05) { // 閾値を下げる
              matchedChunks.push(chunk);
              maxRelevance = Math.max(maxRelevance, relevance);
            }
          });
      }
      
      // 会話的な質問の場合は追加のスコアリング
      if (this.isConversationalQuery(queryLower)) {
        const conversationalScore = this.calculateConversationalScore(queryLower, person);
        maxRelevance = Math.max(maxRelevance, conversationalScore);
      }
      
      if (maxRelevance > 0) {
        const matchType = this.determineMatchType(queryLower, person, maxRelevance);
        const explanation = this.generateExplanation(queryLower, person, matchedChunks, maxRelevance);
        
        results.push({
          person,
          relevance: maxRelevance,
          matchedChunks,
          explanation,
          matchType
        });
        
        console.log(`✅ マッチ: ${person.name} (関連性: ${maxRelevance.toFixed(3)})`);
      }
    });
    
    // 関連性で降順ソート
    results.sort((a, b) => b.relevance - a.relevance);
    
    console.log(`✅ 検索完了: ${results.length}件の結果`);
    return results.slice(0, 5); // 上位5件を返す
  }
  
  /**
   * 完全一致チェック
   * @param query クエリ
   * @param person 人物情報
   * @returns 関連性スコア
   */
  private checkExactMatch(query: string, person: PersonInfo): number {
    // 部署名の完全一致
    if (query.includes(person.department.toLowerCase())) {
      console.log(`🎯 部署完全一致: ${person.name} - ${person.department}`);
      return 1.0;
    }
    
    // スキルの完全一致
    for (const skill of person.skills) {
      if (query.includes(skill.toLowerCase())) {
        console.log(`🎯 スキル完全一致: ${person.name} - ${skill}`);
        return 1.0;
      }
    }
    
    // 資格の完全一致
    for (const qualification of person.qualifications) {
      if (query.includes(qualification.toLowerCase())) {
        console.log(`🎯 資格完全一致: ${person.name} - ${qualification}`);
        return 1.0;
    }
    }
    
    // 名前の完全一致
    if (query.includes(person.name.toLowerCase())) {
      console.log(`🎯 名前完全一致: ${person.name}`);
      return 1.0;
    }
    
    // 部分一致チェック
    const partialMatch = this.checkPartialMatch(query, person);
    if (partialMatch > 0.7) {
      return partialMatch;
    }
    
    return 0;
  }
  
  /**
   * 部分一致チェック
   * @param query クエリ
   * @param person 人物情報
   * @returns 関連性スコア
   */
  private checkPartialMatch(query: string, person: PersonInfo): number {
    let maxScore = 0;
    
    // 部署名の部分一致
    if (person.department.toLowerCase().includes(query) || query.includes(person.department.toLowerCase())) {
      maxScore = Math.max(maxScore, 0.8);
    }
    
    // スキルの部分一致
    for (const skill of person.skills) {
      if (skill.toLowerCase().includes(query) || query.includes(skill.toLowerCase())) {
        maxScore = Math.max(maxScore, 0.8);
      }
    }
    
    // 資格の部分一致
    for (const qualification of person.qualifications) {
      if (qualification.toLowerCase().includes(query) || query.includes(qualification.toLowerCase())) {
        maxScore = Math.max(maxScore, 0.8);
      }
    }
    
    return maxScore;
  }
  
  /**
   * コサイン類似度を計算
   * @param query クエリ
   * @param text テキスト
   * @returns 類似度（0-1）
   */
  private calculateCosineSimilarity(query: string, text: string): number {
    // 単語に分割（日本語対応）
    const queryWords = query.split(/[\s,、。]+/).filter(word => word.length > 0);
    const textWords = text.split(/[\s,、。]+/).filter(word => word.length > 0);
    
    if (queryWords.length === 0 || textWords.length === 0) {
      return 0;
    }
    
    // 単語頻度を計算
    const queryFreq: { [key: string]: number } = {};
    const textFreq: { [key: string]: number } = {};
    
    queryWords.forEach(word => {
      const normalizedWord = word.toLowerCase().trim();
      if (normalizedWord.length > 0) {
        queryFreq[normalizedWord] = (queryFreq[normalizedWord] || 0) + 1;
      }
    });
    
    textWords.forEach(word => {
      const normalizedWord = word.toLowerCase().trim();
      if (normalizedWord.length > 0) {
        textFreq[normalizedWord] = (textFreq[normalizedWord] || 0) + 1;
      }
    });
    
    // 内積を計算
    let dotProduct = 0;
    let queryMagnitude = 0;
    let textMagnitude = 0;
    
    // 全単語の集合
    const allWords = new Set([...Object.keys(queryFreq), ...Object.keys(textFreq)]);
    
    allWords.forEach(word => {
      const queryCount = queryFreq[word] || 0;
      const textCount = textFreq[word] || 0;
      
      dotProduct += queryCount * textCount;
      queryMagnitude += queryCount * queryCount;
      textMagnitude += textCount * textCount;
    });
    
    // コサイン類似度を計算
    if (queryMagnitude === 0 || textMagnitude === 0) {
      return 0;
    }
    
    const similarity = dotProduct / (Math.sqrt(queryMagnitude) * Math.sqrt(textMagnitude));
    
    // デバッグ用ログ
    if (similarity > 0.1) {
      console.log(`📊 類似度計算: ${similarity.toFixed(3)}`);
      console.log(`  クエリ: ${query}`);
      console.log(`  テキスト: ${text.substring(0, 50)}...`);
    }
    
    return similarity;
  }
  
  /**
   * マッチタイプを判定
   * @param query クエリ
   * @param person 人物情報
   * @param relevance 関連性
   * @returns マッチタイプ
   */
  private determineMatchType(query: string, person: PersonInfo, relevance: number): 'exact' | 'similar' | 'category' {
    // 完全一致（関連性1.0）
    if (relevance >= 1.0) {
      return 'exact';
    }
    
    // 名前の完全一致
    if (query.includes(person.name.toLowerCase())) {
      return 'exact';
    }
    
    // 部署名の完全一致
    if (query.includes(person.department.toLowerCase())) {
      return 'exact';
    }
    
    // スキルの完全一致
    if (person.skills.some((skill: string) => query.includes(skill.toLowerCase()))) {
      return 'exact';
    }
    
    // 資格の完全一致
    if (person.qualifications.some((qual: string) => query.includes(qual.toLowerCase()))) {
      return 'exact';
    }
    
    // 高関連性
    if (relevance > 0.6) {
      return 'similar';
    }
    
    return 'category';
  }
  
  /**
   * 説明を生成
   * @param query クエリ
   * @param person 人物情報
   * @param matchedChunks マッチしたチャンク
   * @param relevance 関連性
   * @returns 説明
   */
  private generateExplanation(
    query: string, 
    person: PersonInfo, 
    matchedChunks: Chunk[], 
    relevance: number
  ): string {
    if (relevance > 0.8) {
      return '非常に高い関連性';
    } else if (relevance > 0.6) {
      return '高い関連性';
    } else if (relevance > 0.4) {
      return '中程度の関連性';
    } else {
      return '低い関連性';
    }
  }
  
  /**
   * 会話的な質問かどうかを判定
   * @param query クエリ
   * @returns 会話的な質問の場合はtrue
   */
  private isConversationalQuery(query: string): boolean {
    const conversationalKeywords = [
      'おすすめ', '推奨', '適任', '向いている', '得意', '専門',
      '詳しい', '詳しく', '専門家', 'エキスパート', 'ベテラン',
      '若手', '新人', '中堅', 'シニア', 'リーダー', 'マネージャー',
      'できる', '可能', '対応', '対応可能', '対応している', '担当',
      'メンター', '指導', '成長', '優秀', '経験豊富'
    ];
    
    return conversationalKeywords.some(keyword => query.includes(keyword));
  }
  
  /**
   * 会話的な質問に対するスコアを計算
   * @param query クエリ
   * @param person 人物情報
   * @returns スコア
   */
  private calculateConversationalScore(query: string, person: PersonInfo): number {
    let score = 0;
    
    // 経験年数によるスコアリング
    if (query.includes('ベテラン') || query.includes('シニア') || query.includes('経験豊富')) {
      if (person.yearsOfExperience >= 5) {
        score += 0.3;
      } else if (person.yearsOfExperience >= 3) {
        score += 0.2;
      }
    }
    
    // 若手向け
    if (query.includes('若手') || query.includes('新人')) {
      if (person.yearsOfExperience <= 2) {
        score += 0.3;
      } else if (person.yearsOfExperience <= 3) {
        score += 0.2;
      }
    }
    
    // スキル数によるスコアリング
    if (query.includes('複数') || query.includes('多様')) {
      if (person.skills.length >= 3) {
        score += 0.2;
      }
    }
    
    // 資格によるスコアリング
    if (query.includes('資格') || query.includes('認定')) {
      if (person.qualifications.length > 0) {
        score += 0.2;
      }
    }
    
    // 部署によるスコアリング
    if (query.includes('開発') && person.department.includes('開発')) {
      score += 0.3;
    }
    if (query.includes('インフラ') && person.department.includes('インフラ')) {
      score += 0.3;
    }
    if (query.includes('デザイン') && person.department.includes('デザイン')) {
      score += 0.3;
    }
    
    return score;
  }
  
  /**
   * 検索結果をフォーマット
   * @param results 検索結果
   * @param aggregation 集計結果
   * @returns フォーマットされた文字列
   */
  public formatResults(
    results: AdvancedSearchResult[], 
    aggregation?: AggregationResult
  ): string {
    if (aggregation) {
      return aggregation.description;
    }
    
    if (results.length === 0) {
      return '検索条件に一致する結果が見つかりませんでした。';
    }
    
    const formattedResults = results.map((result, index) => {
      const person = result.person;
      
      return `${index + 1}. ${person.name}
   部署: ${person.department}
   スキル: ${person.skills.join(', ')}
   資格: ${person.qualifications.join(', ')}
   経験: ${person.experience}
   関連性: ${result.explanation}`;
    });
    
    return formattedResults.join('\n\n');
  }
} 