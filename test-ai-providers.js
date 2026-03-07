// Test script to verify AI provider connections
import Anthropic from '@anthropic-ai/sdk';
import 'dotenv/config';

async function testAnthropicProvider(name, apiKey, baseURL, model) {
    console.log(`\n=== Testing ${name} (Anthropic SDK) ===`);
    console.log(`Base URL: ${baseURL || 'default'}`);
    console.log(`Model: ${model}`);

    if (!apiKey) {
        console.log(`❌ No API key configured for ${name}`);
        return false;
    }
    console.log(`API Key: ${apiKey.substring(0, 20)}...`);

    const opts = { apiKey };
    if (baseURL) opts.baseURL = baseURL;

    const anthropic = new Anthropic(opts);

    try {
        console.log('Sending test request...');
        const response = await anthropic.messages.create({
            model: model,
            max_tokens: 100,
            messages: [{ role: 'user', content: 'Say "Hello" in one word.' }],
        });

        console.log(`✅ ${name} connection successful!`);
        console.log(`Response: ${response.content[0].type === 'text' ? response.content[0].text : 'non-text response'}`);
        return true;
    } catch (error) {
        console.log(`❌ ${name} connection failed:`);
        console.log(`   Error: ${error.message}`);
        if (error.status) console.log(`   Status: ${error.status}`);
        return false;
    }
}

async function testOpenAICompatible(name, apiKey, baseURL, model) {
    console.log(`\n=== Testing ${name} (OpenAI-compatible) ===`);
    console.log(`Base URL: ${baseURL}`);
    console.log(`Model: ${model}`);

    if (!apiKey) {
        console.log(`❌ No API key configured for ${name}`);
        return false;
    }
    console.log(`API Key: ${apiKey.substring(0, 20)}...`);

    try {
        console.log('Sending test request...');
        const response = await fetch(`${baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: model,
                max_tokens: 100,
                messages: [{ role: 'user', content: 'Say "Hello" in one word.' }],
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.log(`❌ ${name} connection failed:`);
            console.log(`   Status: ${response.status}`);
            console.log(`   Error: ${JSON.stringify(data)}`);
            return false;
        }

        console.log(`✅ ${name} connection successful!`);
        console.log(`Response: ${data.choices?.[0]?.message?.content || JSON.stringify(data)}`);
        return true;
    } catch (error) {
        console.log(`❌ ${name} connection failed:`);
        console.log(`   Error: ${error.message}`);
        return false;
    }
}

async function main() {
    console.log('Testing AI Provider Connections...\n');

    const zaiApiKey = process.env.ZAI_API_KEY;

    // Test z.ai with correct endpoint from docs
    const zaiEndpoints = [
        { name: 'z.ai (glm-5)', baseURL: 'https://api.z.ai/api/paas/v4', model: 'glm-5' },
        { name: 'z.ai (glm-4-plus)', baseURL: 'https://api.z.ai/api/paas/v4', model: 'glm-4-plus' },
        { name: 'z.ai (glm-4-flash)', baseURL: 'https://api.z.ai/api/paas/v4', model: 'glm-4-flash' },
    ];

    for (const endpoint of zaiEndpoints) {
        await testOpenAICompatible(endpoint.name, zaiApiKey, endpoint.baseURL, endpoint.model);
    }

    // Skip old z.ai tests
    const openAIEndpoints = [];

    for (const endpoint of openAIEndpoints) {
        await testOpenAICompatible(endpoint.name, zaiApiKey, endpoint.baseURL, endpoint.model);
    }

    // Test z.ai with Anthropic SDK
    const anthropicEndpoints = [
        { name: 'z.ai Anthropic (v1)', baseURL: 'https://api.z.ai/v1', model: 'claude-sonnet-4-20250514' },
    ];

    for (const endpoint of anthropicEndpoints) {
        await testAnthropicProvider(endpoint.name, zaiApiKey, endpoint.baseURL, endpoint.model);
    }

    // Test Kimi
    await testAnthropicProvider(
        'Kimi (k2p5)',
        process.env.KIMI_API_KEY,
        'https://api.kimi.com/coding',
        'k2p5'
    );

    // Test Anthropic
    await testAnthropicProvider(
        'Anthropic Claude',
        process.env.ANTHROPIC_API_KEY,
        null,
        'claude-sonnet-4-20250514'
    );

    console.log('\n=== Test Complete ===');
}

main().catch(console.error);
