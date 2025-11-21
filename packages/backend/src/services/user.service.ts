import { User, Application, Project, Prisma } from '@prisma/client';
import prisma from '../config/prisma.js';
import * as aiService from './ai.service.js';
import logger from '../utils/logger.js';

/**
 * ID로 사용자를 조회합니다.
 * @param {number} userId - 사용자 ID
 * @returns {Promise<Omit<User, 'password'> | null>}
 */
export const getUserById = async (userId: number): Promise<Omit<User, 'password'> | null> => {
  const user = await prisma.user.findUnique({ 
    where: { id: userId },
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
  
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword as Omit<User, 'password'>; 
};

/**
 * 사용자가 지원한 프로젝트 목록을 조회합니다. (기존 함수 유지)
 */
export const getAppliedProjectsByUserId = async (userId: number): Promise<(Application & { project: Project & { owner: Omit<User, 'password'> } })[]> => {
  return prisma.application.findMany({
    where: { userId },
    include: {
      project: {
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              name: true,
              personality: true,
              status: true,
              bio: true,
              extractedSkills: true,
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

/**
 * 사용자의 성격 정보를 업데이트합니다. (기존 함수 유지)
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
 * 사용자의 상태 정보를 업데이트합니다. (기존 함수 유지)
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
 */
export const updateUserBio = async (userId: number, bio: string): Promise<Omit<User, 'password'> | null> => {
  let extractedSkills: string | null = null;
  
  try {
    if (bio && bio.length > 10) {
      extractedSkills = await aiService.extractSkillsFromBio(bio);
    }
  } catch (error) {
    logger.error('Failed to extract skills from bio:', error);
  }

  const updateData: Prisma.UserUpdateInput = { bio };
  if (extractedSkills !== null) {
      updateData.extractedSkills = extractedSkills;
  }
  
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });
  
  const { password, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
};

// ------------------------------------------------------------------
// 추천 시스템 로직 (코사인, 자카드, 유클리드)
// ------------------------------------------------------------------

/**
 * 코사인 유사도 계산 로직
 * @returns {number} 0.0 에서 1.0 사이의 코사인 유사도 점수
 */
function calculateCosineSimilarity(userSkills: Record<string, number>, projectStack: string[]): number {
    if (projectStack.length === 0) return 0;

    const projectSkills = projectStack.map(s => s.toLowerCase());
    const uniqueSkills = Array.from(new Set([...Object.keys(userSkills), ...projectSkills]));
    
    let dotProduct = 0;
    let userVectorMagnitudeSq = 0;
    let projectVectorMagnitudeSq = 0;

    for (const skill of uniqueSkills) {
        const userWeight = userSkills[skill] || 0;
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

    return dotProduct / (userMagnitude * projectMagnitude);
}

/**
 * 자카드 유사도 계산 로직
 * @returns {number} 0.0 에서 1.0 사이의 자카드 유사도 점수
 */
function calculateJaccardSimilarity(userSkills: Record<string, number>, projectStack: string[]): number {
    // 숙련도가 1.0 이상인 기술만 '아는 기술'로 인정
    const userKnownSkills = new Set(
        Object.entries(userSkills)
            .filter(([, value]) => value >= 1.0)
            .map(([key]) => key.toLowerCase())
    );
    const requiredSkills = new Set(projectStack.map(s => s.toLowerCase()));

    if (requiredSkills.size === 0) return 0;

    // 교집합 크기 계산
    let intersectionSize = 0;
    for (const requiredSkill of requiredSkills) {
        if (userKnownSkills.has(requiredSkill)) {
            intersectionSize++;
        }
    }

    // 합집합 크기 계산: |A| + |B| - |A ∩ B|
    const unionSize = userKnownSkills.size + requiredSkills.size - intersectionSize;

    if (unionSize === 0) return 0;
    
    // 자카드 유사도 공식: |A ∩ B| / |A ∪ B|
    return intersectionSize / unionSize;
}

/**
 * 💡 [추가] 유클리드 유사도 계산 로직 (유클리드 거리의 역수 기반 유사도)
 * @returns {number} 0.0 에서 1.0 사이의 유클리드 유사도 점수 (1/(1+거리))
 */
function calculateEuclideanSimilarity(userSkills: Record<string, number>, projectStack: string[]): number {
    if (projectStack.length === 0) return 0;

    const projectSkills = projectStack.map(s => s.toLowerCase());
    const uniqueSkills = Array.from(new Set([...Object.keys(userSkills), ...projectSkills]));

    let distanceSq = 0;

    for (const skill of uniqueSkills) {
        const userWeight = userSkills[skill] || 0;
        const projectWeight = projectSkills.includes(skill) ? 1 : 0;
        
        distanceSq += Math.pow(userWeight - projectWeight, 2);
    }

    const distance = Math.sqrt(distanceSq);

    // 유클리드 유사도 공식: 1 / (1 + 거리)
    // 거리가 0에 가까울수록 (즉, 잘 맞을수록) 유사도 점수는 1에 가까워집니다.
    return 1 / (1 + distance);
}

/**
 * 사용자에게 프로젝트를 추천합니다. (세 가지 유사도 점수 포함)
 * @param {number} userId - 사용자 ID
 * @returns {Promise<any[]>} 추천 프로젝트 목록 (다중 점수 포함)
 */
export const getRecommendedProjects = async (userId: number): Promise<any[]> => {
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

    const recommendations = (allProjects as (Project & { owner: Omit<User, 'password'>, similarityScores?: { cosine: number, jaccard: number, euclidean: number }, mainScore?: number })[])
        .map(project => {
            const cosine = calculateCosineSimilarity(userSkills, project.techStack);
            const jaccard = calculateJaccardSimilarity(userSkills, project.techStack);
            const euclidean = calculateEuclideanSimilarity(userSkills, project.techStack); // 💡 [추가] 유클리드 계산
            
            return {
                ...project,
                similarityScores: { cosine, jaccard, euclidean }, // 💡 [수정] 유클리드 포함
                mainScore: cosine, // 기본 정렬 기준은 코사인으로 유지
            };
        })
        // 메인 점수(코사인)가 5% 이상인 프로젝트만 필터링
        .filter(p => p.mainScore && p.mainScore > 0.05) 
        // 메인 점수가 높은 순으로 정렬
        .sort((a, b) => (b.mainScore || 0) - (a.mainScore || 0)); 
    
    logger.info(`[Recommendation] Generated ${recommendations.length} project recommendations for user ${userId}.`);

    return recommendations;
};
