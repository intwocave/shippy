import axios from 'axios';
import config from '../config/index.js';
import logger from '../utils/logger.js';

const llmApiUrl = config.llm.apiUrl;
const llmModel = config.llm.model;

/**
 * Generates text using the local LLM.
 * @param prompt The prompt to send to the LLM.
 * @returns The generated text.
 */
export const generateText = async (prompt: string): Promise<string> => {
  if (!llmApiUrl || llmApiUrl.trim() === '' || !llmModel || llmModel.trim() === '') {
    logger.error('LLM API URL or model is not configured.');
    throw new Error('LLM service is not configured.');
  }

  try {
    logger.info(`Sending prompt to LLM: ${prompt.substring(0, 200)}...`);
    const response = await axios.post(
      llmApiUrl,
      {
        model: llmModel,
        messages: [{ role: 'user', content: prompt }],
        stream: false,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.choices && response.data.choices.length > 0) {
      const content = response.data.choices[0].message.content;
      console.log('LLM Response Content:', content);

      logger.info('Received response from LLM.');
      return content;
    }

    throw new Error('Invalid response structure from LLM API.');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error('Axios error calling LLM API:', {
        message: error.message,
        url: error.config?.url,
        response: error.response?.data,
      });
    } else {
      logger.error('Unknown error calling LLM API:', error);
    }
    throw new Error('Failed to get response from LLM.');
  }
};