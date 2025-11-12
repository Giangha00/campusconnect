import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SafeText, sanitizeAttribute, safeUrl } from "@/components/common/safe-text";
import { escapeHtml, sanitizeUrl, isSafeUrl } from "@/lib/xss-protection";
import { runXSSTests } from "@/lib/xss-test";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export default function XSSTestPage() {
  const [testInput, setTestInput] = useState('<script>alert("XSS")</script>');
  const [testUrl, setTestUrl] = useState('javascript:alert("XSS")');
  const [testResults, setTestResults] = useState<any>(null);

  const handleRunTests = () => {
    const results = runXSSTests();
    setTestResults(results);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">XSS Protection Test Page</h1>
        <p className="text-muted-foreground">
          This page demonstrates XSS protection mechanisms in CampusConnect
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Test HTML Escaping */}
        <Card>
          <CardHeader>
            <CardTitle>HTML Escaping Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="xss-input">XSS Payload Input</Label>
              <Textarea
                id="xss-input"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder='Enter XSS payload, e.g., <script>alert("XSS")</script>'
                className="mt-1 font-mono text-sm"
              />
            </div>

            <div>
              <Label>Escaped Output (Safe)</Label>
              <div className="mt-1 p-3 bg-muted rounded-md font-mono text-sm">
                <SafeText>{testInput}</SafeText>
              </div>
            </div>

            <div>
              <Label>Raw Escaped HTML</Label>
              <div className="mt-1 p-3 bg-muted rounded-md font-mono text-xs break-all">
                {escapeHtml(testInput)}
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              {testInput.includes('<script>') || testInput.includes('<img') ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">
                    XSS payload detected and escaped
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-yellow-600">
                    No dangerous tags detected
                  </span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Test URL Sanitization */}
        <Card>
          <CardHeader>
            <CardTitle>URL Sanitization Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="xss-url">XSS URL Input</Label>
              <Input
                id="xss-url"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                placeholder='Enter XSS URL, e.g., javascript:alert("XSS")'
                className="mt-1 font-mono text-sm"
              />
            </div>

            <div>
              <Label>URL Validation</Label>
              <div className="mt-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">isSafeUrl:</span>
                  {isSafeUrl(testUrl) ? (
                    <span className="text-green-600 font-semibold">✅ Safe</span>
                  ) : (
                    <span className="text-red-600 font-semibold">❌ Blocked</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">sanitizeUrl:</span>
                  <span className="font-mono text-xs">
                    {sanitizeUrl(testUrl, [], false) || '(blocked)'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <Label>Test Image (Safe URL only)</Label>
              <div className="mt-1 border rounded-md p-2 bg-muted">
                {safeUrl(testUrl, [], false) ? (
                  <img
                    src={safeUrl(testUrl, [], false)}
                    alt="Test image"
                    className="max-w-full h-32 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="h-32 flex items-center justify-center text-muted-foreground">
                    URL blocked - No image loaded
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              {testUrl.toLowerCase().includes('javascript:') ||
              testUrl.toLowerCase().includes('data:') ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">
                    Dangerous URL detected and blocked
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-yellow-600">
                    URL appears safe
                  </span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Automated Test Suite */}
      <Card>
        <CardHeader>
          <CardTitle>Automated Test Suite</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleRunTests} className="w-full">
            Run XSS Protection Tests
          </Button>

          {testResults && (
            <div className="mt-4 p-4 bg-muted rounded-md">
              <div className="flex items-center gap-2 mb-2">
                {testResults.failed === 0 ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="font-semibold">Test Results</span>
              </div>
              <div className="space-y-1 text-sm">
                <div>Total Tests: {testResults.total}</div>
                <div className="text-green-600">Passed: {testResults.passed}</div>
                <div className={testResults.failed > 0 ? 'text-red-600' : 'text-green-600'}>
                  Failed: {testResults.failed}
                </div>
                <div>Success Rate: {testResults.successRate.toFixed(1)}%</div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Check browser console for detailed test results
              </div>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            <p className="mb-2">
              <strong>Note:</strong> Open browser console (F12) and run <code className="bg-muted px-1 rounded">testXSS()</code> for detailed test results.
            </p>
            <p>
              This test suite verifies that XSS protection is working correctly by testing:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>HTML escaping for script tags and event handlers</li>
              <li>URL sanitization for dangerous protocols</li>
              <li>HTML sanitization with DOMPurify</li>
              <li>DOM inspection for XSS payloads</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Live Examples */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Live Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Example 1: Script Tag (Should be escaped)</Label>
            <div className="mt-1 p-3 bg-muted rounded-md">
              <SafeText>{'<script>alert("XSS")</script>Hello World'}</SafeText>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Expected: Text displays as-is, no alert popup
            </div>
          </div>

          <div>
            <Label>Example 2: Image with onerror (Should be escaped)</Label>
            <div className="mt-1 p-3 bg-muted rounded-md">
              <SafeText>{'<img src=x onerror=alert("XSS")>'}</SafeText>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Expected: Text displays as-is, no alert popup
            </div>
          </div>

          <div>
            <Label>Example 3: Safe Image URL</Label>
            <div className="mt-1">
              <img
                src={safeUrl('https://via.placeholder.com/150', [], false)}
                alt="Safe image"
                className="h-32 object-contain"
              />
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Expected: Image loads normally
            </div>
          </div>

          <div>
            <Label>Example 4: Blocked JavaScript URL</Label>
            <div className="mt-1 p-3 bg-muted rounded-md">
              <div className="text-sm">
                URL: <code className="bg-background px-1 rounded">javascript:alert("XSS")</code>
              </div>
              <div className="text-sm mt-1">
                Sanitized: <code className="bg-background px-1 rounded">{sanitizeUrl('javascript:alert("XSS")', [], false) || '(blocked)'}</code>
              </div>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Expected: URL is blocked (empty string returned)
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

