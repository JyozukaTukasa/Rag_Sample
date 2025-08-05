/**
 * 統合ファイル読み込み機能
 * Excel・PDF・CSVファイルを統一的に読み込む
 */

import { readExcelFile } from './excel-reader';
import { readCSVFile } from './csv-reader';
import { PersonInfo } from '../types';

// ファイル読み込み結果の型定義
export interface FileReadResult {
  success: boolean;
  data?: PersonInfo[];
  error?: string;
  fileType: 'excel' | 'csv';
  rowCount?: number;
}

/**
 * ファイルを読み込んで人物情報を解析
 * @param file ファイル
 * @returns 解析結果
 */
export async function readFile(file: File): Promise<FileReadResult> {
  try {
    console.log('📁 ファイル読み込み開始:', file.name);
    
    // ファイル形式を判定
    const fileExtension = file.name.toLowerCase().split('.').pop();
    
    switch (fileExtension) {
      case 'xlsx':
      case 'xls':
        console.log('📊 Excelファイルとして読み込み');
        const excelResult = await readExcelFile(file);
        return {
          ...excelResult,
          fileType: 'excel'
        };
        
      case 'csv':
        console.log('📄 CSVファイルとして読み込み');
        const csvResult = await readCSVFile(file);
        return {
          ...csvResult,
          fileType: 'csv'
        };
        

        
      default:
        return {
          success: false,
          error: '対応していないファイル形式です',
          fileType: 'excel'
        };
    }
  } catch (error) {
    console.error('❌ ファイル読み込みエラー:', error);
    return {
      success: false,
      error: `ファイル読み込みエラー: ${error}`,
      fileType: 'excel'
    };
  }
}

/**
 * ファイル形式の説明を取得
 * @param fileType ファイル形式
 * @returns 説明文字列
 */
export function getFileTypeDescription(fileType: 'excel' | 'csv'): string {
  switch (fileType) {
    case 'excel':
      return 'Excel';
    case 'csv':
      return 'CSV';
    default:
      return '不明';
  }
} 