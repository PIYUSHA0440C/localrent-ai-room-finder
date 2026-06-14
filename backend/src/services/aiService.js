import config from '../config/env.js';
import { LISTING_TYPES, GENDER_PREFERENCES, AMENITIES_LIST } from '../config/constants.js';

class AiService {
  constructor() {
    this.apiKey = config.ai.apiKey;
    this.apiUrl = config.ai.apiUrl;
    this.isAvailable = !!(this.apiKey && this.apiUrl);

    if (!this.isAvailable) {
      console.warn('AI API credentials not found. AI features will be disabled.');
    }
  }

  // Call AI API
  async callAI(prompt) {
    if (!this.isAvailable) {
      const error = new Error('AI service is not configured');
      error.statusCode = 503;
      throw error;
    }

    try {
      const response = await fetch(`${this.apiUrl}${config.ai.model}:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`AI API responded with status ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error('No response from AI');
      }

      return text;
    } catch (error) {
      console.error('AI API error:', error.message);
      throw new Error('AI service temporarily unavailable. Please try again.');
    }
  }

  // Smart search: convert natural language to search filters
  async smartSearch(userQuery) {
    const prompt = `You are a search filter parser for a room rental platform in India.

Convert this natural language search query into JSON search filters.

Available filters:
- city: string (Indian city name, lowercase)
- area: string (locality/area name)
- landmark: string (nearby landmark, college, office, metro station)
- type: one of ${JSON.stringify(LISTING_TYPES)}
- minRent: number (in INR)
- maxRent: number (in INR)
- gender: one of ${JSON.stringify(GENDER_PREFERENCES)}
- amenities: array from ${JSON.stringify(AMENITIES_LIST)}
- furnishing: "furnished" | "semi_furnished" | "unfurnished"
- mealsIncluded: boolean

User query: "${userQuery}"

Respond with ONLY valid JSON, no markdown, no explanation. Example:
{"city":"bangalore","type":"pg_room","maxRent":8000,"gender":"girls","amenities":["wifi","meals"]}

If you can't determine a filter value, omit it. Always lowercase city/area names.`;

    const response = await this.callAI(prompt);

    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');
      return JSON.parse(jsonMatch[0]);
    } catch {
      const error = new Error('Could not parse search query. Please try rephrasing.');
      error.statusCode = 400;
      throw error;
    }
  }

  // Generate listing description
  async generateDescription(listingData) {
    const { title, type, rent, city, area, amenities, furnishing, genderPreference, mealsIncluded } = listingData;

    const prompt = `Write a compelling, honest listing description for a room rental in India.

Details:
- Title: ${title}
- Type: ${type.replace('_', ' ')}
- Monthly Rent: ₹${rent}
- Location: ${area}, ${city}
- Furnishing: ${furnishing?.replace('_', ' ') || 'semi furnished'}
- Gender: ${genderPreference || 'any'}
- Amenities: ${amenities?.join(', ') || 'basic'}
- Meals: ${mealsIncluded ? 'included' : 'not included'}

Write 3-4 paragraphs (150-250 words total). Be specific, warm, and helpful.
Mention the location benefits, what's included, and ideal tenant.
Don't use superlatives like "best" or "amazing". Keep it honest and relatable.
Write in a friendly, approachable tone that a student or young professional would connect with.
Do NOT include any markdown formatting. Just plain text paragraphs.`;

    return this.callAI(prompt);
  }

  // Summarize reviews for a listing
  async summarizeReviews(reviews) {
    if (!reviews || reviews.length === 0) {
      return 'No reviews yet.';
    }

    const reviewTexts = reviews
      .slice(0, 20) // Max 20 reviews to summarize
      .map((r) => `Rating: ${r.rating}/5 - "${r.comment}"`)
      .join('\n');

    const prompt = `Summarize these tenant reviews for a room rental listing in India.

Reviews:
${reviewTexts}

Write a concise summary (3-5 sentences) highlighting:
1. Overall sentiment
2. Common positives
3. Common concerns (if any)
4. Who would this place be good for?

Be balanced and honest. Use a helpful, conversational tone.
Do NOT include markdown formatting. Just plain text.`;

    return this.callAI(prompt);
  }
}

export default new AiService();
