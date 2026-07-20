import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import AddStoreView from '../views/AddStoreView.vue'
import EditStoreView from '../views/EditStoreView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/add', name: 'add', component: AddStoreView, meta: { requiresAuth: true } },
    { path: '/edit/:id', name: 'edit', component: EditStoreView, meta: { requiresAuth: true } },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !window.__USER__) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
})

export default router
