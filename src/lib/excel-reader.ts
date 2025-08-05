/**
 * Excel読み込み・解析機能
 * テスト用のシンプルな実装
 */

import * as XLSX from 'xlsx';
import { PersonInfo } from '../types';

export interface ExcelReadResult {
  success: boolean;
  data?: PersonInfo[];
  error?: string;
  fileName: string;
}

/**
 * Excelファイルを読み込んで人物情報に変換
 * @param file アップロードされたファイル
 * @returns 読み込み結果
 */
export async function readExcelFile(file: File): Promise<ExcelReadResult> {
  try {
    console.log('=== Excel読み込み・解析開始 ===');
    console.log('ファイル名:', file.name);
    console.log('ファイルサイズ:', file.size, 'bytes');
    
    // 基本的なチェック
    if (file.size === 0) {
      throw new Error('ファイルが空です');
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB制限
      throw new Error('ファイルサイズが大きすぎます（5MB以下にしてください）');
    }
    
    // ファイル形式チェック
    const fileExtension = file.name.toLowerCase().split('.').pop();
    if (!['xlsx', 'xls'].includes(fileExtension || '')) {
      throw new Error('Excelファイル（.xlsx, .xls）のみ対応しています');
    }
    
    console.log('ファイル読み込み中...');
    const arrayBuffer = await file.arrayBuffer();
    console.log('ファイル読み込み完了:', arrayBuffer.byteLength, 'bytes');
    
    console.log('XLSX解析開始...');
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    console.log('ワークブック読み込み完了');
    console.log('シート名:', workbook.SheetNames);
    
    // 最初のシートを取得
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new Error('シートが見つかりません');
    }
    
    const worksheet = workbook.Sheets[sheetName];
    console.log('シート取得完了:', sheetName);
    
    // JSONに変換
    console.log('JSON変換開始...');
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    console.log('JSON変換完了');
    console.log('データ行数:', jsonData.length);
    
    // ヘッダー行を取得
    const headers = jsonData[0] as string[];
    console.log('ヘッダー:', headers);
    
    // データ行を取得（ヘッダーを除く）
    const dataRows = jsonData.slice(1) as any[][];
    console.log('データ行数（ヘッダー除く）:', dataRows.length);
    
    // 全行を人物情報に変換
    console.log('人物情報変換開始...');
    const persons: PersonInfo[] = [];
    
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      
      // 空行をスキップ
      if (!row || row.every(cell => !cell || cell.toString().trim() === '')) {
        console.log(`行${i + 1}: 空行のためスキップ`);
        continue;
      }
      
      try {
        // ヘッダーとデータを組み合わせてオブジェクトを作成
        const rowObject: any = {};
        headers.forEach((header, index) => {
          rowObject[header] = row[index] || '';
        });
        
        console.log(`行${i + 1}のデータ:`, rowObject);
        
        // PersonInfo形式に変換
        const person: PersonInfo = {
          name: String(rowObject['氏名'] || '').trim() || `未設定${i + 1}`,
          department: String(rowObject['部署'] || '').trim() || '未設定',
          skills: parseSkills(rowObject['スキル']),
          qualifications: parseQualifications(rowObject['資格']),
          selfPR: String(rowObject['自己PR'] || '').trim() || '未設定',
          experience: String(rowObject['開発経験'] || '').trim() || '未設定',
          yearsOfExperience: parseYears(rowObject['経験年数'])
        };
        
        persons.push(person);
        console.log(`人物${i + 1}変換完了:`, person.name);
        
      } catch (error) {
        console.error(`行${i + 1}の変換でエラー:`, error);
      }
    }
    
    console.log('変換された人物情報数:', persons.length);
    
    if (persons.length === 0) {
      throw new Error('有効な人物情報が見つかりませんでした');
    }
    
    console.log('=== Excel読み込み・解析完了 ===');
    
    return {
      success: true,
      data: persons,
      fileName: file.name
    };
    
  } catch (error) {
    console.error('Excel読み込み・解析エラー:', error);
    return {
      success: false,
      error: `Excelファイルの読み込み・解析に失敗しました: ${error}`,
      fileName: file.name
    };
  }
}

/**
 * スキル文字列を配列に変換
 * @param skillsText スキル文字列
 * @returns スキル配列
 */
function parseSkills(skillsText: any): string[] {
  if (!skillsText) return [];
  
  try {
    const skillsString = String(skillsText).trim();
    if (skillsString === '') return [];
    
    const skills = skillsString
      .split(/[,、]+/)
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0 && skill !== 'なし' && skill !== '無し');
    
    console.log('スキル解析結果:', skills);
    return skills;
  } catch (error) {
    console.error('スキル解析エラー:', error);
    return [];
  }
}

/**
 * 資格文字列を配列に変換
 * @param qualificationsText 資格文字列
 * @returns 資格配列
 */
function parseQualifications(qualificationsText: any): string[] {
  if (!qualificationsText) return [];
  
  try {
    const qualificationsString = String(qualificationsText).trim();
    if (qualificationsString === '') return [];
    
    const qualifications = qualificationsString
      .split(/[,、]+/)
      .map(qual => qual.trim())
      .filter(qual => qual.length > 0 && qual !== 'なし' && qual !== '無し');
    
    console.log('資格解析結果:', qualifications);
    return qualifications;
  } catch (error) {
    console.error('資格解析エラー:', error);
    return [];
  }
}

/**
 * 経験年数を数値に変換
 * @param yearsText 経験年数文字列
 * @returns 経験年数（数値）
 */
function parseYears(yearsText: any): number {
  if (!yearsText) return 0;
  
  try {
    const yearsString = String(yearsText).trim();
    if (yearsString === '') return 0;
    
    const yearsMatch = yearsString.match(/\d+/);
    if (yearsMatch) {
      const years = parseInt(yearsMatch[0]);
      console.log('経験年数解析結果:', years);
      return years;
    }
    
    return 0;
  } catch (error) {
    console.error('経験年数解析エラー:', error);
    return 0;
  }
}