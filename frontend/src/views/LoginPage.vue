<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const auth = useAuthStore();

const email = ref("");
const password = ref("");
const error = ref("");

async function onSubmit() {
  error.value = "";
  try {
    await auth.login({ email: email.value, password: password.value });
    router.push(auth.role === "EMPLOYER" ? "/employer" : "/employee");
  } catch (e) {
    error.value = e.message || "Login failed";
  }
}
</script>

<template>
  <div class="flex items-center justify-center">
    <div
      class="w-full max-w-md rounded-2xl bg-white px-8 py-8 text-slate-900 shadow-2xl shadow-slate-900/40"
    >
      <div class="mb-6 text-center">
        <h1 class="text-xl font-semibold tracking-tight text-slate-900">Sign in to Husky People</h1>
        <p class="mt-1 text-xs text-slate-500">
          Use your work email and password to access your leave dashboard.
        </p>
      </div>

      <form class="space-y-4" @submit.prevent="onSubmit">
        <div>
          <label class="text-xs font-medium text-slate-700">Email</label>
          <input
            v-model="email"
            class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            type="email"
            placeholder="you@company.com"
            required
          />
        </div>

        <div>
          <label class="text-xs font-medium text-slate-700">Password</label>
          <input
            v-model="password"
            class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            type="password"
            placeholder="••••••••"
            required
          />
        </div>

        <div
          v-if="error"
          class="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700"
        >
          {{ error }}
        </div>

        <button
          class="w-full rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-sky-500 disabled:opacity-60"
          type="submit"
          :disabled="auth.loading"
        >
          {{ auth.loading ? "Signing in..." : "Sign in" }}
        </button>
      </form>

      <p class="mt-4 text-center text-xs text-slate-500">
        Don’t have an account?
        <RouterLink class="font-medium text-sky-600 hover:text-sky-500" to="/register">
          Create one
        </RouterLink>
      </p>
    </div>
  </div>
</template>

