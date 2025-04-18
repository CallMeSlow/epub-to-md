'use client';

import { useState } from 'react';
import styles from './styles.module.css';

interface FilePreviewProps {
  files: File[];
  onRemoveFile: (index: number) => void;
  conversionProgress?: number;
}

export const FilePreview = ({ files, onRemoveFile, conversionProgress }: FilePreviewProps) => {
  const [expandedFile, setExpandedFile] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedFile(expandedFile === index ? null : index);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (files.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.fileList}>
        {files.map((file, index) => (
          <div
            key={`${file.name}-${index}`}
            className={`${styles.fileItem} ${expandedFile === index ? styles.expanded : ''}`}
          >
            <div className={styles.fileHeader} onClick={() => toggleExpand(index)}>
              <div className={styles.fileIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20ZM16 11H8V13H16V11ZM16 15H8V17H16V15Z" fill="currentColor"/>
                </svg>
              </div>
              <div className={styles.fileInfo}>
                <div className={styles.fileName}>{file.name}</div>
                <div className={styles.fileSize}>{formatFileSize(file.size)}</div>
              </div>
              <button
                className={styles.removeButton}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFile(index);
                }}
                title="删除文件"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
                </svg>
              </button>
            </div>
            {conversionProgress !== undefined && (
              <div className={styles.progressContainer}>
                <div
                  className={styles.progressBar}
                  style={{ width: `${conversionProgress}%` }}
                ></div>
                <span className={styles.progressText}>{conversionProgress}%</span>
              </div>
            )}
          </div>
        ))}
        <div className={styles.fileItem}>
          <div className={styles.addMoreButton}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};