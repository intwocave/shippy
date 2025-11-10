// packages/backend/src/services/ai.service.ts (전체 코드)

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


// [추가] 자기소개에서 기술 스택 및 숙련도 추출
export const extractSkillsFromBio = async (bio: string): Promise<string> => {
  const prompt = `다음 자기소개 텍스트에서 사용자가 언급한 기술 스택과 숙련도(1.0~5.0 사이의 float 값)를 추출하여 JSON 문자열 형태로만 반환해줘. 기술 스택은 소문자로 변환하고, 숙련도는 해당 기술에 대한 자신감이나 경험을 바탕으로 추정해줘. 결과는 반드시 JSON 객체 형태여야 해.

예시 1: "저는 Python을 5년 동안 사용하여 데이터 분석과 AI 모델링을 주로 했습니다. React는 입문 단계입니다."
결과: {"python": 5.0, "data_analysis": 4.5, "ai_modeling": 4.5, "react": 2.0}

예시 2: "Node.js와 TypeScript로 백엔드 API를 개발하며 3년의 경력이 있습니다."
결과: {"nodejs": 4.0, "typescript": 4.0, "backend_api": 4.0}

---
자기소개: "${bio}"
결과:
`;
  return generateText(prompt);
}