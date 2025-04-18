import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { MarkdownOutput, MarkdownChapter } from './md-converter';
import { EpubImage } from './epub-parser';

export interface DownloadOptions {
  filename: string;
  format: 'zip' | 'individual';
}

export class DownloadManager {
  /**
   * Download converted Markdown content
   */
  async downloadMarkdown(output: MarkdownOutput, options: DownloadOptions): Promise<void> {
    if (options.format === 'zip') {
      await this.downloadAsZip(output, options.filename);
    } else {
      this.downloadIndividualFiles(output);
    }
  }

  /**
   * Download content as a ZIP file
   */
  private async downloadAsZip(output: MarkdownOutput, filename: string): Promise<void> {
    const zip = new JSZip();
    
    // Add README.md
    zip.file('README.md', output.readme);
    
    // Add SUMMARY.md
    zip.file('SUMMARY.md', output.summary);
    
    // Add chapters
    output.chapters.forEach(chapter => {
      zip.file(chapter.filename, chapter.content);
    });
    
    // Add images if any
    if (output.images.length > 0) {
      const imagesFolder = zip.folder('images');
      if (imagesFolder) {
        output.images.forEach(image => {
          imagesFolder.file(image.filename, image.data, { base64: true });
        });
      }
    }
    
    // Generate ZIP file
    const content = await zip.generateAsync({ type: 'blob' });
    
    // Download the ZIP file
    saveAs(content, `${filename}.zip`);
  }

  /**
   * Download individual files
   */
  private downloadIndividualFiles(output: MarkdownOutput): void {
    // Download README.md
    this.downloadTextFile('README.md', output.readme);
    
    // Download SUMMARY.md
    this.downloadTextFile('SUMMARY.md', output.summary);
    
    // Download chapters
    output.chapters.forEach(chapter => {
      this.downloadTextFile(chapter.filename, chapter.content);
    });
    
    // Download images
    output.images.forEach(image => {
      this.downloadBase64File(image.filename, image.data, image.mimeType);
    });
  }

  /**
   * Download a text file
   */
  private downloadTextFile(filename: string, content: string): void {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    saveAs(blob, filename);
  }

  /**
   * Download a base64 encoded file
   */
  private downloadBase64File(filename: string, data: string, mimeType: string): void {
    const byteCharacters = atob(data);
    const byteArrays = [];
    
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    
    const blob = new Blob(byteArrays, { type: mimeType });
    saveAs(blob, filename);
  }

  /**
   * Create a download link for a large file
   * This is useful for very large files that might cause memory issues
   */
  createDownloadLink(filename: string, content: Blob): HTMLAnchorElement {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = filename;
    link.style.display = 'none';
    return link;
  }
}
