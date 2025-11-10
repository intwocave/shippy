// packages/backend/src/api/recommend.routes.ts 

import { Router } from 'express';
import * as recommendController from '../controllers/recommend.controller.js';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated.middleware.js';

const router = Router();

// GET /api/recommend/projects - 사용자 맞춤 프로젝트 추천 목록 조회 
router.get('/projects', ensureAuthenticated, recommendController.getRecommendedProjects);

export default router;