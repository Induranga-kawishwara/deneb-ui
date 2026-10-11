'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Copy, Check, Sparkles, Terminal, ShieldAlert, Cpu } from 'lucide-react';

export function AiPromptClient() {
  const [copied, setCopied] = useState(false);

  const AI_MASTER_PROMPT = `# Fivora Template Master Implementation Prompt

You are the implementation owner for converting the website in the current template workspace into a production-ready Fivora template. Read the complete Fivora Template Developer Guide before taking action. Inspect the whole template repository, implement every required change, validate the result, and produce a clean source ZIP.

GOLDEN PLATFORM CONTRACT RULES:
1. BasePath & Subpath Images:
   - Next.js static exports (output: "export", unoptimized: true) DO NOT automatically prefix basePath to raw string image sources.
   - Always wrap local static image paths in withBasePath() or use <DenebImage src="..." /> from @deneb-ui/ui.
   - Never pass withBasePath to Next.js <Link> or router.push(); Next.js handles navigation routes automatically.

2. Catalog Prices & Currency:
   - Catalog price amounts MUST be JSON numbers (e.g., price: 1000) and editorSchema price fields MUST use type: "number".
   - Store currency separately (e.g. currency: "LKR" or currencySymbol: "Rs."). Never store "Rs. 1000" in a numeric field.

3. Live Product Detail Route:
   - Storefronts with catalogs MUST provide src/app/products/detail/page.tsx with <PlatformProductDetail />.
   - Product cards MUST link via platformProductDetailHref(product.id) to resolve to /products/detail/?id=PRODUCT_ID.

4. Safe List Array Keys:
   - Always provide safe fallback keys when mapping arrays: key={item.id ?? \`\${collectionName}-\${index}\`}.

5. Helper Props Isolation:
   - Never leak non-standard preview helper props (previewPath, previewItemPath) onto native DOM elements or Framer Motion tags.

6. Validation & Packaging:
   - Run "deneb doctor ." to verify all 40 diagnostics pass with 0 errors.
   - Run "npm run verify" to validate empty-state and probe-content static fixtures.
   - Run "deneb zip ." to package clean fivora-template.zip for marketplace upload.`;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(AI_MASTER_PROMPT);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = AI_MASTER_PROMPT;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy prompt:', err);
    }
  };

  return (
    <div className="flex w-full min-h-full">
      <div className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 xl:px-12 py-8 space-y-10 max-w-5xl">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
          <Link href="/docs/introduction" className="hover:text-white transition-colors">
            Docs
          </Link>
          <span>/</span>
          <span className="text-[#818CF8] font-semibold">AI Master Prompt</span>
        </div>

        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
              AI Master Prompt & Developer Rules
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#818CF8]/15 text-[#A5B4FC] border border-[#818CF8]/30 flex items-center gap-1 shadow-[0_0_12px_rgba(129,140,248,0.2)]">
              <Sparkles className="w-3 h-3 text-[#818CF8]" />
              Official v2.0
            </span>
          </div>
          <p className="text-base text-[#94A3B8] leading-relaxed max-w-3xl">
            Copy and paste this master prompt directly into Claude, ChatGPT, Cursor, or Antigravity to build, restructure, and validate 100% compliant Fivora storefront templates.
          </p>
        </div>

        {/* Prompt Card */}
        <div className="rounded-xl border border-white/10 bg-[#0F172A]/80 backdrop-blur-md overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-2 text-xs font-mono text-[#94A3B8]">
              <Terminal className="w-4 h-4 text-[#818CF8]" />
              <span>fivora-ai-master-prompt.md</span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-[#818CF8]/20 hover:bg-[#818CF8]/30 border border-[#818CF8]/30 transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Copied to Clipboard</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Master Prompt</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-5 text-xs text-[#E2E8F0] font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[500px]">
            {AI_MASTER_PROMPT}
          </pre>
        </div>

        {/* Architecture Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl border border-white/10 bg-white/[0.02] space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Subpath Image Rule
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              When templates are loaded in the Fivora Live Simulator, assets are hosted under a subpath. Standard Next.js &lt;Image&gt; components without <code className="text-[#A5B4FC]">withBasePath()</code> or <code className="text-[#A5B4FC]">&lt;DenebImage&gt;</code> will fail with 404 errors.
            </p>
          </div>
          <div className="p-5 rounded-xl border border-white/10 bg-white/[0.02] space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Cpu className="w-4 h-4 text-[#818CF8]" />
              Live Data Fill Guarantee
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              <code className="text-[#A5B4FC]">withBasePath()</code> transparently distinguishes between local relative assets (prepending base path) and merchant-uploaded URLs (<code className="text-[#A5B4FC]">https://...</code>), ensuring 100% live preview accuracy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
