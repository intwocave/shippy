import dotenv from 'dotenv';
import path from 'path';

// .env 파일의 위치를 명시적으로 지정하여 환경 변수를 로드합니다.
// process.cwd()는 프로젝트의 루트 디렉토리를 가리킵니다.
dotenv.config({ path: path.join(process.cwd(), '.env') });

/**
 * 환경 변수들을 객체로 묶어 내보냅니다.
 * 이를 통해 코드 전체에서 일관되게 환경 변수를 사용할 수 있습니다.
 * .env 파일에 해당 변수가 없으면 || 뒤의 기본값을 사용합니다.
 */
const config = {
  // 서버가 실행될 포트 번호
  port: process.env.PORT || 3000,
  
  // JWT (JSON Web Token) 관련 설정
  jwt: {
    // 토큰을 서명하고 검증할 때 사용할 시크릿 키입니다.
    // !! 프로덕션 환경에서는 반드시 .env 파일에 강력하고 무작위적인 문자열을 설정해야 합니다. !!
    secret: process.env.JWT_SECRET || 'shippy-default-super-secret-key-for-dev',

    // 토큰의 유효 기간 (예: '1d', '7h', '30m')
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
  
  // Prisma가 PostgreSQL 데이터베이스에 연결할 때 사용할 주소
  databaseUrl: process.env.DATABASE_URL,
  llm: {
    apiUrl: process.env.LLM_API_URL || 'http://localhost:11434/v1/chat/completions',
    model: process.env.LLM_MODEL_NAME || 'gemma:2b',
  },
};

export default config;

