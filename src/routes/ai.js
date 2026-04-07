const express = require('express');
const router = express.Router();

router.post('/api/ai/generate', async (req, res) => {
    try {
        const { prompt, apiKey } = req.body;
        
        if (!prompt || !apiKey) {
            return res.status(400).json({ error: "Missing prompt or API key" });
        }

        const systemPrompt = `You are a database schema designer. When given a description of an application, respond ONLY with a valid JSON object in this exact format with no markdown, no explanation, no backticks:
{
  "tables": [
    {
      "name": "table_name",
      "columns": [
        {
          "column_name": "id",
          "data_type": "integer", 
          "is_nullable": "NO"
        }
      ]
    }
  ]
}
Rules:
- Always include an id column (integer, NOT NULL) as the first column
- Always include created_at (timestamp, NULL) as the last column
- Use snake_case for all names
- Foreign keys should be named as related_table_id (integer, NULL)
- Data types must be one of: integer, numeric, character varying, text, boolean, timestamp, date
- Generate between 3 and 8 tables depending on complexity
- Make the schema realistic and production-appropriate`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt }
                ]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ error: data.error?.message || "OpenAI API Error" });
        }

        const content = data.choices[0].message.content.trim();
        const parsed = JSON.parse(content);
        
        return res.json(parsed);

    } catch (err) {
        console.error("AI Schema Error:", err);
        return res.status(500).json({ error: "Failed to generate schema. Please try a simpler description or check your API key." });
    }
});

module.exports = router;
