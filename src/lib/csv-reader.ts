/**
 * CSVファイル読み込み機能
 * papaparseライブラリを使用してCSVファイルを解析
 */

import Papa from 'papaparse';
import { PersonInfo } from '../types';

/**
 * CSVファイル読み込み結果の型定義
 */
export interface CSVReadResult {
  success: boolean;
  data?: PersonInfo[];
  error?: string;
  rowCount?: number;
}

/**
 * CSVファイルを読み込んで人物情報を解析
 * @param file CSVファイル
 * @returns 解析結果
 */
export async function readCSVFile(file: File): Promise<CSVReadResult> {
  try {
    console.log('📄 CSVファイル読み込み開始:', file.name);
    
    return new Promise((resolve) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          console.log('📊 CSV解析完了:', results);
          
          if (results.errors.length > 0) {
            console.error('❌ CSV解析エラー:', results.errors);
            resolve({
              success: false,
              error: `CSV解析エラー: ${results.errors[0].message}`
            });
            return;
          }
          
          if (!results.data || results.data.length === 0) {
            resolve({
              success: false,
              error: 'CSVファイルにデータがありません'
            });
            return;
          }
          
          try {
            const persons = parsePersonData(results.data);
            console.log('✅ 人物情報解析完了:', persons.length, '件');
            
            resolve({
              success: true,
              data: persons,
              rowCount: persons.length
            });
          } catch (error) {
            console.error('❌ 人物情報解析エラー:', error);
            resolve({
              success: false,
              error: `人物情報解析エラー: ${error}`
            });
          }
        },
        error: (error) => {
          console.error('❌ CSV読み込みエラー:', error);
          resolve({
            success: false,
            error: `CSV読み込みエラー: ${error.message}`
          });
        }
      });
    });
  } catch (error) {
    console.error('❌ CSVファイル処理エラー:', error);
    return {
      success: false,
      error: `CSVファイル処理エラー: ${error}`
    };
  }
}

/**
 * CSVデータを人物情報に変換
 * @param csvData CSVデータ配列
 * @returns 人物情報配列
 */
function parsePersonData(csvData: any[]): PersonInfo[] {
  const persons: PersonInfo[] = [];
  
  csvData.forEach((row, index) => {
    try {
      // 必須フィールドのチェック
      if (!row['氏名'] || !row['部署']) {
        console.warn(`⚠️ 行${index + 1}: 必須フィールドが不足しています`);
        return;
      }
      
      // スキルの解析（カンマ区切り）
      const skills = parseSkills(row['スキル'] || '');
      
      // 資格の解析（カンマ区切り）
      const qualifications = parseQualifications(row['資格'] || '');
      
      // 経験年数の解析
      const yearsOfExperience = parseYearsOfExperience(row['経験年数'] || '0');
      
      const person: PersonInfo = {
        name: row['氏名'].trim(),
        department: row['部署'].trim(),
        skills: skills,
        qualifications: qualifications,
        selfPR: row['自己PR'] || '',
        experience: row['開発経験'] || '',
        yearsOfExperience: yearsOfExperience
      };
      
      persons.push(person);
      console.log(`👤 人物${index + 1}解析完了:`, person.name, person.department);
      
    } catch (error) {
      console.error(`❌ 行${index + 1}の解析エラー:`, error);
    }
  });
  
  return persons;
}

/**
 * スキル文字列を配列に変換
 * @param skillsString スキル文字列
 * @returns スキル配列
 */
function parseSkills(skillsString: string): string[] {
  if (!skillsString || skillsString.trim() === '') {
    return [];
  }
  
  return skillsString
    .split(',')
    .map(skill => skill.trim())
    .filter(skill => skill.length > 0);
}

/**
 * 資格文字列を配列に変換
 * @param qualificationsString 資格文字列
 * @returns 資格配列
 */
function parseQualifications(qualificationsString: string): string[] {
  if (!qualificationsString || qualificationsString.trim() === '') {
    return [];
  }
  
  return qualificationsString
    .split(',')
    .map(qual => qual.trim())
    .filter(qual => qual.length > 0);
}

/**
 * 経験年数を数値に変換
 * @param yearsString 経験年数字符列
 * @returns 経験年数
 */
function parseYearsOfExperience(yearsString: string): number {
  if (!yearsString || yearsString.trim() === '') {
    return 0;
  }
  
  // 数字のみを抽出
  const match = yearsString.match(/\d+/);
  if (match) {
    return parseInt(match[0], 10);
  }
  
  return 0;
} 