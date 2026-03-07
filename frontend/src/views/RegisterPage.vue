<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const auth = useAuthStore();

const name = ref("");
const email = ref("");
const password = ref("");
const role = ref("EMPLOYEE");
const companyCode = ref("");
const companyName = ref("");
const error = ref("");

async function onSubmit() {
  error.value = "";
  try {
    await auth.register({
      name: name.value,
      email: email.value,
      password: password.value,
      role: role.value,
      companyCode: companyCode.value,
      companyName: role.value === "EMPLOYER" ? companyName.value : undefined,
    });
    router.push(auth.role === "EMPLOYER" ? "/employer" : "/employee");
  } catch (e) {
    error.value = e.message || "Registration failed";
  }
}
</script>

<template>
  <div class="flex items-center justify-center">
    <div
      class="w-full max-w-md rounded-2xl bg-white px-8 py-8 text-slate-900 shadow-2xl shadow-slate-900/40"
    >
      <div class="mb-6 text-center">
        <h1 class="text-xl font-semibold tracking-tight text-slate-900">Create your account</h1>
        <p class="mt-1 text-xs text-slate-500">
          Employers set up the company. Employees join using the company code.
        </p>
      </div>

      <form class="space-y-4" @submit.prevent="onSubmit">
        <div>
          <label class="text-xs font-medium text-slate-700">Name</label>
          <input
            v-model="name"
            class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            type="text"
            placeholder="Your name"
            required
          />
        </div>

        <div v-if="role === 'EMPLOYER'">
          <label class="text-xs font-medium text-slate-700">Company name</label>
          <input
            v-model="companyName"
            class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            type="text"
            placeholder="e.g. HuskyVoice AI"
            required
          />
          <p class="mt-1 text-[11px] text-slate-500">
            This is the company name your employees will see.
          </p>
        </div>

        <div>
          <label class="text-xs font-medium text-slate-700">Company code</label>
          <input
            v-model="companyCode"
            class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            type="text"
            placeholder="e.g. huskyvoice-001"
            required
          />
          <p v-if="role === 'EMPLOYEE'" class="mt-1 text-[11px] text-amber-600">
            Your employer must register first. Use the company code they provide. If the code is invalid, you cannot create an account.
          </p>
          <p v-else class="mt-1 text-[11px] text-slate-500">
            Create this code once and share it with your employees so they can join.
          </p>
        </div>

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
            placeholder="At least 6 characters"
            minlength="6"
            required
          />
        </div>

        <div>
          <label class="text-xs font-medium text-slate-700">Role</label>
          <select
            v-model="role"
            class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="EMPLOYEE">Employee</option>
            <option value="EMPLOYER">Employer</option>
          </select>
        </div>

        <div
          v-if="error"
          class="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700"
        >
          {{ error }}
        </div>

        <button
          class="w-full rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-500 disabled:opacity-60"
          type="submit"
          :disabled="auth.loading"
        >
          {{ auth.loading ? "Creating account..." : "Create account" }}
        </button>
      </form>

      <p class="mt-4 text-center text-xs text-slate-500">
        Already have an account?
        <RouterLink class="font-medium text-sky-600 hover:text-sky-500" to="/login">
          Login
        </RouterLink>
      </p>
    </div>
  </div>
</template>

