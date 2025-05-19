import { tool } from 'ai';
import { z } from 'zod';
import { env } from '../../env';

/**
 * Web search tool that uses Tavily API to search the web for current information
 */
export const webSearch = tool({  description: 'Search the web for current information when the AI needs real-time data or facts it may not know',
  parameters: z.object({
    query: z.string().describe('The search query to find information on the web'),
    search_depth: z.enum(['basic', 'advanced']).optional().default('basic')
      .describe('Use "basic" for simple searches and "advanced" for more in-depth research'),
  }),
  execute: async ({ query, search_depth }) => {
    try {
      console.log(`Starting web search for: ${query}`);
      
      // First, perform a web search
      const searchResponse = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.TAVILY_API_KEY}`
        },
        body: JSON.stringify({
          query,
          search_depth,
          include_answer: false,
          include_raw_content: true,
          max_results: 5
        })
      });

      if (!searchResponse.ok) {
        throw new Error(`Web search failed with status: ${searchResponse.status}`);
      }      const searchData = await searchResponse.json();
      
      // Get top result URLs for content extraction
      const topUrls = searchData.results.slice(0, 2).map((result: { url: string }) => result.url);
        // Extract detailed content from top results if available
      let extractedContents = [];
      if (topUrls.length > 0) {
        try {
          const extractResponse = await fetch('https://api.tavily.com/extract', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${env.TAVILY_API_KEY}`
            },
            body: JSON.stringify({
              urls: topUrls,
              include_images: false,
              extract_depth: search_depth
            })
          });
          
          if (extractResponse.ok) {
            const extractData = await extractResponse.json();
            extractedContents = extractData.results || [];
          }
        } catch (extractError) {
          console.error('Content extraction error:', extractError);
          // Continue without extracted content
        }
      }
        // Format the results in a structured way
      const formattedResults = {
        query,
        timestamp: new Date().toISOString(),
        search_results: searchData.results.map((result: { 
          title: string; 
          url: string; 
          snippet: string; 
          published_date: string; 
        }) => ({
          title: result.title,
          url: result.url,
          snippet: result.snippet,
          published_date: result.published_date
        })),
        extracted_contents: extractedContents
      };
      
      return formattedResults;
    } catch (error) {
      console.error('Web search tool error:', error);
      return { 
        error: 'Failed to search the web',
        message: typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : String(error)
      };
    }
  },
});
