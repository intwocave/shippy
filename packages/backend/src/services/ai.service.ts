import axios/*, { AxiosError } */ from 'axios';
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
    const response: {
      data: {
        choices: Array<{
          message: {
            content: string;
          };
        }>;
      };
    } = await axios.post(
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

    const content = response.data?.choices?.[0]?.message?.content;

    if (content) {
      console.log('LLM Response Content:', content);

      logger.info('Received response from LLM.');
      return content;
    }

    throw new Error('Invalid response structure from LLM API.');
  } catch (error) {
    /* if (error instanceof AxiosError) {
      logger.error('Axios error calling LLM API:', {
        message: error.message,
        url: error.config?.url,
        response: error.response?.data,
      });
    } else {
      logger.error('Unknown error calling LLM API:', error);
    } */
    throw new Error('Failed to get response from LLM.');
  }
};


// [추가] 자기소개에서 기술 스택 및 숙련도 추출
export const extractSkillsFromBio = async (bio: string): Promise<string> => {
  const prompt = `다음 자기소개 텍스트에서 사용자가 언급한 기술 스택과 숙련도(1.0~5.0 사이의 float 값)를 추출하여 JSON 문자열 형태로만 반환해줘. 기술 스택은 소문자로 변환하고, 숙련도는 해당 기술에 대한 자신감이나 경험을 바탕으로 추정해줘. 결과는 반드시 JSON 객체 형태여야 해. 마크다운 없이 작성해 줘.

예시 1: "저는 Python을 5년 동안 사용하여 데이터 분석과 AI 모델링을 주로 했습니다. React는 입문 단계입니다."
결과: {"python": 5.0, "data_analysis": 4.5, "ai_modeling": 4.5, "react": 2.0}

예시 2: "Node.js와 TypeScript로 백엔드 API를 개발하며 3년의 경력이 있습니다."
결과: {"nodejs": 4.0, "typescript": 4.0, "backend_api": 4.0}

---
자기소개: "${bio}"
결과:
`;
  const rawResponse = await generateText(prompt);

  // --- 강력한 JSON 추출 로직 ---
  // 1. 문자열 내에서 첫 번째 '{'와 마지막 '}'의 인덱스를 찾습니다.
  const start = rawResponse.indexOf('{');
  const end = rawResponse.lastIndexOf('}');

  if (start !== -1 && end !== -1 && start < end) {
    // 중괄호로 감싸진 순수 JSON 문자열만 추출하고, trim()으로 앞뒤 공백을 확실하게 제거합니다.
    return rawResponse.substring(start, end + 1).trim();
  }
  
  // 2. 1단계 추출이 실패한 경우 (JSON 형식이 심하게 깨진 경우)
  // 최대한 마크다운 기호를 제거해봅니다.
  let cleanedResponse = rawResponse.replace(/^\s*```(json)?\s*/i, ''); 
  cleanedResponse = cleanedResponse.replace(/\s*```\s*$/, ''); 

  // 추출 실패 시 빈 객체를 반환하지 않고 오류를 발생시켜 상위 로직에서 오류를 처리하게 할 수 있지만,
  // 여기서는 최대한 클리닝을 시도한 결과를 반환합니다.
  // 이 결과도 유효한 JSON이 아닐 경우, 호출하는 곳(`user.service.ts`의 `JSON.parse`)에서 최종 오류가 발생합니다.
  return cleanedResponse.trim();
}