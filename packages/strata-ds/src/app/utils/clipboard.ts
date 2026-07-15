/**
 * Copy text to clipboard with fallback support
 * @param text Text to copy
 * @returns Promise that resolves to true if successful
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // Method 1: Try modern Clipboard API (silently fail if blocked)
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // Silently fall through to fallback method
      // (Clipboard API is often blocked by permissions policy in iframes/dev environments)
    }
  }

  // Method 2: Fallback using execCommand (works in more contexts)
  try {
    return fallbackCopyToClipboard(text);
  } catch (err) {
    // Only log if both methods fail
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}

/**
 * Fallback method using document.execCommand
 * Works in contexts where Clipboard API is blocked
 */
function fallbackCopyToClipboard(text: string): boolean {
  // Create temporary textarea
  const textArea = document.createElement('textarea');
  textArea.value = text;
  
  // Make it invisible and not interactable
  textArea.style.position = 'fixed';
  textArea.style.top = '0';
  textArea.style.left = '0';
  textArea.style.width = '2em';
  textArea.style.height = '2em';
  textArea.style.padding = '0';
  textArea.style.border = 'none';
  textArea.style.outline = 'none';
  textArea.style.boxShadow = 'none';
  textArea.style.background = 'transparent';
  textArea.style.opacity = '0';
  textArea.style.pointerEvents = 'none';
  
  // Add to DOM
  document.body.appendChild(textArea);
  
  // Select text
  textArea.focus();
  textArea.select();
  
  let success = false;
  
  try {
    // Try to copy
    success = document.execCommand('copy');
  } catch (err) {
    console.error('execCommand copy failed:', err);
  }
  
  // Cleanup
  document.body.removeChild(textArea);
  
  return success;
}

/**
 * Hook for React components with state management
 */
export function useCopyToClipboard() {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const copy = async (text: string, id: string) => {
    const success = await copyToClipboard(text);
    
    if (success) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
    
    return success;
  };

  return { copiedId, copy };
}

// For non-React usage
import React from 'react';