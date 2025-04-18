'use client';

import { useState, useCallback } from 'react';
import { EpubParser, EpubContent } from '../utils/epub-parser';
import { MarkdownConverter, MarkdownOutput, MarkdownConverterOptions } from '../utils/md-converter';
import { DownloadManager, DownloadOptions } from '../utils/download';

export interface ConversionProgress {
  file: File;
  progress: number;
  status: 'pending' | 'parsing' | 'converting' | 'downloading' | 'completed' | 'error';
  error?: string;
}

export interface EpubConverterState {
  files: File[];
  progress: ConversionProgress[];
  options: {
    markdown: MarkdownConverterOptions;
    download: DownloadOptions;
  };
}

export interface EpubConverterActions {
  addFiles: (files: File[]) => void;
  removeFile: (index: number) => void;
  clearFiles: () => void;
  convertFiles: () => Promise<void>;
  cancelConversion: () => void;
  updateMarkdownOptions: (options: Partial<MarkdownConverterOptions>) => void;
  updateDownloadOptions: (options: Partial<DownloadOptions>) => void;
}

export function useEpubConverter(): [EpubConverterState, EpubConverterActions] {
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<ConversionProgress[]>([]);
  const [options, setOptions] = useState<EpubConverterState['options']>({
    markdown: {
      format: 'standard',
      imageHandling: 'separate',
      outputStructure: 'chapter'
    },
    download: {
      filename: 'converted-epub',
      format: 'zip'
    }
  });
  const [isCancelled, setIsCancelled] = useState<boolean>(false);

  // Add files to the state
  const addFiles = useCallback((newFiles: File[]) => {
    setFiles(prevFiles => {
      // Filter out duplicates
      const existingFilenames = new Set(prevFiles.map(file => file.name));
      const filteredNewFiles = newFiles.filter(file => !existingFilenames.has(file.name));
      return [...prevFiles, ...filteredNewFiles];
    });

    // Initialize progress for new files
    setProgress(prevProgress => {
      const existingFilenames = new Set(prevProgress.map(p => p.file.name));
      const newProgress = newFiles
        .filter(file => !existingFilenames.has(file.name))
        .map(file => ({
          file,
          progress: 0,
          status: 'pending' as const
        }));
      return [...prevProgress, ...newProgress];
    });
  }, []);

  // Remove a file from the state
  const removeFile = useCallback((index: number) => {
    setFiles(prevFiles => {
      const newFiles = [...prevFiles];
      newFiles.splice(index, 1);
      return newFiles;
    });

    setProgress(prevProgress => {
      const newProgress = [...prevProgress];
      newProgress.splice(index, 1);
      return newProgress;
    });
  }, []);

  // Clear all files
  const clearFiles = useCallback(() => {
    setFiles([]);
    setProgress([]);
  }, []);

  // Update progress for a file
  const updateProgress = useCallback((index: number, updates: Partial<ConversionProgress>) => {
    setProgress(prevProgress => {
      const newProgress = [...prevProgress];
      newProgress[index] = { ...newProgress[index], ...updates };
      return newProgress;
    });
  }, []);

  // Convert files to Markdown
  const convertFiles = useCallback(async () => {
    setIsCancelled(false);

    for (let i = 0; i < files.length; i++) {
      if (isCancelled) break;

      const file = files[i];
      
      try {
        // Update status to parsing
        updateProgress(i, { status: 'parsing', progress: 10 });
        
        // Parse EPUB
        const parser = new EpubParser();
        const epubContent = await parser.parse(file);
        
        if (isCancelled) break;
        
        // Update status to converting
        updateProgress(i, { status: 'converting', progress: 50 });
        
        // Convert to Markdown
        const converter = new MarkdownConverter(options.markdown);
        const markdownOutput = converter.convert(epubContent);
        
        if (isCancelled) break;
        
        // Update status to downloading
        updateProgress(i, { status: 'downloading', progress: 80 });
        
        // Download the converted content
        const downloadManager = new DownloadManager();
        const downloadOptions = {
          ...options.download,
          filename: options.download.filename || file.name.replace(/\.epub$/, '')
        };
        await downloadManager.downloadMarkdown(markdownOutput, downloadOptions);
        
        // Update status to completed
        updateProgress(i, { status: 'completed', progress: 100 });
      } catch (error) {
        // Update status to error
        updateProgress(i, { 
          status: 'error', 
          progress: 0, 
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  }, [files, options, isCancelled, updateProgress]);

  // Cancel conversion
  const cancelConversion = useCallback(() => {
    setIsCancelled(true);
  }, []);

  // Update Markdown options
  const updateMarkdownOptions = useCallback((newOptions: Partial<MarkdownConverterOptions>) => {
    setOptions(prevOptions => ({
      ...prevOptions,
      markdown: {
        ...prevOptions.markdown,
        ...newOptions
      }
    }));
  }, []);

  // Update download options
  const updateDownloadOptions = useCallback((newOptions: Partial<DownloadOptions>) => {
    setOptions(prevOptions => ({
      ...prevOptions,
      download: {
        ...prevOptions.download,
        ...newOptions
      }
    }));
  }, []);

  return [
    { files, progress, options },
    { 
      addFiles, 
      removeFile, 
      clearFiles, 
      convertFiles, 
      cancelConversion, 
      updateMarkdownOptions, 
      updateDownloadOptions 
    }
  ];
}
