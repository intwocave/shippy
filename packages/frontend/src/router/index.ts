import { createRouter, createWebHistory } from 'vue-router'
import HelloWorld from '../components/HelloWorld.vue'
import ProjectListView from '../views/ProjectListView.vue'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: HelloWorld
    },
    {
        path: '/projects',
        name: 'Projects',
        component: ProjectListView
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router