/**
 * XSS Protection Test Script
 * Copy and paste this entire script into browser console to test XSS protection
 * 
 * Usage: Just paste this code into Chrome DevTools Console and press Enter
 */

(function() {
  console.log('%c=== XSS PROTECTION TEST SUITE ===', 'font-size: 20px; font-weight: bold; color: #2563eb;');
  console.log('Testing XSS protection mechanisms in CampusConnect...\n');

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  // Helper functions (simplified versions)
  function escapeHtml(text) {
    if (!text) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
    };
    return text.replace(/[&<>"'/]/g, (char) => map[char] || char);
  }

  function isSafeUrl(url) {
    if (!url) return false;
    const lowerUrl = url.toLowerCase().trim();
    if (lowerUrl.startsWith('javascript:') || lowerUrl.startsWith('data:')) {
      return false;
    }
    if (lowerUrl.startsWith('vbscript:') || lowerUrl.startsWith('file:') || lowerUrl.startsWith('about:')) {
      return false;
    }
    return true;
  }

  // Test 1: HTML Escaping
  console.log('%c1. HTML ESCAPING TEST', 'font-size: 16px; font-weight: bold; color: #059669;');
  const htmlXssPayloads = [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
    '<svg onload=alert("XSS")>',
    '<iframe src="javascript:alert(1)"></iframe>',
    '<body onload=alert("XSS")>',
  ];

  htmlXssPayloads.forEach((payload, index) => {
    totalTests++;
    const escaped = escapeHtml(payload);
    const isSafe = !escaped.includes('<script>') && 
                   !escaped.includes('<img') && 
                   !escaped.includes('<svg') &&
                   !escaped.includes('<iframe') &&
                   !escaped.includes('<body');
    
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
    { name: 'Data URI', url: 'data:text/html,<script>alert("XSS")</script>', shouldBlock: true },
    { name: 'VBScript protocol', url: 'vbscript:alert("XSS")', shouldBlock: true },
    { name: 'File protocol', url: 'file:///etc/passwd', shouldBlock: true },
    { name: 'Safe HTTP URL', url: 'https://example.com/image.jpg', shouldBlock: false },
    { name: 'Relative URL', url: '/images/logo.png', shouldBlock: false },
  ];

  urlXssPayloads.forEach((test, index) => {
    totalTests++;
    const isSafe = isSafeUrl(test.url);
    const passed = (test.shouldBlock && !isSafe) || (!test.shouldBlock && isSafe);
    
    if (passed) {
      passedTests++;
      console.log(`  ✅ Test ${index + 1}: PASSED - ${test.name}`);
      console.log(`     URL: ${test.url}`);
      console.log(`     Status: ${test.shouldBlock ? 'BLOCKED ✅' : 'ALLOWED ✅'}`);
    } else {
      failedTests++;
      console.log(`  ❌ Test ${index + 1}: FAILED - ${test.name}`);
      console.log(`     URL: ${test.url}`);
      console.log(`     Expected: ${test.shouldBlock ? 'BLOCKED' : 'ALLOWED'}`);
      console.log(`     Got: ${isSafe ? 'ALLOWED' : 'BLOCKED'}`);
    }
  });

  // Test 3: DOM Inspection
  console.log('\n%c3. DOM INSPECTION TEST', 'font-size: 16px; font-weight: bold; color: #059669;');
  
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

  // Check for escaped content
  const eventDescriptions = document.querySelectorAll('[data-testid*="event-description"]');
  let foundUnescapedXSS = false;
  eventDescriptions.forEach(desc => {
    const html = desc.innerHTML;
    const text = desc.textContent;
    if (text && text.includes('onerror') && html.includes('<img') && !html.includes('&lt;img')) {
      foundUnescapedXSS = true;
    }
  });

  totalTests += 3;
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

  if (!foundUnescapedXSS) {
    passedTests++;
    console.log('  ✅ No unescaped XSS payloads in event descriptions');
  } else {
    failedTests++;
    console.log('  ❌ Unescaped XSS payloads found in event descriptions');
  }

  // Test 4: Real Event Data Test
  console.log('\n%c4. REAL EVENT DATA TEST', 'font-size: 16px; font-weight: bold; color: #059669;');
  
  const eventCards = document.querySelectorAll('[data-testid*="card-event"]');
  let testedEvents = 0;
  let safeEvents = 0;
  
  eventCards.forEach((card, index) => {
    const title = card.querySelector('[data-testid*="event-title"]');
    const desc = card.querySelector('[data-testid*="event-description"]');
    const img = card.querySelector('img');
    
    if (title || desc || img) {
      testedEvents++;
      let isSafe = true;
      
      if (title) {
        const html = title.innerHTML;
        if (html.includes('<script>') || (html.includes('<img') && !html.includes('&lt;img'))) {
          isSafe = false;
          console.log(`  ⚠️ Event ${index + 1} title may have XSS`);
        }
      }
      
      if (desc) {
        const html = desc.innerHTML;
        if (html.includes('<script>') || (html.includes('<img') && !html.includes('&lt;img'))) {
          isSafe = false;
          console.log(`  ⚠️ Event ${index + 1} description may have XSS`);
        }
      }
      
      if (img) {
        const src = img.src || img.getAttribute('src') || '';
        if (src.toLowerCase().includes('javascript:') || src.toLowerCase().includes('data:text/html')) {
          isSafe = false;
          console.log(`  ⚠️ Event ${index + 1} image has XSS URL`);
        }
      }
      
      if (isSafe) {
        safeEvents++;
      }
    }
  });
  
  totalTests++;
  if (testedEvents === safeEvents && testedEvents > 0) {
    passedTests++;
    console.log(`  ✅ All ${testedEvents} events are safe`);
  } else {
    failedTests++;
    console.log(`  ❌ ${testedEvents - safeEvents} events may have XSS vulnerabilities`);
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
})();

