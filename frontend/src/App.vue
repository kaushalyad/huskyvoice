<script setup>
import { useRouter } from "vue-router";
import { useAuthStore } from "./stores/auth";

const auth = useAuthStore();
const router = useRouter();

function goHome() {
  if (!auth.isAuthed) return "/login";
  return auth.role === "EMPLOYER" ? "/employer" : "/employee";
}

function handleLogout() {
  auth.logout();
  router.push("/login");
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-50">
    <header class="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur">
      <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <RouterLink :to="goHome()" class="flex items-center gap-2">
          <div
            class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 ring-1 ring-sky-500/40"
          >
            <span class="text-sm font-semibold text-sky-300">LV</span>
          </div>
          <div class="flex flex-col leading-tight">
            <span class="text-sm font-semibold tracking-tight text-slate-50">
              Husky Leave Manager
            </span>
            <span class="text-[11px] text-slate-400">
              <span v-if="auth.companyName">
                Company: {{ auth.companyName }} ({{ auth.companyCode }})
              </span>
              <span v-else-if="auth.companyCode">
                Company code: {{ auth.companyCode }}
              </span>
              <span v-else>Employees · Employers · Approvals</span>
            </span>
          </div>
        </RouterLink>

        <div class="flex items-center gap-3 text-sm">
          <div v-if="auth.user" class="hidden text-right sm:block">
            <div class="font-medium text-slate-50">
              {{ auth.user.name }}
            </div>
            <div class="text-xs uppercase tracking-wide text-slate-400">
              {{ auth.user.role }}
            </div>
          </div>
          <button
            v-if="auth.isAuthed"
            class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-900 shadow-sm transition hover:bg-white"
            type="button"
            @click="handleLogout"
          >
            <span>Logout</span>
          </button>
          <RouterLink
            v-else
            to="/login"
            class="inline-flex items-center gap-1 rounded-full border border-slate-700/70 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-100 shadow-sm transition hover:border-slate-500 hover:bg-slate-900"
          >
            Login
          </RouterLink>
        </div>
      </div>
    </header>

    <main class="mx-auto flex min-h-[calc(100vh-64px)] max-w-5xl flex-col px-4 py-8">
      <section
        class="mb-6 rounded-2xl border border-slate-800/80 bg-gradient-to-r from-slate-900/80 via-slate-900/60 to-slate-900/40 px-5 py-4 shadow-[0_18px_45px_rgba(15,23,42,0.75)] sm:px-6"
      >
        <h1 class="text-base font-semibold tracking-tight text-slate-50 sm:text-lg">
          Streamlined leave management
        </h1>
        <p class="mt-1 text-xs text-slate-300 sm:text-sm">
          Employees request leave in seconds. Employers review and approve from a clean dashboard.
        </p>
      </section>

      <section class="flex-1">
        <div class="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.85)] sm:p-6">
          <RouterView />
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped></style>
