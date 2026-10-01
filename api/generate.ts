/**
 * Vercel Edge function that proxies a "generate scenes" request to DeepSeek.
 * The key can come from the request body (user-pasted) or the Vercel env var
 * DEEPSEEK_API_KEY. Kept out of `tsconfig` include — Vercel bundles it itself.
 */
export const config = { runtime: 'edge' }

const SYSTEM_PROMPT = `你是一位影视编剧。根据用户给的故事梗概，输出一个分场脚本结构。
严格只输出一个 JSON 数组，不要任何解释或 markdown 代码块。每个元素是一个场，字段如下：
{
  "slug": "场景名，如 演播室",
  "setting": "具体地点",
  "time": "日|夜|晨|黄昏",
  "interior": "内景|外景",
  "summary": "本场情节梗概，一到两句话",
  "duration": 本场预计时长（秒，数字）,
  "beat": "起|承|转|合",
  "shots": [
    { "size": "远|全|中|近|特", "move": "固定|推|拉|摇|移|跟|升降", "subject": "画面内容", "line": "台词或旁白", "audio": "音效或音乐" }
  ]
}
要求：4 到 6 场，覆盖起承转合四种节拍，总时长接近目标时长。`

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}

function stripFences(text: string): string {
  const t = text.trim()
  const fence = t.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)
  return fence ? fence[1] : t
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ error: 'POST only' }, 405)
  }
  let body: Record<string, unknown> | null = null
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return json({ error: 'invalid JSON body' }, 400)
  }

  const apiKey =
    typeof body.apiKey === 'string' && body.apiKey ? body.apiKey : process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    return json({ error: 'no API key' }, 401)
  }

  const logline = typeof body.logline === 'string' ? body.logline : ''
  const genre = typeof body.genre === 'string' ? body.genre : '剧情短片'
  const title = typeof body.title === 'string' ? body.title : '未命名作品'
  const targetDuration =
    typeof body.targetDuration === 'number' ? Math.round(body.targetDuration) : 300

  const userPrompt = `作品标题：${title}\n类型：${genre}\n目标总时长：约 ${targetDuration} 秒\n故事梗概：${logline || '（无）'}\n\n请输出分场脚本结构。`

  const upstream = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    }),
  })

  if (!upstream.ok) {
    const err = await upstream.text().catch(() => '')
    return json({ error: `upstream ${upstream.status}`, detail: err }, 502)
  }

  const data = (await upstream.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  const content = data.choices?.[0]?.message?.content ?? ''
  try {
    const scenes = JSON.parse(stripFences(content))
    return json({ scenes })
  } catch {
    return json({ error: 'model returned invalid JSON', content }, 502)
  }
}
