import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Pets from '../views/Pets.vue'
import LoginView from '../views/Login.vue'
import RegisterView from '../views/Register.vue'
import { currentUser, fetchUser } from '../services/auth.js'

const routes = [
  { path: '/login', component: LoginView, meta: { hideElem: true, guestOnly: true } },
  { path: '/register', component: RegisterView, meta: { hideElem: true, guestOnly: true } },
  { path: '/', name: 'home', component: Home },
  { path: '/pets', name: 'pets', component: Pets, meta: { requiresAuth: true, roles: ['owner'] } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  await fetchUser()                       // make sure we know who's logged in
  const user = currentUser.value

  if (to.meta.requiresAuth && !user) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  if (to.meta.roles && !to.meta.roles.includes(user.role)) {
    return { path: '/' }
  }
  if (to.meta.guestOnly && user) {
    return { path: '/' }
  }
})

export default router