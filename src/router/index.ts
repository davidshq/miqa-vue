import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SimpleVTKVue from '../views/SimpleVTKView.vue'
import SimpleITKVue from '../components/SimpleITK.vue'
import SimpleITKVTKIntegrate from '../components/SimpleITKVTKIntegrate.vue'
import ITKVTKViewer from '../views/ITKVTKViewer.vue'
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
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/simplevtk',
      name: 'simplevtk',
      component: SimpleVTKVue
    },
    {
      path: '/simpleitk',
      name: 'simpleitk',
      component: SimpleITKVue
    },
    {
      path: '/simpleitkvtk',
      name: 'simpleitkvtk',
      component: SimpleITKVTKIntegrate
    },
    {
      path: '/itkvtkviewer',
      name: 'itkvtkviewer',
      component: ITKVTKViewer
    },
    {
      path: '/simplemiqa',
      name: 'simplemiqa',
      component: SimpleMIQAViewer
    }
  ]
})

export default router
