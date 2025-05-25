import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import { useAuthStore } from "../store/auth";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    component: () => import("../views/Home.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("../views/Registration.vue"),
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("../views/Login.vue"),
  },
  {
    path: "/contacts",
    name: "Contacts",
    component: () => import("../components/contacts/Contacts.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/profile",
    name: "Profile",
    component: () => import("../views/Profile.vue"),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();

  if (!authStore.isAuthReady) {
    const unwatch = authStore.$subscribe(() => {
      if (authStore.isAuthReady) {
        unwatch();
        if (to.meta.requiresAuth && !authStore.isAuthenticated) {
          next("/login");
        } else {
          next();
        }
      }
    });
    return;
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next("/login");
  } else {
    next();
  }
});

export default router;
