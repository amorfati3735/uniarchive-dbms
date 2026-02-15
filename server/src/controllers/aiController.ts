import { Request, Response } from 'express';


export const askAI = async (req: Request, res: Response): Promise<void> => {
    const { query } = req.body;

    console.log(`[AI] Received query: "${query?.substring(0, 50)}..."`);

    if (!query) {
        res.status(400).json({ message: 'Query is required' });
        return;
    }

    const apiKey = process.env.NVIDIA_API_KEY;
    const apiEndpoint = process.env.NVIDIA_API_ENDPOINT || 'https://integrate.api.nvidia.com/v1/chat/completions';
    const modelName = process.env.NVIDIA_MODEL || "meta/llama3-70b-instruct";

    // Fallback to OpenAI if NVIDIA is failing (or just better logging)
    // For now, let's stick to the user's config but log everything.

    if (!apiKey) {
        console.error('[AI] Error: NVIDIA_API_KEY is missing in server environment variables.');
        res.status(500).json({
            answer: "Server Error: AI Service not configured (Missing API Key)."
        });
        return;
    }

    console.log(`[AI] Querying: ${apiEndpoint} with model: ${modelName}`);

    try {
        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: modelName,
                messages: [{ role: "user", content: query }],
                temperature: 0.5,
                max_tokens: 1024,
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error(`[AI] NVIDIA API Error (${response.status}):`, errText);
            res.status(502).json({
                answer: `AI Service Error (${response.status}): ${errText.substring(0, 100)}... Check server logs.`
            });
            return;
        }

        const data: any = await response.json();
        const answer = data.choices?.[0]?.message?.content || "No response content from AI.";

        res.json({ answer });

    } catch (error) {
        console.error('[AI] Proxy Internal Error:', error);
        res.status(500).json({ message: 'Failed to process AI query' });
    }
};
