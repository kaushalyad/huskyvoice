import { createRouter, createWebHistory } from "vue-router";
import LoginPage from "../views/LoginPage.vue";
import RegisterPage from "../views/RegisterPage.vue";
import EmployeeDashboard from "../views/EmployeeDashboard.vue";
import EmployerDashboard from "../views/EmployerDashboard.vue";

export function createAppRouter({ authStore }) {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: "/", redirect: "/login" },
      { path: "/login", component: LoginPage },
      { path: "/register", component: RegisterPage },
      {
        path: "/employee",
        component: EmployeeDashboard,
        meta: { requiresAuth: true, role: "EMPLOYEE" },
      },
      {
        path: "/employer",
        component: EmployerDashboard,
        meta: { requiresAuth: true, role: "EMPLOYER" },
      },
      { path: "/:pathMatch(.*)*", redirect: "/login" },
    ],
  });

  router.beforeEach((to) => {
    if (to.meta?.requiresAuth) {
      if (!authStore.isAuthed) return "/login";
      if (to.meta.role && authStore.role !== to.meta.role) {
        return authStore.role === "EMPLOYER" ? "/employer" : "/employee";
      }
    }
    if ((to.path === "/login" || to.path === "/register") && authStore.isAuthed) {
      return authStore.role === "EMPLOYER" ? "/employer" : "/employee";
    }
    return true;
  });

  return router;
}

