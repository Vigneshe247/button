/**
 * Minimal Top-Left Download Button Implementation
 * Handles automatic download, micro-interaction states, and clipboard operations.
 */

document.addEventListener('DOMContentLoaded', () => {
  const downloadBtn = document.getElementById('downloadBtn');
  const btnLabel = document.getElementById('btnLabel');
  const copySnippetBtn = document.getElementById('copySnippetBtn');
  const copyBtnText = document.getElementById('copyBtnText');
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');

  // Configuration for target file
  const FILE_CONFIG = {
    url: 'file.txt',
    fileName: 'file.txt'
  };

  let isDownloading = false;
  let toastTimer = null;

  /**
   * Triggers automatic file download with browser fallback
   */
  async function triggerDownload() {
    if (isDownloading) return;
    isDownloading = true;

    // 1. Enter Loading State
    downloadBtn.classList.remove('is-success');
    downloadBtn.classList.add('is-loading');
    btnLabel.textContent = 'Saving...';

    try {
      // Fetch file as blob to guarantee background download without page navigation
      const response = await fetch(FILE_CONFIG.url);
      
      if (!response.ok) {
        throw new Error(`Failed to load file: ${response.statusText}`);
      }

      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);

      // Create invisible anchor and trigger click
      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = objectUrl;
      downloadAnchor.download = FILE_CONFIG.fileName;
      downloadAnchor.style.display = 'none';
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();

      // Clean up memory
      setTimeout(() => {
        window.URL.revokeObjectURL(objectUrl);
        document.body.removeChild(downloadAnchor);
      }, 500);

      // 2. Enter Success State
      downloadBtn.classList.remove('is-loading');
      downloadBtn.classList.add('is-success');
      btnLabel.textContent = 'Downloaded!';
      showToast('File downloaded successfully!');

    } catch (err) {
      console.warn('Blob fetch failed, falling back to direct anchor download:', err);
      
      // Fallback: direct anchor link
      const fallbackAnchor = document.createElement('a');
      fallbackAnchor.href = FILE_CONFIG.url;
      fallbackAnchor.download = FILE_CONFIG.fileName;
      fallbackAnchor.target = '_blank';
      fallbackAnchor.style.display = 'none';
      document.body.appendChild(fallbackAnchor);
      fallbackAnchor.click();
      document.body.removeChild(fallbackAnchor);

      // Still show success to user
      downloadBtn.classList.remove('is-loading');
      downloadBtn.classList.add('is-success');
      btnLabel.textContent = 'Downloaded!';
      showToast('Download initiated!');
    }

    // 3. Reset Button State after 2.2 seconds
    setTimeout(() => {
      downloadBtn.classList.remove('is-loading', 'is-success');
      btnLabel.textContent = 'Download';
      isDownloading = false;
    }, 2200);
  }

  /**
   * Display floating toast notification
   */
  function showToast(message) {
    if (toastTimer) clearTimeout(toastTimer);
    toastMsg.textContent = message;
    toast.classList.add('show');
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  /**
   * Copy standalone snippet to clipboard
   */
  async function copySnippet() {
    const snippetContent = document.getElementById('codeSnippetContent').textContent;
    try {
      await navigator.clipboard.writeText(snippetContent);
      copyBtnText.textContent = 'Copied!';
      showToast('Code snippet copied to clipboard!');
      setTimeout(() => {
        copyBtnText.textContent = 'Copy Code';
      }, 2000);
    } catch (err) {
      // Fallback selection copy
      const textarea = document.createElement('textarea');
      textarea.value = snippetContent;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      copyBtnText.textContent = 'Copied!';
      showToast('Code snippet copied to clipboard!');
      setTimeout(() => {
        copyBtnText.textContent = 'Copy Code';
      }, 2000);
    }
  }

  // Event Listeners
  downloadBtn.addEventListener('click', triggerDownload);
  if (copySnippetBtn) {
    copySnippetBtn.addEventListener('click', copySnippet);
  }
});
