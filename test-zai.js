import 'dotenv/config';

const zaiApiKey = process.env.ZAI_API_KEY;
const baseURL = 'https://api.z.ai/api/coding/paas/v4';
const model = 'glm-5';

console.log('Testing Z.AI Coding Plan...');
console.log(`Endpoint: ${baseURL}`);
console.log(`Model: ${model}`);
console.log('');

const response = await fetch(`${baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${zaiApiKey}`,
    },
    body: JSON.stringify({
        model: model,
        max_tokens: 500,
        messages: [{ role: 'user', content: 'Say "Hello" in one word.' }],
    }),
});

const data = await response.json();

if (!response.ok) {
    console.log(`❌ Error ${response.status}:`, JSON.stringify(data, null, 2));
} else {
    console.log(`✅ Success!`);
    const msg = data.choices?.[0]?.message;
    if (msg?.reasoning_content) {
        console.log(`Reasoning:`, msg.reasoning_content.substring(0, 200) + '...');
    }
    if (msg?.content) {
        console.log(`Response:`, msg.content);
    }
    console.log(`\nUsage:`, data.usage);
}
