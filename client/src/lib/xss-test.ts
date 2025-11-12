/**
 * XSS Protection Test Script
 * Run this in browser console to verify XSS protection is working
 */

import { escapeHtml, sanitizeUrl, isSafeUrl, sanitizeHtml } from './xss-protection';

export function runXSSTests() {
  console.log('%c=== XSS PROTECTION TEST SUITE ===', 'font-size: 20px; font-weight: bold; color: #2563eb;');
  console.log('Testing XSS protection mechanisms in CampusConnect...\n');

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  // Test 1: HTML Escaping
  console.log('%c1. HTML ESCAPING TEST', 'font-size: 16px; font-weight: bold; color: #059669;');
  const htmlXssPayloads = [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
    '<svg onload=alert("XSS")>',
    '<iframe src="javascript:alert(1)"></iframe>',
    '<body onload=alert("XSS")>',
    '<input onfocus=alert("XSS") autofocus>',
  ];

  htmlXssPayloads.forEach((payload, index) => {
    totalTests++;
    const escaped = escapeHtml(payload);
    const isSafe = !escaped.includes('<script>') && 
                   !escaped.includes('<img') && 
                   !escaped.includes('<svg') &&
                   !escaped.includes('<iframe') &&
                   !escaped.includes('<body') &&
                   !escaped.includes('<input');
    
    if (isSafe && (escaped.includes('&lt;') || escaped.includes('&gt;'))) {
      passedTests++;
      console.log(`  ✅ Test ${index + 1}: PASSED`);
      console.log(`     Original: ${payload}`);
      console.log(`     Escaped:  ${escaped}`);
    } else {
      failedTests++;
      console.log(`  ❌ Test ${index + 1}: FAILED`);
      console.log(`     Original: ${payload}`);
      console.log(`     Escaped:  ${escaped}`);
    }
  });

  // Test 2: URL Sanitization
  console.log('\n%c2. URL SANITIZATION TEST', 'font-size: 16px; font-weight: bold; color: #059669;');
  const urlXssPayloads = [
    { name: 'JavaScript protocol', url: 'javascript:alert("XSS")', shouldBlock: true },
    { name: 'Data URI with script', url: 'data:text/html,<script>alert("XSS")</script>', shouldBlock: true },
    { name: 'Data URI SVG', url: 'data:image/svg+xml,<svg onload=alert("XSS")></svg>', shouldBlock: true },
    { name: 'VBScript protocol', url: 'vbscript:alert("XSS")', shouldBlock: true },
    { name: 'File protocol', url: 'file:///etc/passwd', shouldBlock: true },
    { name: 'About protocol', url: 'about:blank', shouldBlock: true },
    { name: 'Safe HTTP URL', url: 'https://example.com/image.jpg', shouldBlock: false },
    { name: 'Safe HTTPS URL', url: 'https://cdn.example.com/pic.png', shouldBlock: false },
    { name: 'Relative URL', url: '/images/logo.png', shouldBlock: false },
  ];

  urlXssPayloads.forEach((test, index) => {
    totalTests++;
    const isSafe = isSafeUrl(test.url);
    const sanitized = sanitizeUrl(test.url, [], false);
    
    const passed = (test.shouldBlock && !isSafe && !sanitized) || 
                  (!test.shouldBlock && isSafe && sanitized);
    
    if (passed) {
      passedTests++;
      console.log(`  ✅ Test ${index + 1}: PASSED - ${test.name}`);
      console.log(`     URL: ${test.url}`);
      console.log(`     isSafeUrl: ${isSafe}, sanitizeUrl: ${sanitized || '(blocked)'}`);
    } else {
      failedTests++;
      console.log(`  ❌ Test ${index + 1}: FAILED - ${test.name}`);
      console.log(`     URL: ${test.url}`);
      console.log(`     Expected: ${test.shouldBlock ? 'BLOCKED' : 'ALLOWED'}`);
      console.log(`     Got: isSafeUrl=${isSafe}, sanitizeUrl=${sanitized || '(blocked)'}`);
    }
  });

  // Test 3: HTML Sanitization (DOMPurify)
  console.log('\n%c3. HTML SANITIZATION TEST (DOMPurify)', 'font-size: 16px; font-weight: bold; color: #059669;');
  const htmlSanitizeTests = [
    { input: '<b>Bold text</b>', shouldKeep: true },
    { input: '<i>Italic text</i>', shouldKeep: true },
    { input: '<a href="https://example.com">Link</a>', shouldKeep: true },
    { input: '<script>alert("XSS")</script>', shouldKeep: false },
    { input: '<img src=x onerror=alert("XSS")>', shouldKeep: false },
    { input: '<iframe src="javascript:alert(1)"></iframe>', shouldKeep: false },
  ];

  htmlSanitizeTests.forEach((test, index) => {
    totalTests++;
    const sanitized = sanitizeHtml(test.input);
    const hasDangerous = sanitized.includes('<script>') || 
                        sanitized.includes('<img') ||
                        sanitized.includes('<iframe');
    
    const passed = test.shouldKeep ? !hasDangerous && sanitized.length > 0 : !hasDangerous;
    
    if (passed) {
      passedTests++;
      console.log(`  ✅ Test ${index + 1}: PASSED`);
      console.log(`     Input:    ${test.input}`);
      console.log(`     Output:   ${sanitized}`);
    } else {
      failedTests++;
      console.log(`  ❌ Test ${index + 1}: FAILED`);
      console.log(`     Input:    ${test.input}`);
      console.log(`     Output:   ${sanitized}`);
    }
  });

  // Test 4: DOM Inspection
  console.log('\n%c4. DOM INSPECTION TEST', 'font-size: 16px; font-weight: bold; color: #059669;');
  
  // Check for XSS in rendered DOM
  const scripts = document.querySelectorAll('script');
  let foundXSSScript = false;
  scripts.forEach(script => {
    if (script.innerHTML.includes('alert') && script.innerHTML.includes('XSS')) {
      foundXSSScript = true;
    }
  });

  const images = document.querySelectorAll('img');
  let foundXSSImage = false;
  images.forEach(img => {
    const src = img.src || img.getAttribute('src') || '';
    if (src.toLowerCase().includes('javascript:') || src.toLowerCase().includes('data:text/html')) {
      foundXSSImage = true;
    }
    if (img.getAttribute('onerror')) {
      foundXSSImage = true;
    }
  });

  totalTests += 2;
  if (!foundXSSScript) {
    passedTests++;
    console.log('  ✅ No XSS scripts found in DOM');
  } else {
    failedTests++;
    console.log('  ❌ XSS scripts found in DOM');
  }

  if (!foundXSSImage) {
    passedTests++;
    console.log('  ✅ No XSS URLs found in image sources');
  } else {
    failedTests++;
    console.log('  ❌ XSS URLs found in image sources');
  }

  // Summary
  console.log('\n%c=== TEST SUMMARY ===', 'font-size: 18px; font-weight: bold; color: #2563eb;');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`%cPassed: ${passedTests}`, `color: #059669; font-weight: bold;`);
  console.log(`%cFailed: ${failedTests}`, `color: ${failedTests > 0 ? '#dc2626' : '#059669'}; font-weight: bold;`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (failedTests === 0) {
    console.log('\n%c✅ ALL TESTS PASSED - XSS PROTECTION IS WORKING!', 'font-size: 16px; font-weight: bold; color: #059669; background: #d1fae5; padding: 10px;');
  } else {
    console.log('\n%c⚠️ SOME TESTS FAILED - REVIEW XSS PROTECTION', 'font-size: 16px; font-weight: bold; color: #dc2626; background: #fee2e2; padding: 10px;');
  }

  return {
    total: totalTests,
    passed: passedTests,
    failed: failedTests,
    successRate: (passedTests / totalTests) * 100
  };
}

// Export for console access
if (typeof window !== 'undefined') {
  (window as any).testXSS = runXSSTests;
  console.log('%cXSS Test Suite Loaded!', 'font-size: 14px; font-weight: bold; color: #2563eb;');
  console.log('Run testXSS() in console to test XSS protection');
}

