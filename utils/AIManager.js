const { GoogleGenAI, Modality } = require('@google/genai');
const GeminiApiKey = require('../models/ai/GeminiApiKey');
const axios = require('axios');
class AIManager {
    constructor() {
        this.currentKeyIndex = 0;
        this.rateLimits = new Map();
        this.keyCache = new Map();
        this.lastCacheUpdate = 0;
        this.cacheTimeout = 60000; 

        //console.log('\x1b[36m[ AI MANAGER ]\x1b[0m \x1b[32mInitialized with MongoDB key management ✅\x1b[0m');

        setInterval(() => this.updateKeyCache(), this.cacheTimeout);
        this.updateKeyCache(); 
    }

    async updateKeyCache() {
        try {
            const keys = await GeminiApiKey.find({
                isActive: true,
                $or: [
                    { isBlocked: false },
                    { blockedUntil: { $lt: new Date() } }
                ]
            }).sort({ avgResponseTime: 1 }); 

            this.keyCache.clear();

            for (const key of keys) {
            
                if (key.isBlocked && key.blockedUntil && key.blockedUntil < new Date()) {
                    key.isBlocked = false;
                    key.blockedUntil = null;
                    key.blockedReason = null;
                    await key.save();
                }

                if (!key.isBlocked) {
                    this.keyCache.set(key.keyId, {
                        keyId: key.keyId,
                        apiKey: key.apiKey,
                        name: key.name,
                        avgResponseTime: key.avgResponseTime,
                        genAI: new GoogleGenAI({ apiKey: key.apiKey }),
                        dbRef: key
                    });
                }
            }

            this.lastCacheUpdate = Date.now();
            //console.log(`\x1b[36m[ AI MANAGER ]\x1b[0m Updated cache with ${this.keyCache.size} active keys`);

        } catch (error) {
            console.error('\x1b[31m[ AI MANAGER ]\x1b[0m Cache update failed:', error.message);
        }
    }

    async getHealthyKey() {
     
        if (Date.now() - this.lastCacheUpdate > this.cacheTimeout) {
            await this.updateKeyCache();
        }

        if (this.keyCache.size === 0) {
            throw new Error('No active Gemini API keys available');
        }


        const availableKeys = Array.from(this.keyCache.values()).filter(key =>
            !this.isRateLimited(key.keyId)
        );

        if (availableKeys.length === 0) {
            throw new Error('All API keys are rate limited');
        }

        const selectedKey = availableKeys[this.currentKeyIndex % availableKeys.length];
        this.currentKeyIndex++;

        return selectedKey;
    }

    isRateLimited(keyId) {
        const rateLimit = this.rateLimits.get(keyId);
        if (!rateLimit) return false;

        const now = Date.now();
    
        rateLimit.requests = rateLimit.requests.filter(time => now - time < 60000);

   
        return rateLimit.requests.length >= 50;
    }

    trackRateLimit(keyId) {
        if (!this.rateLimits.has(keyId)) {
            this.rateLimits.set(keyId, { requests: [] });
        }

        this.rateLimits.get(keyId).requests.push(Date.now());
    }

    async updateKeyStats(keyId, success, responseTime, error = null) {
        try {
            const key = await GeminiApiKey.findOne({ keyId });
            if (!key) return;

            key.totalRequests++;
            key.lastUsedAt = new Date();

            if (success) {
                key.successfulRequests++;
                key.avgResponseTime = Math.round((key.avgResponseTime + responseTime) / 2);
            } else {
                key.failedRequests++;
                key.lastErrorAt = new Date();
                key.lastErrorMessage = error;

            
                if (key.failedRequests > 10 &&
                    (key.failedRequests / key.totalRequests) > 0.5) {
                    key.isBlocked = true;
                    key.blockedUntil = new Date(Date.now() + 15 * 60 * 1000);
                    key.blockedReason = 'Auto-blocked due to high error rate';

                    console.log(`\x1b[33m[ AI MANAGER ]\x1b[0m Auto-blocked key ${key.name} due to errors`);
                }
            }

            await key.save();

        } catch (dbError) {
            console.error('Failed to update key stats:', dbError.message);
        }
    }

   
    async generateContent(prompt, options = {}) {
        const maxRetries = Math.min(this.keyCache.size, 3);
        let lastError;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const selectedKey = await this.getHealthyKey();
                this.trackRateLimit(selectedKey.keyId);

                const startTime = Date.now();

                const result = await Promise.race([
                    selectedKey.genAI.models.generateContent({
                        model: options.model || "gemini-2.5-flash",
                        contents: prompt
                    }),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Timeout')), options.timeout || 30000)
                    )
                ]);

