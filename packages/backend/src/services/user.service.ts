import { User, Application, Project, Prisma } from '@prisma/client';
import prisma from '../config/prisma.js';
import * as aiService from './ai.service.js';
import logger from '../utils/logger.js'; // 💡 [추가] logger import

/**
 * ID로 사용자를 조회합니다.
 * @param {number} userId - 사용자 ID
 * @returns {Promise<Omit<User, 'password'> | null>}
 */
export const getUserById = async (userId: number): Promise<Omit<User, 'password'> | null> => {
  const user = await prisma.user.findUnique({ 
    where: { id: userId },
    // 💡 [수정] extractedSkills를 포함한 모든 필요한 필드를 선택합니다.
    select: {
      id: true,
      email: true,
      name: true,
      bio: true,
      personality: true,
      status: true,
      extractedSkills: true, 
      password: true,
    }
  });
  if (!user) {
    return null;
  }
  // password 필드는 이미 select에서 제외되었으므로, 간단하게 타입 캐스팅합니다.
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword as Omit<User, 'password'>;
};

/**
 * 사용자가 지원한 프로젝트 목록을 조회합니다.
 * @param {number} userId - 사용자 ID
 * @returns {Promise<(Application & { project: Project })[]>}
 */
export const getAppliedProjectsByUserId = async (userId: number): Promise<(Application & { project: Project & { owner: Omit<User, 'password'> } })[]> => {
  return prisma.application.findMany({
    where: { userId },
    include: {
      project: { // 지원한 프로젝트 정보 포함
        include: {
          owner: { // 프로젝트 소유자 정보 포함
            select: {
              id: true,
              email: true,
              name: true,
              personality: true,
              status: true,
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc' // 최신 지원 순으로 정렬
    }
  });
};

/**
 * 사용자의 성격 정보를 업데이트합니다.
 * @param {number} userId - 사용자 ID
 * @param {string} personality - 새로운 성격 정보
 * @returns {Promise<Omit<User, 'password'> | null>}
 */
export const updateUserPersonality = async (userId: number, personality: string): Promise<Omit<User, 'password'> | null> => {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { personality },
  });
  const { password, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
};

/**
 * 사용자의 상태 정보를 업데이트합니다.
 * @param {number} userId - 사용자 ID
 * @param {string} status - 새로운 상태 정보
 * @returns {Promise<Omit<User, 'password'> | null>}
 */
export const updateUserStatus = async (userId: number, status: string): Promise<Omit<User, 'password'> | null> => {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { status },
  });
  const { password, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
};

/**
 * 사용자의 자기소개 정보를 업데이트합니다.
 * @param {number} userId - 사용자 ID
 * @param {string} bio - 새로운 자기소개 정보
 * @returns {Promise<Omit<User, 'password'> | null>}
 */
export const updateUserBio = async (userId: number, bio: string): Promise<Omit<User, 'password'> | null> => {
  let extractedSkills: string | null = null;
  
  try {
    if (bio && bio.length > 10) { // 최소한의 길이 조건
      extractedSkills = await aiService.extractSkillsFromBio(bio);
    }
  } catch (error) {
    logger.error('Failed to extract skills from bio:', error); // 💡 [수정] logger 사용
  }

  const updateData: Prisma.UserUpdateInput = { bio };
  if (extractedSkills !== null) {
      updateData.extractedSkills = extractedSkills;
  }
  
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData, // 💡 [수정] updateData 사용
  });
  
  const { password, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
};

// ------------------------------------------------------------------
// [추가] 추천 시스템 로직
// ------------------------------------------------------------------

/**
 * 코사인 유사도 계산 로직 (유저의 스킬 벡터와 프로젝트의 요구 스택 벡터 비교)
 * @param userSkills - { "기술명": 숙련도(1.0~5.0) }
 * @param projectStack - 프로젝트의 요구 기술 스택 배열 (e.g., ["React", "TypeScript"])
 * @returns {number} 0.0 에서 1.0 사이의 유사도 점수
 */
function calculateCosineSimilarity(userSkills: Record<string, number>, projectStack: string[]): number {
    if (projectStack.length === 0) return 0;

    const projectSkills = projectStack.map(s => s.toLowerCase());
    
    // 유저의 추출된 스킬 목록과 프로젝트의 요구 스택을 모두 포함하는 집합 생성
    const uniqueSkills = Array.from(new Set([...Object.keys(userSkills), ...projectSkills]));
    
    let dotProduct = 0;
    let userVectorMagnitudeSq = 0;
    let projectVectorMagnitudeSq = 0;

    for (const skill of uniqueSkills) {
        // 사용자 스킬 벡터: 추출된 숙련도 점수 (0.0 ~ 5.0)
        const userWeight = userSkills[skill] || 0;
        
        // 프로젝트 스택 벡터: 요구 스택에 포함되면 1, 아니면 0
        const projectWeight = projectSkills.includes(skill) ? 1 : 0;
        
        dotProduct += userWeight * projectWeight;
        userVectorMagnitudeSq += userWeight * userWeight;
        projectVectorMagnitudeSq += projectWeight * projectWeight;
    }

    const userMagnitude = Math.sqrt(userVectorMagnitudeSq);
    const projectMagnitude = Math.sqrt(projectVectorMagnitudeSq);

    if (userMagnitude === 0 || projectMagnitude === 0) {
        return 0;
    }

    // 코사인 유사도 공식: (A · B) / (||A|| * ||B||)
    return dotProduct / (userMagnitude * projectMagnitude);
}

/**
 * 사용자에게 프로젝트를 추천합니다.
 * @param {number} userId - 사용자 ID
 * @returns {Promise<any[]>} 추천 프로젝트 목록 (점수 포함)
 */
export const getRecommendedProjects = async (userId: number): Promise<any[]> => {
    // 💡 [수정] getUserById를 사용하여 extractedSkills가 포함된 사용자 정보를 가져옵니다.
    const user = await getUserById(userId); 
    
    if (!user || !user.extractedSkills) {
        return [];
    }

    let userSkills: Record<string, number>;
    try {
        userSkills = JSON.parse(user.extractedSkills); 
    } catch (e) {
        logger.error(`[Recommendation] Failed to parse extracted skills for user ${userId}`, e);
        return [];
    }
    
    // 1. 모든 프로젝트를 가져옵니다.
    const allProjects = await prisma.project.findMany({
        include: { 
            owner: { 
                select: { 
                    id: true, 
                    email: true, 
                    name: true, 
                    personality: true,
                    status: true,
                }
            } 
        },
    });

    const recommendations = (allProjects as (Project & { owner: Omit<User, 'password'>, recommendationScore?: number })[])
        .map(project => {
            const similarity = calculateCosineSimilarity(userSkills, project.techStack);

            return {
                ...project,
                recommendationScore: similarity, 
            };
        })
        // 2. 점수가 0보다 큰 프로젝트만 필터링 (최소 적합도 5% 이상)
        .filter(p => p.recommendationScore && p.recommendationScore > 0.05) 
        // 3. 점수가 높은 순으로 정렬
        .sort((a, b) => (b.recommendationScore || 0) - (a.recommendationScore || 0)); 
    
    logger.info(`[Recommendation] Generated ${recommendations.length} project recommendations for user ${userId}.`);

    return recommendations;
};