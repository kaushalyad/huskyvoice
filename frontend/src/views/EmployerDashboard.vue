<script setup>
import { computed, onMounted, ref } from "vue";
import { useAuthStore } from "../stores/auth";
import { apiRequest } from "../lib/api";

const auth = useAuthStore();
const loading = ref(false);
const loadingEmployees = ref(false);
const error = ref("");
const leaves = ref([]);
const employees = ref([]);

const statusBadgeClass = computed(() => (status) => {
  if (status === "APPROVED") return "bg-green-100 text-green-800 border-green-200";
  if (status === "REJECTED") return "bg-red-100 text-red-800 border-red-200";
  return "bg-yellow-100 text-yellow-800 border-yellow-200";
});

async function loadEmployees() {
  loadingEmployees.value = true;
  try {
    employees.value = await apiRequest("/api/users", { token: auth.token });
  } catch (e) {
    console.error("Failed to load employees", e);
  } finally {
    loadingEmployees.value = false;
  }
}

async function loadAll() {
  loading.value = true;
  error.value = "";
  try {
    leaves.value = await apiRequest("/api/leaves", { token: auth.token });
  } catch (e) {
    error.value = e.message || "Failed to load leave requests";
  } finally {
    loading.value = false;
  }
}

async function decide(id, decision) {
  error.value = "";
  try {
    await apiRequest(`/api/leaves/${id}/${decision}`, {
      method: "PATCH",
      token: auth.token,
    });
    await loadAll();
    await loadEmployees();
  } catch (e) {
    error.value = e.message || "Failed to update request";
  }
}

onMounted(() => {
  loadEmployees();
  loadAll();
});
</script>

