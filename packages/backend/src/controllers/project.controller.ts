import type { Request, Response, NextFunction } from 'express';
import * as projectService from '../services/project.service.js';
import * as commentService from '../services/comment.service.js';
import httpStatus from 'http-status';
import type { User } from '@prisma/client';
import ApiError from '../utils/ApiError.js';

/**
 * 새 프로젝트 생성
 */
export const createProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ownerId = (req.user as User).id;
    const projectData = { ...req.body, ownerId };
    const project = await projectService.createProject(projectData);
    res.status(httpStatus.CREATED).json(project);
  } catch (error) {
    next(error);
  }
};

/**
 * 프로젝트 목록 조회
 */
export const getProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { techStack, positions, progressMethod } = req.query;

    const filters: {
      techStack?: string[];
      positions?: string[];
      progressMethod?: string;
    } = {};

    if (typeof techStack === 'string') filters.techStack = techStack.split(',');
    if (typeof positions === 'string') filters.positions = positions.split(',');
    if (typeof progressMethod === 'string') filters.progressMethod = progressMethod;

    const projects = await projectService.getProjects(filters);
    res.status(httpStatus.OK).json(projects);
  } catch (error) {
    next(error);
  }
};

/**
 * 인기 프로젝트 목록 조회
 */
export const getPopularProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projects = await projectService.getPopularProjects();
    res.status(httpStatus.OK).json(projects);
  } catch (error) {
    next(error);
  }
};

/**
 * 프로젝트 상세 조회
 */
export const getProjectById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = (req.user as User)?.id; // passport-jwt 전략은 실패 시 user를 설정하지 않으므로, 비로그인 상태일 수 있음
    const project = await projectService.getProjectById(Number(id), userId);
    if (!project) {
      throw new ApiError(httpStatus.NOT_FOUND, '프로젝트를 찾을 수 없습니다.');
    }
    res.status(httpStatus.OK).json(project);
  } catch (error) {
    next(error);
  }
};

/**
 * 프로젝트에 지원
 */
export const applyToProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = Number(req.params.id);
    const userId = (req.user as User).id;

    await projectService.applyToProject({ projectId, userId });

    res.status(httpStatus.CREATED).json({ message: '성공적으로 지원했습니다.' });
  } catch (error) {
    next(error);
  }
};

/**
 * 프로젝트 댓글 조회
 */
export const getComments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params;
    const comments = await commentService.getCommentsByProjectId(Number(projectId));
    res.status(httpStatus.OK).json(comments);
  } catch (error) {
    next(error);
  }
};

/**
 * 프로젝트 지원자 목록 조회
 */
export const getProjectApplicants = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = Number(req.params.id);
    const userId = (req.user as User).id;

    const applicants = await projectService.getProjectApplicants(projectId, userId);
    res.status(httpStatus.OK).json(applicants);
  } catch (error) {
    next(error);
  }
};

/**
 * 프로젝트에 적합한 추천 사용자 목록 조회
 */
export const getRecommendedUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = Number(req.params.id);
    // 추천 로직을 담은 서비스 함수 호출 (미리 구현해야 함)
    const recommendedUsers = await projectService.getRecommendedUsersForProject(projectId); 
    res.status(httpStatus.OK).json(recommendedUsers);
  } catch (error) {
    next(error);
  }
};

/**
 * 프로젝트 멤버 조회
 */
export const getProjectMembers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = Number(req.params.id);
    const members = await projectService.getProjectMembers(projectId);
    res.status(httpStatus.OK).json(members);
  } catch (error) {
    next(error);
  }
};