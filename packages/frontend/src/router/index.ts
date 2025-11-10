import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Projects from '../pages/Projects.vue'
import ProjectDetail from '../pages/ProjectDetail.vue'
import ProjectCreate from '../pages/ProjectCreate.vue'
import MyApplications from '../pages/MyApplications.vue' // 추가
import Profile from '../pages/Profile.vue'
import UserProfile from '../pages/UserProfile.vue'
import TeamRoom from '../pages/TeamRoom.vue'
import Recommend from '../pages/Recommend.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/projects', component: Projects },
  { path: '/projects/new', component: ProjectCreate }, // 프로젝트 등록
  { path: '/projects/:id', component: ProjectDetail }, // 프로젝트 상세
  { path: '/my-applications', component: MyApplications }, // 내 지원 목록
  { path: '/profile', component: Profile }, // 내 프로필
  { path: '/users/:id', component: UserProfile }, // 다른 사용자 프로필
  {
    path: '/team-room', // 팀룸
    component: TeamRoom,
    meta: { fullWidth: true }
  },
  { path: '/recommend',
    component: Recommend },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
