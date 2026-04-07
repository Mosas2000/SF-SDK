/**
 * @vitest-environment node
 */

import { describe, it, expect } from 'vitest';
import {
  stripHtmlTags,
  stripHtmlEntities,
  stripEventHandlers,
  stripControlChars,
  sanitizeText,
  sanitizeMultilineText,
  truncateText,
  encodePathSegment,
  isValidTxId,
  sanitizeUrl,
} from '../src/sanitize';

describe('HTML Stripping', () => {
  describe('stripHtmlTags', () => {
    it('removes HTML tags', () => {
      expect(stripHtmlTags('<div>Hello</div>')).toBe('Hello');
      expect(stripHtmlTags('<p>World</p>')).toBe('World');
    });

    it('removes script tags', () => {
      expect(stripHtmlTags('<script>alert("xss")</script>')).toBe('alert("xss")');
    });

    it('removes self-closing tags', () => {
      expect(stripHtmlTags('Text<br/>More')).toBe('TextMore');
      expect(stripHtmlTags('Image<img src="x"/>here')).toBe('Imagehere');
    });

    it('removes tags with attributes', () => {
      expect(stripHtmlTags('<a href="evil.com">Link</a>')).toBe('Link');
      expect(stripHtmlTags('<img onerror="alert(1)" src="x">')).toBe('');
    });

    it('handles malformed tags', () => {
      expect(stripHtmlTags('<div>Unclosed')).toBe('Unclosed');
      expect(stripHtmlTags('No tags')).toBe('No tags');
    });
  });

  describe('stripHtmlEntities', () => {
    it('removes named entities', () => {
      expect(stripHtmlEntities('&lt;script&gt;')).toBe('script');
      expect(stripHtmlEntities('&amp;&nbsp;&copy;')).toBe('');
    });

    it('removes decimal entities', () => {
      expect(stripHtmlEntities('&#60;test&#62;')).toBe('test');
    });

    it('removes hex entities', () => {
      expect(stripHtmlEntities('&#x3C;test&#x3E;')).toBe('test');
    });

    it('preserves normal text', () => {
      expect(stripHtmlEntities('Normal text')).toBe('Normal text');
    });
  });

  describe('stripEventHandlers', () => {
    it('removes onclick handlers', () => {
      expect(stripEventHandlers('text onclick=alert(1)')).toBe('text');
    });

    it('removes various event handlers', () => {
      expect(stripEventHandlers('onload=x onerror=y onmouseover=z')).toBe('');
    });

    it('preserves normal text', () => {
      expect(stripEventHandlers('No events here')).toBe('No events here');
    });
  });

  describe('stripControlChars', () => {
    it('removes null bytes', () => {
      expect(stripControlChars('Hello\x00World')).toBe('HelloWorld');
    });

    it('removes control characters', () => {
      expect(stripControlChars('Text\x01\x02\x03')).toBe('Text');
    });

    it('preserves tabs and newlines', () => {
      expect(stripControlChars('Line1\nLine2')).toBe('Line1\nLine2');
      expect(stripControlChars('Tab\there')).toBe('Tab\there');
    });

    it('preserves normal text', () => {
      expect(stripControlChars('Normal text')).toBe('Normal text');
    });
  });
});

describe('Comprehensive Sanitization', () => {
  describe('sanitizeText', () => {
    it('applies all sanitization steps', () => {
      const dirty = '<script>alert("xss")</script>Hello';
      const clean = sanitizeText(dirty);
      expect(clean).toBe('alert("xss")Hello');
    });

    it('removes XSS attempts', () => {
      expect(sanitizeText('<img src=x onerror=alert(1)>')).toBe('');
      expect(sanitizeText('<svg/onload=alert(1)>')).toBe('');
    });

    it('handles multiple attacks', () => {
      const attack = '<script>alert(1)</script>&lt;script&gt; onclick=x';
      const clean = sanitizeText(attack);
      expect(clean).not.toContain('<');
      expect(clean).not.toContain('&');
      expect(clean).not.toContain('onclick');
    });

    it('trims whitespace', () => {
      expect(sanitizeText('  Hello  ')).toBe('Hello');
    });

    it('returns empty string for empty input', () => {
      expect(sanitizeText('')).toBe('');
      expect(sanitizeText('   ')).toBe('');
    });

    it('preserves safe text', () => {
      expect(sanitizeText('Normal proposal title')).toBe('Normal proposal title');
    });
  });

  describe('sanitizeMultilineText', () => {
    it('preserves line breaks', () => {
      const input = 'Line 1\nLine 2\nLine 3';
      expect(sanitizeMultilineText(input)).toBe('Line 1\nLine 2\nLine 3');
    });

    it('sanitizes each line', () => {
      const input = '<script>Bad</script>\n<b>Text</b>';
      const output = sanitizeMultilineText(input);
      expect(output).not.toContain('<');
      expect(output).toBe('Bad\nText');
    });

    it('collapses excessive blank lines', () => {
      const input = 'Line 1\n\n\n\nLine 2';
      expect(sanitizeMultilineText(input)).toBe('Line 1\n\nLine 2');
    });

    it('returns empty string for empty input', () => {
      expect(sanitizeMultilineText('')).toBe('');
    });
  });

  describe('truncateText', () => {
    it('truncates long text', () => {
      const long = 'A'.repeat(300);
      const truncated = truncateText(long, 200);
      expect(truncated.length).toBeLessThanOrEqual(200);
      expect(truncated).toContain('...');
    });

    it('preserves short text', () => {
      const short = 'Short text';
      expect(truncateText(short, 200)).toBe(short);
    });

    it('respects custom max length', () => {
      const text = 'Hello World!';
      const truncated = truncateText(text, 8);
      expect(truncated.length).toBeLessThanOrEqual(8);
      expect(truncated).toBe('Hello...');
    });

    it('handles edge case of very small maxLength', () => {
      expect(truncateText('Hello', 3)).toBe('...');
      expect(truncateText('Hello', 2)).toBe('..');
    });
  });
});

