'use client';

import styles from './styles.module.css';

interface ConversionActionsProps {
  hasFiles: boolean;
  isConverting: boolean;
  onConvert: () => void;
  onCancel: () => void;
  onClear: () => void;
}

export const ConversionActions = ({
  hasFiles,
  isConverting,
  onConvert,
  onCancel,
  onClear
}: ConversionActionsProps) => {
  return (
    <div className={styles.container}>
      <button
        className={`${styles.button} ${styles.primaryButton}`}
        onClick={isConverting ? onCancel : onConvert}
        disabled={!hasFiles}
      >
        {isConverting ? (
          <>
            <svg className={styles.icon} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            取消转换
          </>
        ) : (
          <>
            <svg className={styles.icon} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            开始转换
          </>
        )}
      </button>
      
      <button
        className={`${styles.button} ${styles.secondaryButton}`}
        onClick={onClear}
        disabled={!hasFiles || isConverting}
      >
        <svg className={styles.icon} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        清空文件
      </button>
    </div>
  );
};
