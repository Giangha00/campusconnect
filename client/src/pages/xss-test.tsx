import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SafeText,
  sanitizeAttribute,
  safeUrl,
} from "@/components/common/safe-text";
import { escapeHtml, sanitizeUrl, isSafeUrl } from "@/lib/xss-protection";
import { runXSSTests } from "@/lib/xss-test";
import {
  runXSSAttackSimulation,
  XSS_ATTACK_PAYLOADS,
} from "@/lib/xss-attack-simulation";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Shield,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

export default function XSSTestPage() {
  const [testInput, setTestInput] = useState('<script>alert("XSS")</script>');
  const [testUrl, setTestUrl] = useState('javascript:alert("XSS")');
  const [testResults, setTestResults] = useState<any>(null);
  const [attackSimulationResults, setAttackSimulationResults] =
    useState<any>(null);

  const handleRunTests = () => {
    const results = runXSSTests();
    setTestResults(results);
  };

  const handleRunAttackSimulation = () => {
    const results = runXSSAttackSimulation();
    setAttackSimulationResults(results);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">
            XSS Protection Test & Attack Simulation
          </h1>
        </div>
        <p className="text-muted-foreground">
          Comprehensive XSS protection testing and attack simulation based on
          PortSwigger Web Security Academy best practices
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            <ShieldCheck className="h-3 w-3 mr-1" />
            Content-Security-Policy Enabled
          </Badge>
          <Badge variant="outline" className="text-xs">
            <ShieldCheck className="h-3 w-3 mr-1" />
            HTML Escaping
          </Badge>
          <Badge variant="outline" className="text-xs">
            <ShieldCheck className="h-3 w-3 mr-1" />
            URL Sanitization
          </Badge>
          <Badge variant="outline" className="text-xs">
            <ShieldCheck className="h-3 w-3 mr-1" />
            DOMPurify Integration
          </Badge>
        </div>
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
              {testInput.includes("<script>") || testInput.includes("<img") ? (
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
                    <span className="text-green-600 font-semibold">
                      ✅ Safe
                    </span>
                  ) : (
                    <span className="text-red-600 font-semibold">
                      ❌ Blocked
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">sanitizeUrl:</span>
                  <span className="font-mono text-xs">
                    {sanitizeUrl(testUrl, [], false) || "(blocked)"}
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
                      target.style.display = "none";
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
              {testUrl.toLowerCase().includes("javascript:") ||
              testUrl.toLowerCase().includes("data:") ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">
                    Dangerous URL detected and blocked
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-yellow-600">URL appears safe</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attack Simulation & Test Suite */}
      <Tabs defaultValue="tests" className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tests">Basic Tests</TabsTrigger>
          <TabsTrigger value="simulation">Attack Simulation</TabsTrigger>
        </TabsList>

        <TabsContent value="tests">
          <Card>
            <CardHeader>
              <CardTitle>Automated Test Suite</CardTitle>
              <CardDescription>
                Basic XSS protection functionality tests
              </CardDescription>
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
                    <div className="text-green-600">
                      Passed: {testResults.passed}
                    </div>
                    <div
                      className={
                        testResults.failed > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }>
                      Failed: {testResults.failed}
                    </div>
                    <div>
                      Success Rate: {testResults.successRate.toFixed(1)}%
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Check browser console for detailed test results
                  </div>
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                <p className="mb-2">
                  <strong>Note:</strong> Open browser console (F12) and run{" "}
                  <code className="bg-muted px-1 rounded">testXSS()</code> for
                  detailed test results.
                </p>
                <p>
                  This test suite verifies that XSS protection is working
                  correctly by testing:
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
        </TabsContent>

        <TabsContent value="simulation">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-red-600" />
                XSS Attack Simulation & Drill
              </CardTitle>
              <CardDescription>
                Comprehensive attack simulation with{" "}
                {XSS_ATTACK_PAYLOADS.length} real-world XSS payloads
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-red-900 dark:text-red-100 mb-1">
                      Attack Simulation Mode
                    </p>
                    <p className="text-red-700 dark:text-red-300">
                      This will simulate {XSS_ATTACK_PAYLOADS.length} different
                      XSS attack vectors to test our defense mechanisms. Check
                      the browser console for detailed results.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleRunAttackSimulation}
                className="w-full bg-red-600 hover:bg-red-700"
                variant="destructive">
                <ShieldAlert className="h-4 w-4 mr-2" />
                Run Attack Simulation
              </Button>

              {attackSimulationResults && (
                <div className="mt-4 p-4 bg-muted rounded-md space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    {attackSimulationResults.failed === 0 ? (
                      <>
                        <ShieldCheck className="h-5 w-5 text-green-600" />
                        <span className="font-semibold text-lg">
                          All Attacks Blocked!
                        </span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="h-5 w-5 text-red-600" />
                        <span className="font-semibold text-lg">
                          Some Attacks Passed Through
                        </span>
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-background rounded-md">
                      <div className="text-2xl font-bold text-blue-600">
                        {attackSimulationResults.total}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Total Attacks
                      </div>
                    </div>
                    <div className="text-center p-3 bg-background rounded-md">
                      <div className="text-2xl font-bold text-green-600">
                        {attackSimulationResults.blocked}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Blocked
                      </div>
                    </div>
                    <div className="text-center p-3 bg-background rounded-md">
                      <div className="text-2xl font-bold text-green-600">
                        {attackSimulationResults.escaped}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Escaped
                      </div>
                    </div>
                    <div className="text-center p-3 bg-background rounded-md">
                      <div
                        className={`text-2xl font-bold ${
                          attackSimulationResults.failed > 0
                            ? "text-red-600"
                            : "text-green-600"
                        }`}>
                        {attackSimulationResults.failed}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Failed
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Success Rate</span>
                      <span
                        className={`text-lg font-bold ${
                          attackSimulationResults.failed === 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}>
                        {(
                          ((attackSimulationResults.blocked +
                            attackSimulationResults.escaped +
                            attackSimulationResults.sanitized) /
                            attackSimulationResults.total) *
                          100
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                  </div>

                  {attackSimulationResults.failed > 0 && (
                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
                      <p className="text-sm text-red-700 dark:text-red-300">
                        <strong>Warning:</strong>{" "}
                        {attackSimulationResults.failed} attack(s) passed
                        through our defenses. Check the browser console for
                        details.
                      </p>
                    </div>
                  )}

                  <div className="mt-2 text-xs text-muted-foreground">
                    <p>
                      Check browser console (F12) for detailed attack-by-attack
                      results.
                    </p>
                    <p className="mt-1">
                      Run{" "}
                      <code className="bg-background px-1 rounded">
                        simulateXSSAttacks()
                      </code>{" "}
                      in console for full simulation.
                    </p>
                  </div>
                </div>
              )}

              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  <strong>Attack Categories Tested:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Reflected XSS attacks</li>
                  <li>Stored XSS attacks</li>
                  <li>DOM-based XSS attacks</li>
                  <li>URL-based XSS attacks</li>
                  <li>Event handler XSS attacks</li>
                </ul>
                <p className="mt-2">
                  <strong>Attack Vectors Include:</strong> Script tags, image
                  tags, event handlers, JavaScript protocols, Data URIs,
                  iframes, encoding bypasses, and more.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Live Examples */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Live Protection Examples</CardTitle>
          <CardDescription>
            See how XSS protection works in real-time
          </CardDescription>
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
                src={safeUrl("https://via.placeholder.com/150", [], false)}
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
                URL:{" "}
                <code className="bg-background px-1 rounded">
                  javascript:alert("XSS")
                </code>
              </div>
              <div className="text-sm mt-1">
                Sanitized:{" "}
                <code className="bg-background px-1 rounded">
                  {sanitizeUrl('javascript:alert("XSS")', [], false) ||
                    "(blocked)"}
                </code>
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