describe('URL Utilities', () => {
  describe('encodePathSegment', () => {
    it('encodes special characters', () => {
      expect(encodePathSegment('hello world')).toBe('hello%20world');
      expect(encodePathSegment('test/path')).toBe('test%2Fpath');
    });

    it('prevents path traversal', () => {
      const malicious = '../../etc/passwd';
      const encoded = encodePathSegment(malicious);
      expect(encoded).not.toContain('/');
      expect(encoded).toContain('%2F');
    });

    it('leaves safe characters unchanged', () => {
      expect(encodePathSegment('SP123ABC')).toBe('SP123ABC');
    });
  });

  describe('isValidTxId', () => {
    it('validates 64-char hex strings', () => {
      const valid = 'a'.repeat(64);
      expect(isValidTxId(valid)).toBe(true);
    });

    it('validates with 0x prefix', () => {
      const valid = '0x' + 'a'.repeat(64);
      expect(isValidTxId(valid)).toBe(true);
    });

    it('accepts mixed case', () => {
      const valid = 'A'.repeat(32) + 'b'.repeat(32);
      expect(isValidTxId(valid)).toBe(true);
    });

    it('rejects invalid length', () => {
      expect(isValidTxId('abc123')).toBe(false);
      expect(isValidTxId('a'.repeat(63))).toBe(false);
    });

    it('rejects non-hex characters', () => {
      const invalid = 'g'.repeat(64);
      expect(isValidTxId(invalid)).toBe(false);
    });
  });

  describe('sanitizeUrl', () => {
    it('allows https URLs', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
    });

    it('allows http URLs', () => {
      expect(sanitizeUrl('http://example.com')).toBe('http://example.com');
    });

    it('blocks javascript: protocol', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBe('');
      expect(sanitizeUrl('JavaScript:alert(1)')).toBe('');
    });

    it('blocks data: protocol', () => {
      expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('');
    });

    it('blocks vbscript: protocol', () => {
      expect(sanitizeUrl('vbscript:msgbox(1)')).toBe('');
    });

    it('blocks blob: protocol', () => {
      expect(sanitizeUrl('blob:https://example.com/uuid')).toBe('');
    });

    it('allows relative paths', () => {
      expect(sanitizeUrl('/proposals/1')).toBe('/proposals/1');
      expect(sanitizeUrl('./test')).toBe('./test');
    });

    it('trims whitespace', () => {
      expect(sanitizeUrl('  https://example.com  ')).toBe('https://example.com');
    });

    it('returns empty for empty input', () => {
      expect(sanitizeUrl('')).toBe('');
    });

    it('respects custom allowed protocols', () => {
      expect(sanitizeUrl('ftp://example.com', ['ftp:'])).toBe('ftp://example.com');
      expect(sanitizeUrl('http://example.com', ['ftp:'])).toBe('');
    });
  });
});

describe('Security Edge Cases', () => {
  it('handles nested XSS attempts', () => {
    const nested = '<<script>script>alert(1)<</script>/script>';
    const clean = sanitizeText(nested);
    // Recursive stripping removes nested tags completely
    expect(clean).toBe('alert(1)');
  });

  it('handles encoded attacks', () => {
    const encoded = '&lt;script&gt;alert(1)&lt;/script&gt;';
    const clean = sanitizeText(encoded);
    expect(clean).not.toContain('&lt;');
    expect(clean).not.toContain('&gt;');
  });

  it('handles null byte injection', () => {
    const nullByte = 'text\x00<script>alert(1)</script>';
    const clean = sanitizeText(nullByte);
    expect(clean).not.toContain('\x00');
    expect(clean).not.toContain('<script>');
  });

  it('handles unicode normalization attacks', () => {
    // Some unicode characters can normalize to dangerous chars
    const input = 'Test\u0000Text';
    const clean = sanitizeText(input);
    expect(clean).not.toContain('\u0000');
  });

  it('handles extremely long input', () => {
    const veryLong = '<script>' + 'A'.repeat(10000) + '</script>';
    const clean = sanitizeText(veryLong);
    expect(clean).not.toContain('<script>');
    expect(clean.length).toBeLessThan(veryLong.length);
  });
});
