# AI Chat Debug Report

Generated: 2026-07-02T18:39 UTC

## 1. Active Model & Endpoint

| Field | Value |
|-------|-------|
| Model | `llama-3.1-8b-instant` |
| Endpoint | `https://api.groq.com/openai/v1/chat/completions` |
| Provider | Groq (free tier) |
| TPM Limit | 6,000 tokens/min |
| Org ID | `org_01kwj114gsevfrnev9d0rktg5d` |

## 2. Environment Variables

| File | `GROQ_API_KEY` Status |
|------|----------------------|
| `.env` | Set (actual key, not empty) |
| `.env.development` | Set (actual key, not empty) |

**Critical fix:** `.env.development` previously had `GROQ_API_KEY=` (empty value). In dev mode, `.env.development` overrides `.env`, so the actual key was being wiped out. Both files now contain the real key.

### API key (masked)
`gsk_9eeJ************NZ8`

## 3. Provider Chain

- ✓ Groq — key set, endpoint reachable, model responds
- ✗ OpenAI — no API key (`LLM_API_KEY` / `OPENAI_API_KEY` not set)
- ✗ Gemini — no API key (`GEMINI_API_KEY` not set)
- ✓ Local — always available as fallback (generates templated responses)

## 4. Token Usage (per request)

| Request | Prompt Tokens | Completion Tokens | Total | Response Time |
|---------|---------------|-------------------|-------|---------------|
| "Azul" | 1,395 | 188 | 1,583 | 766ms |
| "كيف حالك؟" | 1,398 | 77 | 1,475 | 265ms |
| "Translate Azul to French" | ~1,600 | ~50 | ~1,650 | ~400ms |
| "Tell me about Nubian culture" | ~1,400 | ~300 | ~1,700 | ~700ms |
| Conversation (3-turn) | ~1,800 | ~250 | ~2,050 | ~900ms |

The system prompt is ~1,350 tokens. Each user message adds ~50-200 tokens. Rate limit (6,000 TPM) is hit after ~3-4 rapid requests.

## 5. Validation Results

| # | Test Input | Expected | Actual | Status |
|---|------------|----------|--------|--------|
| 1 | `Azul` | English explanation of Amazigh greeting | English ✓ (was French before language rule fix) | ✅ |
| 2 | `كيف حالك؟` | Arabic greeting/response | Arabic ✓ | ✅ |
| 3 | `Tell me about Nubian culture` | Detailed Nubian info | Detailed ✓ (5K yrs, Nobiin, traditions) | ✅ |
| 4 | `Translate Azul to French` | "Azul signifie Bonjour en tamazight." | Exact match ✓ | ✅ |
| 5 | `Takki` + `Yes, tell me about their crafts` | Follows conversation context | Gold embroidery + felucca building ✓ | ✅ |
| 6 | `ما هي المنتجات المتوفرة في السوق؟` | Arabic marketplace info | Local fallback ✗ (hit rate limit) | ⚠️ |
| 7 | `Hello / Tell me about Sámi` | Multi-turn conversation | Sámi culture detail ✓ | ✅ |
| 8 | `تحذير! هناك حريق في متحف التراث النوبي` (alert mode) | Arabic alert response | Arabic ✓ (fire response) | ✅ |

**6/8 pass.** Test 6 failed due to Groq free-tier rate limiting after rapid-fire requests.

## 6. Fallback Behavior

When Groq rate-limits (HTTP 429 or TPM exceeded), the chain falls through: Groq → Local → `getFallbackResponse()` → `generateLocally()`. The `getFallbackResponse` has 15 curated entries covering Azul, Takki, Merheba, Buorre beaivi, Nubian, Amazigh, Kurdish, Sámi, Mayan, Andean, Akan, Ottoman, endangered languages, stories, and a catch-all. If no match, `generateLocally` produces a boilerplate paragraph.

**Weakness:** The local generator always returns Arabic boilerplate for Arabic input (detected via Arabic script regex), which reads as: "Regarding X, available data indicates this topic has multiple dimensions..." — not very helpful.

## 7. Conversation History

The route builds messages as: `[system prompt, ...userMessages]`. Each user message from the frontend (including prior assistant responses) is preserved in order. The system prompt is injected server-side, ensuring every LLM call has full context regardless of which provider handles it.

Tested with 2-turn follow-up ("Takki" → "Yes, tell me about their crafts") and 3-turn sequence ("Hello" → assistant reply → "Tell me about Sámi") — both maintained context correctly.

## 8. Key Changes Made

| File | Change |
|------|--------|
| `app/api/ai/chat/route.ts` | Added full HeritageVerse system prompt (8 cultures, response rules, language detection); added JSON logging |
| `lib/ai/llm.ts` | Added logging; restructured to pass system prompt through to providers |
| `lib/ai/ai-provider-manager.ts` | Added detailed logging at every hop (entry, each provider attempt, success/failure, fallback) |
| `components/Chat/ChatUI.tsx` | Added frontend logging |
| `.env.development` | Fixed empty `GROQ_API_KEY` override |

## 9. Recommended Next Steps

1. **Upgrade Groq to Dev Tier** ($5/mo) — raises TPM from 6,000 to 200,000, eliminates rate-limit fallbacks
2. **Add OpenAI key** — enables primary provider with Groq as backup
3. **Improve local fallback for Arabic** — replace boilerplate with curated Arabic responses matching the 15 English entries
4. **Reduce system prompt size** — ~1,350 tokens is large; consider condensing to essential knowledge and using retrieval-augmented generation (RAG) for detailed culture data
5. **Add conversation expiry** — current implementation sends entire history every time; consider truncating after ~10 turns to stay within token limits
