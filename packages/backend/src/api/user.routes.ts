import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated.middleware.js';

const router = express.Router();

// '/api/users/me' - 현재 로그인된 사용자 정보 가져오기 (인증 필요)
router.get('/me', ensureAuthenticated, userController.getMe);

// '/api/users/me/applications' - 현재 사용자가 지원한 프로젝트 목록 가져오기 (인증 필요)
router.get('/me/applications', ensureAuthenticated, userController.getMyApplications);

// '/api/users/me/personality' - 현재 로그인된 사용자의 성격 정보 업데이트하기 (인증 필요)
router.put('/me/personality', ensureAuthenticated, userController.updateMyPersonality);

// '/api/users/me/status' - 현재 로그인된 사용자의 상태 정보 업데이트하기 (인증 필요)
router.put('/me/status', ensureAuthenticated, userController.updateMyStatus);

// '/api/users/me/bio' - 현재 로그인된 사용자의 자기소개 정보 업데이트하기 (인증 필요)
router.put('/me/bio', ensureAuthenticated, userController.updateMyBio);

// '/api/users/:userId' - 특정 사용자 정보 가져오기
router.get('/:userId', userController.getUserById);

export default router;

