'use client';

import { useEffect, useState } from 'react';
import styles from './styles.module.css';

interface ConversionAnimationProps {
  isConverting: boolean;
  progress: number;
}

export const ConversionAnimation = ({ isConverting, progress }: ConversionAnimationProps) => {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (isConverting) {
      setShowAnimation(true);
    } else {
      // 当转换完成后，延迟一段时间再隐藏动画，以便用户看到完成状态
      const timer = setTimeout(() => {
        setShowAnimation(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isConverting]);

  if (!showAnimation) return null;

  return (
    <div className={styles.animationContainer}>
      <div className={styles.animationContent}>
        <div className={styles.title}>
          EPUB 转 Markdown
        </div>

        <div className={styles.iconContainer}>
          <div className={styles.fileIcon}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z" fill="#4dabf7"/>
            </svg>
          </div>

          <div className={styles.arrowContainer}>
            <svg className={styles.arrow} width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="#4dabf7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <div className={styles.markdownIcon}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.56 18H3.44C2.65 18 2 17.37 2 16.59V7.41C2 6.63 2.65 6 3.44 6H20.56C21.35 6 22 6.63 22 7.41V16.59C22 17.37 21.35 18 20.56 18ZM6.81 15.19V11.53L8.73 13.88L10.65 11.53V15.19H12.58V8.81H10.65L8.73 11.16L6.81 8.81H4.89V15.19H6.81ZM18.69 10.73H16.19V8.81H14.27V10.73H11.77V12.66H14.27V14.58H16.19V12.66H18.69V10.73Z" fill="#4dabf7"/>
            </svg>
          </div>
        </div>

        <div className={styles.codeLines}>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className={styles.codeLine} style={{ width: `${Math.random() * 50 + 50}%`, animationDelay: `${index * 0.2}s` }}></div>
          ))}
        </div>

        <div className={styles.progressContainer}>
          <div
            className={styles.progressBar}
            style={{ width: `${progress}%` }}
          ></div>
          <span className={styles.progressText}>{progress}%</span>
        </div>

        <div className={styles.statusText}>
          {progress < 100 ? '正在转换...' : '转换完成！'}
        </div>
      </div>
    </div>
  );
};
