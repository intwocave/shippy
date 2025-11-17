import { Router } from 'express';
import * as projectController from '../controllers/project.controller.js';
import * as commentController from '../controllers/comment.controller.js';
import * as chatController from '../controllers/chat.controller.js';
import * as sharedNoteController from '../controllers/sharedNote.controller.js'; // 👈 [추가]
import { authenticate } from '../middlewares/auth.middleware.js';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated.middleware.js';

const router = Router();
// 인기 프로젝트 목록 조회
router.get('/popular', projectController.getPopularProjects);

// 프로젝트 생성 (인증 필수)
router.post('/', ensureAuthenticated, projectController.createProject);

// 프로젝트 목록 조회
router.get('/', projectController.getProjects);

// 프로젝트 상세 조회 (선택적 인증)
router.get('/:id', authenticate, projectController.getProjectById);

// 프로젝트 지원 (인증 필수)
router.post('/:id/apply', ensureAuthenticated, projectController.applyToProject);

// Comment Routes
router.get('/:projectId/comments', projectController.getComments);
router.post('/:projectId/comments', ensureAuthenticated, commentController.createComment);
router.put('/:projectId/comments/:commentId', ensureAuthenticated, commentController.updateComment);
router.delete('/:projectId/comments/:commentId', ensureAuthenticated, commentController.deleteComment);
router.get('/:projectId/comments', projectController.getComments);

// [추가] 채팅 메시지 기록 조회 라우트
router.get('/:projectId/messages', ensureAuthenticated, chatController.getMessages);

// Get applicants for a project
router.get('/:id/applications', ensureAuthenticated, projectController.getProjectApplicants);

// [추가] 채팅 메시지 기록 조회 라우트
router.get('/:projectId/messages', ensureAuthenticated, chatController.getMessages);

// [추가] 공유 노트 조회 라우트
router.get('/:projectId/note', ensureAuthenticated, sharedNoteController.getNote); 

// [추가] 프로젝트에 적합한 추천 유저 목록 조회
router.get('/:id/recommended-users', ensureAuthenticated, projectController.getRecommendedUsers); // 👈 이 라우트와 컨트롤러를 추가해야 합니다.

export default router;