                const responseTime = Date.now() - startTime;

            
                await this.updateKeyStats(selectedKey.keyId, true, responseTime);

                console.log(`\x1b[36m[ AI MANAGER ]\x1b[0m Used ${selectedKey.name} (${responseTime}ms)`);

            
                return {
                    text: () => result.candidates[0].content.parts[0].text
                };

            } catch (error) {
                lastError = error;
                const keyId = this.keyCache.size > 0 ? Array.from(this.keyCache.keys())[0] : 'unknown';

                console.error(`\x1b[31m[ AI MANAGER ]\x1b[0m Error with key:`, error.message);

           
                await this.updateKeyStats(keyId, false, 0, error.message);

         
                if (error.message.includes('quota') || error.message.includes('limit')) {
                
                    continue;
                } else if (error.message.includes('safety') || error.message.includes('blocked')) {
                    throw new AIContentBlockedError('Content blocked by AI safety filters');
                }

                continue;
            }
        }

        throw new Error(`All AI attempts failed. Last error: ${lastError?.message}`);
    }
async analyzeImage(imageUrl, focus = 'general') {
    const focusPrompts = {
        general: "Look at this image and describe what you see in detail.",
        objects: "Look at this image and identify all objects, people, and things you can see.",
        ocr: "Look at this image and extract any text you can see. If no text, describe the image.",
        emotions: "Look at this image and describe the emotions, mood, and feelings it conveys.",
        artistic: "Look at this image and analyze the colors, style, composition, and artistic elements."
    };

    try {
        const selectedKey = await this.getHealthyKey();
        this.trackRateLimit(selectedKey.keyId);
        
        const startTime = Date.now();
        
    
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(imageResponse.data);
        const base64Image = imageBuffer.toString('base64');
        const mimeType = imageResponse.headers['content-type'] || 'image/jpeg';

        const result = await selectedKey.genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    role: "user", 
                    parts: [
                        { text: focusPrompts[focus] },
                        {
                            inlineData: {
                                mimeType: mimeType,
                                data: base64Image
                            }
                        }
                    ]
                }
            ]
        });
        
        const responseTime = Date.now() - startTime;
        const analysisText = result.candidates[0].content.parts[0].text;
        
        await this.updateKeyStats(selectedKey.keyId, true, responseTime);
        console.log(`\x1b[36m[ AI MANAGER ]\x1b[0m Analyzed image (${responseTime}ms)`);
        
        return {
            analysis: analysisText,
            focus: focus
        };
        
    } catch (error) {
        console.error('Image analysis error:', error);
        throw error;
    }
}

    async generateStory(prompt, genre = 'adventure', length = 'medium') {
        const genreStyles = {
            horror: "Write a spine-chilling horror story with suspense and dark atmosphere. Include eerie details and psychological tension.",
            romantic: "Write a heartwarming romance story with emotional depth, character development, and a satisfying romantic arc.",
            adventure: "Write an exciting adventure story with action, exploration, and thrilling challenges.",
            anime: "Write a story in anime/manga style with dramatic moments, unique characters, and engaging plot twists.",
            kids: "Write a fun, family-friendly story appropriate for children with positive messages and colorful characters.",
            scifi: "Write a science fiction story with futuristic technology, space exploration, or advanced scientific concepts.",
            fantasy: "Write a fantasy story with magic, mythical creatures, and an imaginative world.",
            mystery: "Write a mystery story with clues, investigation, and a puzzling plot that keeps readers guessing."
        };

        const lengthGuides = {
            short: "Keep it brief, around 2-3 paragraphs.",
            medium: "Write a moderate length story, around 4-6 paragraphs.",
            long: "Write a detailed, full story with multiple scenes and character development."
        };

        const storyPrompt = `${genreStyles[genre]} 

Theme/Prompt: ${prompt}

${lengthGuides[length]}

Make it engaging, creative, and well-written with good pacing and interesting characters.`;

        try {
            const response = await this.generateContent(storyPrompt, { timeout: 45000 });

            return {
                story: response.text(),
                genre: genre,
                length: length
            };
        } catch (error) {
            console.error('Story generation error:', error);
            throw error;
        }
    }


    async summarizeText(text, style = 'brief') {
        const stylePrompts = {
            brief: "Provide a brief, concise summary of the main points:",
            points: "Extract and list the key points as bullet points:",
            detailed: "Provide a comprehensive analysis and detailed summary:",
            eli5: "Explain this in simple terms that a 5-year-old could understand:"
        };

        const prompt = `${stylePrompts[style]}

${text}`;

        try {
            const response = await this.generateContent(prompt, { timeout: 30000 });

            return {
                summary: response.text(),
                style: style,
                originalLength: text.length
            };
        } catch (error) {
            console.error('Summarization error:', error);
            throw error;
        }
    }


    async helpWithCode(request, language = 'general') {
        const languageContext = language !== 'general'
            ? `Focus on ${language} programming language. `
            : '';

        const prompt = `${languageContext}Help with this coding request: ${request}

Please provide:
1. Clear explanation
2. Code examples if applicable
3. Best practices
4. Any important notes or warnings

Be practical and helpful.`;

        try {
            const response = await this.generateContent(prompt, { timeout: 30000 });

            return {
                response: response.text(),
                language: language,
                request: request
            };
        } catch (error) {
            console.error('Code help error:', error);
            throw error;
        }
    }

  
    async generateImage(prompt, options = {}) {
        const maxRetries = Math.min(this.keyCache.size, 3);
        let lastError;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const selectedKey = await this.getHealthyKey();
                this.trackRateLimit(selectedKey.keyId);

                const startTime = Date.now();

                const response = await Promise.race([
                    selectedKey.genAI.models.generateContent({
                        model: "gemini-2.5-flash-image",
                        contents: prompt,
                        config: {
                            responseModalities: [Modality.TEXT, Modality.IMAGE],
                        }
                    }),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Timeout')), options.timeout || 45000)
                    )
                ]);

                const responseTime = Date.now() - startTime;

      
                let imageBuffer = null;
                let textResponse = "";

                for (const part of response.candidates[0].content.parts) {
                    if (part.text) {
                        textResponse += part.text;
                    } else if (part.inlineData) {
                        const imageData = part.inlineData.data;
                        imageBuffer = Buffer.from(imageData, "base64");
                    }
                }

        
                await this.updateKeyStats(selectedKey.keyId, true, responseTime);

                console.log(`\x1b[36m[ AI MANAGER ]\x1b[0m Generated image with ${selectedKey.name} (${responseTime}ms)`);

                return {
                    imageBuffer,
                    textResponse: textResponse.trim(),
                    success: true
                };

            } catch (error) {
                lastError = error;
                const keyId = this.keyCache.size > 0 ? Array.from(this.keyCache.keys())[0] : 'unknown';

                console.error(`\x1b[31m[ AI MANAGER ]\x1b[0m Image generation error:`, error.message);

          
                await this.updateKeyStats(keyId, false, 0, error.message);

           
                if (error.message.includes('quota') || error.message.includes('limit')) {
                    continue;
                } else if (error.message.includes('safety') || error.message.includes('blocked')) {
                    throw new AIContentBlockedError('Image prompt blocked by AI safety filters');
                }

                continue;
            }
        }

        throw new Error(`All image generation attempts failed. Last error: ${lastError?.message}`);
    }

    async analyzeSpam(message, context = {}) {
        const prompt = this.buildSpamPrompt(message, context);

        try {
            const response = await this.generateContent(prompt, { timeout: 15000 });
            const result = this.parseAIResponse(response.text());

            return {
                isSpam: result.isSpam || false,
                confidence: Math.max(0, Math.min(1, result.confidence || 0)),
                severity: result.severity || 'low',
                reasoning: result.reasoning || 'AI analysis completed',
                categories: result.categories || [],
                success: true
            };

        } catch (error) {
            console.error('Spam analysis failed:', error.message);

            if (error instanceof AIContentBlockedError) {
                return {
                    isSpam: true,
                    confidence: 0.9,
                    severity: 'high',
                    reasoning: 'Content flagged by AI safety filters',
                    categories: ['inappropriate_content'],
                    success: true
                };
            }

            return {
                isSpam: false,
                confidence: 0,
                severity: 'low',
                reasoning: 'AI analysis unavailable',
                categories: [],
                success: false
            };
        }
    }

    async analyzeLink(url, context = {}) {
        const prompt = this.buildLinkPrompt(url, context);

        try {
            const response = await this.generateContent(prompt, { timeout: 10000 });
            const result = this.parseAIResponse(response.text());

            return {
                isMalicious: result.isMalicious || false,
                confidence: Math.max(0, Math.min(1, result.confidence || 0)),
                riskLevel: result.riskLevel || 'low',
                reasoning: result.reasoning || 'Link analysis completed',
                categories: result.categories || [],
                success: true
            };

        } catch (error) {
            console.error('Link analysis failed:', error.message);

            return {
                isMalicious: false,
                confidence: 0,
                riskLevel: 'unknown',
                reasoning: 'AI analysis unavailable',
                categories: [],
                success: false
            };
        }
    }

    buildSpamPrompt(message, context) {
        return `
Analyze this Discord message for spam/malicious content:

Message: "${message.content}"
Author: ${message.author?.tag || 'Unknown'}
Channel: ${message.channel?.name || 'Unknown'}
Server: ${context.guildName || 'Unknown'}
Previous violations: ${context.existingViolations || 'None'}
User join date: ${context.memberJoinDate || 'Unknown'}
Account age: ${context.accountAge || 'Unknown'}

Consider these factors:
- Spam patterns (repetition, excessive caps, etc.)
- Malicious intent (phishing, scams, harmful links)
- Harassment or toxicity
- Promotional spam
- Context appropriateness
- User behavior history

Respond ONLY in valid JSON format:
{
    "isSpam": boolean,
    "confidence": number (0-1),
    "severity": "low|medium|high|critical",
    "reasoning": "brief explanation under 100 chars",
    "categories": ["array", "of", "violation", "types"]
}`;
    }

    buildLinkPrompt(url, context) {
        return `
Analyze this URL for potential threats:

URL: ${url}
Context: Posted in Discord server "${context.guildName || 'Unknown'}"
User: ${context.authorTag || 'Unknown'}
Channel: ${context.channelName || 'Unknown'}

Check for:
- Phishing attempts
- Malware/virus distribution
- Scam websites
- URL shorteners hiding malicious content
- Suspicious domain patterns
- IP-based links
- Known malicious domains

Respond ONLY in valid JSON format:
{
    "isMalicious": boolean,
    "confidence": number (0-1),
    "riskLevel": "low|medium|high|critical",
    "reasoning": "brief explanation under 100 chars",
    "categories": ["array", "of", "threat", "types"]
}`;
    }

    parseAIResponse(text) {
        try {
            let cleanText = text.replace(/```/g, '').trim();

      
            const jsonMatch = cleanText.match(/{[\s\S]*}/);
            if (jsonMatch) {
                cleanText = jsonMatch;
            }

            const parsed = JSON.parse(cleanText);

            if (typeof parsed === 'object' && parsed !== null) {
                return parsed;
            }

            throw new Error('Invalid response format');

        } catch (error) {
            console.error('Failed to parse AI response:', error.message);

            return {
                isSpam: false,
                isMalicious: false,
                confidence: 0,
                severity: 'low',
                riskLevel: 'low',
                reasoning: 'Failed to parse AI response',
                categories: []
            };
        }
    }


    async getStats() {
        const keys = await GeminiApiKey.find();
        const totalRequests = keys.reduce((sum, key) => sum + key.totalRequests, 0);
        const totalSuccessful = keys.reduce((sum, key) => sum + key.successfulRequests, 0);
        const activeKeys = keys.filter(k => k.isActive && !k.isBlocked).length;

        return {
            totalKeys: keys.length,
            activeKeys,
            cachedKeys: this.keyCache.size,
            totalRequests,
            successRate: totalRequests > 0 ? ((totalSuccessful / totalRequests) * 100).toFixed(1) + '%' : '0%',
            lastCacheUpdate: new Date(this.lastCacheUpdate).toLocaleTimeString()
        };
    }

    cleanup() {
        const now = Date.now();

    
        for (const [keyId, rateLimit] of this.rateLimits.entries()) {
            rateLimit.requests = rateLimit.requests.filter(time => now - time < 60000);
            if (rateLimit.requests.length === 0) {
                this.rateLimits.delete(keyId);
            }
        }
    }
}

class AIContentBlockedError extends Error {
    constructor(message) {
        super(message);
        this.name = 'AIContentBlockedError';
    }
}

const aiManager = new AIManager();

setInterval(() => aiManager.cleanup(), 5 * 60 * 1000);

module.exports = aiManager;
