// packages/backend/src/controllers/recommend.controller.ts 

import type { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service.js';
import httpStatus from 'http-status';
import type { User } from '@prisma/client';
import ApiError from '../utils/ApiError.js';

/**
 * 사용자 맞춤 프로젝트 추천 목록을 조회합니다.
 */
export const getRecommendedProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // req.user는 ensureAuthenticated 미들웨어에 의해 설정됩니다.
    const userId = (req.user as User).id;
    if (!userId) {
      throw new ApiError(httpStatus.UNAUTHORIZED, '인증된 사용자만 추천을 받을 수 있습니다.');
    }
    
    const recommendations = await userService.getRecommendedProjects(userId);
    
    res.status(httpStatus.OK).json(recommendations);
  } catch (error) {
    next(error);
  }
};