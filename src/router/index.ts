import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SimpleMIQAViewer from '../components/SimpleMIQAViewer.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/simplemiqa',
      name: 'simplemiqa',
      component: SimpleMIQAViewer
    }
  ]
})

export default router
