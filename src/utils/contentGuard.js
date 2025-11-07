// Production content validation guard: prevents demo messages from appearing in UI
import config from '../config/config.js';

const suspiciousPatterns = [
  /\bdemo\b/i,
  /coming\s+soon/i,
  /\blorem\s+ipsum\b/i,
  /sample\s+data/i,
  /placeholder\s+text/i,
];

function scanTextNodes(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  const matches = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const text = node.nodeValue || '';
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(text)) {
        matches.push({ node, text, pattern });
        break;
      }
    }
  }
  return matches;
}

export function validateContent() {
  if (!config.IS_PRODUCTION) return;
  try {
    const matches = scanTextNodes(document.body);
    if (matches.length > 0) {
      // Hide offending nodes to avoid exposing demo content
      for (const { node } of matches) {
        const el = node.parentElement;
        if (el) {
          el.style.display = 'none';
        }
      }
      // Report clearly in console for visibility
      console.error(`Content validation blocked ${matches.length} demo-like message(s).`);
    }
  } catch (err) {
    console.error('Content validation error:', err);
  }
}