<template>
  <div class="space-y-6">
    <section class="rounded-2xl border border-slate-800/80 bg-slate-950/80 p-4 shadow-lg shadow-slate-950/40">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-slate-400">Company</p>
          <h2 class="text-sm font-semibold text-slate-50 sm:text-base">
            {{ auth.companyName || "Your company" }}
          </h2>
        </div>
        <div class="text-xs text-slate-300 sm:text-sm">
          <div>
            <span class="font-medium text-slate-100">Code:</span>
            <span class="text-slate-300">{{ auth.companyCode }}</span>
          </div>
          <div class="mt-1">
            <span class="font-medium text-slate-100">Employer:</span>
            <span class="text-slate-300">{{ auth.user?.name }} ({{ auth.user?.email }})</span>
          </div>
        </div>
      </div>
    </section>

    <section class="rounded-2xl border border-slate-800/80 bg-slate-950/80 p-5 shadow-lg shadow-slate-950/40">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-semibold tracking-tight text-slate-50 sm:text-lg">
            Employee list
          </h2>
          <p class="mt-1 text-xs text-slate-300 sm:text-sm">
            All employees in your company.
          </p>
        </div>
        <button
          class="rounded-full border border-slate-700/80 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-100 hover:border-slate-500 disabled:opacity-60"
          type="button"
          :disabled="loadingEmployees"
          @click="loadEmployees"
        >
          Refresh
        </button>
      </div>
      <div v-if="loadingEmployees" class="mt-4 text-xs text-slate-400">Loading employees...</div>
      <div v-else-if="employees.length === 0" class="mt-4 text-xs text-slate-400">
        No employees yet. Employees register with your company code to appear here.
      </div>
      <div v-else class="mt-4 overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/60">
        <table class="w-full border-collapse text-left text-xs text-slate-200 sm:text-sm">
          <thead class="bg-slate-900/70 text-slate-300">
            <tr>
              <th class="px-3 py-2 font-medium">Name</th>
              <th class="px-3 py-2 font-medium">Email</th>
              <th class="px-3 py-2 font-medium">Leave balance</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="emp in employees"
              :key="emp._id"
              class="border-t border-slate-800/80 odd:bg-slate-950/40 even:bg-slate-900/40"
            >
              <td class="px-3 py-2 font-medium text-slate-50">{{ emp.name }}</td>
              <td class="px-3 py-2 text-slate-400">{{ emp.email }}</td>
              <td class="px-3 py-2 text-emerald-300">{{ emp.leaveBalance ?? 0 }} days</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section
      class="rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900/80 via-slate-900/70 to-slate-950/90 p-5 shadow-xl shadow-slate-950/50"
    >
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-base font-semibold tracking-tight text-slate-50 sm:text-lg">
            Employee leave requests
          </h2>
          <p class="mt-1 text-xs text-slate-300 sm:text-sm">
            Review all pending requests and quickly approve or reject them.
          </p>
        </div>
        <div class="inline-flex items-center rounded-full bg-sky-900/40 px-3 py-1 text-[11px] font-medium text-sky-100 ring-1 ring-sky-500/40">
          Employer view
        </div>
      </div>

      <div
        v-if="error"
        class="mt-4 rounded-lg border border-red-500/50 bg-red-950/40 p-3 text-xs text-red-100"
      >
        {{ error }}
      </div>

      <div class="mt-4 flex items-center justify-between text-xs text-slate-300 sm:text-sm">
        <span v-if="loading">Loading latest requests...</span>
        <span v-else-if="!loading && leaves.length > 0">
          Showing {{ leaves.length }} request(s)
        </span>
        <button
          class="rounded-full border border-slate-700/80 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-100 hover:border-slate-500 disabled:opacity-60"
          type="button"
          :disabled="loading"
          @click="loadAll"
        >
          Refresh
        </button>
      </div>

      <div v-if="!loading && leaves.length === 0" class="mt-4 text-xs text-slate-400 sm:text-sm">
        No leave requests found yet.
      </div>

      <div
        v-else
        class="mt-4 overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/60"
      >
        <table class="w-full border-collapse text-left text-xs text-slate-200 sm:text-sm">
          <thead class="bg-slate-900/70 text-slate-300">
            <tr>
              <th class="px-3 py-2 font-medium">Employee</th>
              <th class="px-3 py-2 font-medium">Type</th>
              <th class="px-3 py-2 font-medium">Start</th>
              <th class="px-3 py-2 font-medium">End</th>
              <th class="px-3 py-2 font-medium">Reason</th>
              <th class="px-3 py-2 font-medium">Status</th>
              <th class="px-3 py-2 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="l in leaves"
              :key="l._id"
              class="border-t border-slate-800/80 odd:bg-slate-950/40 even:bg-slate-900/40"
            >
              <td class="px-3 py-2 align-top">
                <div class="font-medium text-slate-50">
                  {{ l.employee?.name || "Unknown" }}
                </div>
                <div class="text-[11px] text-slate-400">{{ l.employee?.email }}</div>
              </td>
              <td class="px-3 py-2 align-top">{{ l.leaveType }}</td>
              <td class="px-3 py-2 align-top">
                {{ new Date(l.startDate).toLocaleDateString() }}
              </td>
              <td class="px-3 py-2 align-top">
                {{ new Date(l.endDate).toLocaleDateString() }}
              </td>
              <td class="px-3 py-2 align-top max-w-[20rem] truncate" :title="l.reason">
                {{ l.reason }}
              </td>
              <td class="px-3 py-2 align-top">
                <span
                  class="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide"
                  :class="statusBadgeClass(l.status)"
                >
                  {{ l.status }}
                </span>
              </td>
              <td class="px-3 py-2 align-top">
                <div class="flex justify-end gap-2">
                  <button
                    class="rounded-full bg-emerald-500 px-3 py-1.5 text-[11px] font-semibold text-slate-950 shadow-sm transition hover:bg-emerald-400 disabled:opacity-60"
                    type="button"
                    :disabled="loading || l.status !== 'PENDING'"
                    @click="decide(l._id, 'approve')"
                  >
                    Approve
                  </button>
                  <button
                    class="rounded-full bg-red-500 px-3 py-1.5 text-[11px] font-semibold text-slate-50 shadow-sm transition hover:bg-red-400 disabled:opacity-60"
                    type="button"
                    :disabled="loading || l.status !== 'PENDING'"
                    @click="decide(l._id, 'reject')"
                  >
                    Reject
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

