import { GoogleGenerativeAI, Content, Part, FunctionCallPart } from '@google/generative-ai';
import { config } from '../config/env';
import { SYSTEM_PROMPT } from './systemPrompt';
import { TOOL_DECLARATIONS } from './tools';
import { toolExecutor } from './toolExecutor';
import { ChatMessage, ChatResponse, AppError } from '../types';
import { v4 as uuidv4 } from 'uuid';

const genAI = new GoogleGenerativeAI(config.geminiApiKey);

/**
 * Maximum tool-call iterations to prevent infinite loops.
 */
const MAX_TOOL_ITERATIONS = 5;

/**
 * AI Agent Controller.
 * Orchestrates conversation with Google Gemini API using function-calling.
 *
 * Flow:
 *  1. Configure model with system instruction and tools
 *  2. Convert message history to Gemini format
 *  3. Call Gemini's generateContent
 *  4. If model requests function calls → execute them → feed results back
 *  5. Repeat until model provides a final text response
 *  6. Return response with any tool results for display
 */
export const agent = {
  async chat(
    messages: ChatMessage[],
    lang: string,
    conversationId?: string
  ): Promise<ChatResponse> {
    const id = conversationId || uuidv4();

    // Check if API key is configured
    if (!config.geminiApiKey || config.geminiApiKey === 'your-gemini-api-key-here') {
      throw new AppError(
        'Gemini API key is not configured. Please set GEMINI_API_KEY in your .env file.',
        503,
        'AI_NOT_CONFIGURED'
      );
    }

    // Build language instruction
    const langInstruction = lang === 'ar'
      ? '\n\nIMPORTANT: The patient is writing in Arabic. Respond entirely in Arabic.'
      : '\n\nIMPORTANT: The patient is writing in English. Respond entirely in English.';

    // Create the model with system instruction and tools
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.8-flash',
      systemInstruction: SYSTEM_PROMPT + langInstruction,
      tools: [{ functionDeclarations: TOOL_DECLARATIONS }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1500,
      },
    });

    // Convert messages to Gemini format
    const contents: Content[] = this.convertToGeminiFormat(messages);

    const toolResults: any[] = [];
    let iterations = 0;

    // Agentic loop: keep calling tools until model gives a final response
    while (iterations < MAX_TOOL_ITERATIONS) {
      iterations++;

      try {
        // Retry logic for 503 High Demand errors with model fallback
        let result: any;
        let retryCount = 0;
        const MAX_RETRIES = 3;
        
        let currentModel = model; // Start with default 3.8-flash
        
        while (retryCount <= MAX_RETRIES) {
          try {
            result = await currentModel.generateContent({ contents });
            break;
          } catch (e: any) {
            const isOverloaded = e?.status === 503 || e?.message?.includes('503') 
              || e?.status === 429 || e?.message?.includes('429') 
              || e?.message?.includes('RESOURCE_EXHAUSTED');
              
            if (isOverloaded) {
              retryCount++;
              if (retryCount > MAX_RETRIES) throw e;
              
              // Fallback to a lighter model after the first failure
              if (retryCount === 1) {
                console.warn('⚠️ Switching to fallback model: gemini-3.5-flash-lite due to overload');
                currentModel = genAI.getGenerativeModel({
                  model: 'gemini-3.5-flash-lite',
                  systemInstruction: SYSTEM_PROMPT + langInstruction,
                  tools: [{ functionDeclarations: TOOL_DECLARATIONS }],
                  generationConfig: { temperature: 0.3, maxOutputTokens: 1500 },
                });
              } else {
                console.warn(`⚠️ Gemini API high demand (503). Retrying fallback model in ${retryCount * 2}s...`);
                await new Promise((resolve) => setTimeout(resolve, retryCount * 2000));
              }
            } else {
              throw e;
            }
          }
        }

        const response = result.response;
        const candidate = response.candidates?.[0];

        if (!candidate || !candidate.content) {
          throw new AppError('No response from AI model', 502, 'AI_NO_RESPONSE');
        }

        // Check if model wants to call functions
        const functionCalls = candidate.content.parts.filter(
          (part: any): part is FunctionCallPart => 'functionCall' in part
        );

        if (functionCalls.length > 0) {
          // Add the model's response (with function calls) to the history
          contents.push({
            role: 'model',
            parts: candidate.content.parts,
          });

          // Execute each function call and build function responses
          const functionResponseParts: Part[] = [];

          for (const part of functionCalls) {
            const functionName = part.functionCall.name;
            const functionArgs = part.functionCall.args || {};

            console.log(`🔧 Tool call: ${functionName}(${JSON.stringify(functionArgs)})`);

            const execResult = await toolExecutor.execute(functionName, functionArgs as Record<string, any>);

            // Store for display in frontend
            toolResults.push({
              type: this.getToolResultType(functionName),
              data: execResult,
            });

            // Add function response part
            functionResponseParts.push({
              functionResponse: {
                name: functionName,
                response: execResult,
              },
            });
          }

          // Add all function responses to the history
          contents.push({
            role: 'user',
            parts: functionResponseParts,
          });

          // Continue the loop — model may want to call more tools or give final response
          continue;
        }

        // Model gave a final text response — we're done
        const textContent = candidate.content.parts
          .filter((part: any) => 'text' in part)
          .map((part: any) => (part as { text: string }).text)
          .join('');

        return {
          reply: textContent || 'I apologize, I was unable to generate a response.',
          toolResults: toolResults.length > 0 ? toolResults : undefined,
          conversationId: id,
        };
      } catch (error: any) {
        if (error instanceof AppError) throw error;

        if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
          throw new AppError(
            'AI service is temporarily overloaded. Please try again in a moment.',
            429,
            'AI_RATE_LIMIT'
          );
        }

        console.error('Gemini API error:', error?.message || error);
        throw new AppError(
          'Failed to communicate with AI service. Please try again.',
          502,
          'AI_SERVICE_ERROR'
        );
      }
    }

    // If we exceeded max iterations, return what we have
    return {
      reply: 'I apologize, I encountered a complexity issue processing your request. Could you please rephrase your question?',
      toolResults: toolResults.length > 0 ? toolResults : undefined,
      conversationId: id,
    };
  },

  /**
   * Convert chat messages to Gemini's Content format.
   * Gemini uses 'user' and 'model' roles (no 'assistant').
   */
  convertToGeminiFormat(messages: ChatMessage[]): Content[] {
    return messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
  },

  getToolResultType(functionName: string): string {
    switch (functionName) {
      case 'searchDoctors': return 'doctors';
      case 'searchHospitals': return 'hospitals';
      case 'triageAssessment': return 'triage';
      case 'getSpecialtyInfo': return 'specialty';
      default: return 'unknown';
    }
  },
};
