<script setup>
import { computed, onMounted, ref } from "vue";
import { useAuthStore } from "../stores/auth";
import { apiRequest } from "../lib/api";
import DateField from "../components/DateField.vue";

const auth = useAuthStore();
const loading = ref(false);
const error = ref("");

const leaveType = ref("Sick Leave");
const startDate = ref("");
const endDate = ref("");
const reason = ref("");

const leaves = ref([]);

const statusBadgeClass = computed(() => (status) => {
  if (status === "APPROVED") return "bg-green-100 text-green-800 border-green-200";
  if (status === "REJECTED") return "bg-red-100 text-red-800 border-red-200";
  return "bg-yellow-100 text-yellow-800 border-yellow-200";
});

async function loadLeaves() {
  loading.value = true;
  error.value = "";
  try {
    leaves.value = await apiRequest("/api/leaves/my", {
      token: auth.token,
    });
  } catch (e) {
    error.value = e.message || "Failed to load leaves";
  } finally {
    loading.value = false;
  }
}

async function submitLeave() {
  error.value = "";
  try {
    if (!leaveType.value || !startDate.value || !endDate.value || !reason.value) {
      error.value = "All fields are required";
      return;
    }
    await apiRequest("/api/leaves", {
      method: "POST",
      token: auth.token,
      body: {
        leaveType: leaveType.value,
        startDate: startDate.value,
        endDate: endDate.value,
        reason: reason.value,
      },
    });
    startDate.value = "";
    endDate.value = "";
    reason.value = "";
    await loadLeaves();
  } catch (e) {
    error.value = e.message || "Failed to submit leave";
  }
}

onMounted(loadLeaves);
</script>

<template>
  <div class="space-y-6">
    <section class="rounded-2xl border border-slate-800/80 bg-slate-950/80 p-5 shadow-lg shadow-slate-950/40">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p class="text-[11px] font-medium uppercase tracking-wide text-slate-400">Employee</p>
          <p class="mt-1 text-sm font-semibold text-slate-50">{{ auth.user?.name }}</p>
          <p class="mt-0.5 text-xs text-slate-400">{{ auth.user?.email }}</p>
        </div>
        <div v-if="auth.companyName">
          <p class="text-[11px] font-medium uppercase tracking-wide text-slate-400">Company</p>
          <p class="mt-1 text-sm font-semibold text-slate-50">{{ auth.companyName }}</p>
          <p class="mt-0.5 text-xs text-slate-400">Code: {{ auth.companyCode }}</p>
        </div>
        <div v-if="auth.managerName">
          <p class="text-[11px] font-medium uppercase tracking-wide text-slate-400">Employer / Manager</p>
          <p class="mt-1 text-sm font-semibold text-slate-50">{{ auth.managerName }}</p>
          <p v-if="auth.managerEmail" class="mt-0.5 text-xs text-slate-400">{{ auth.managerEmail }}</p>
        </div>
        <div class="sm:text-right">
          <p class="text-[11px] font-medium uppercase tracking-wide text-slate-400">Leave balance</p>
          <p class="mt-1 text-2xl font-semibold text-emerald-300">
            {{ auth.leaveBalance ?? "—" }}
            <span class="text-xs font-normal text-slate-400">days</span>
          </p>
        </div>
      </div>
    </section>

    <section
      class="rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900/80 via-slate-900/70 to-slate-950/90 p-5 shadow-xl shadow-slate-950/50"
    >
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-base font-semibold tracking-tight text-slate-50 sm:text-lg">
            Apply for leave
          </h2>
          <p class="mt-1 text-xs text-slate-300 sm:text-sm">
            Fill in the dates and a short reason. Your manager will be notified in their dashboard.
          </p>
        </div>
        <div class="inline-flex items-center rounded-full bg-emerald-900/40 px-3 py-1 text-[11px] font-medium text-emerald-100 ring-1 ring-emerald-500/40">
          Employee view
        </div>
      </div>

      <div
        v-if="error"
        class="mt-4 rounded-lg border border-red-500/50 bg-red-950/40 p-3 text-xs text-red-100"
      >
        {{ error }}
      </div>

      <form class="mt-4 grid gap-4 md:grid-cols-2" @submit.prevent="submitLeave">
        <div>
          <label class="text-xs font-medium text-slate-300">Leave type</label>
          <input
            v-model="leaveType"
            class="mt-1 w-full rounded-lg border border-slate-700/80 bg-slate-950/60 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
            required
          />
        </div>
        <div class="hidden md:block" />

        <div>
          <DateField v-model="startDate" label="Start date" />
        </div>
        <div>
          <DateField v-model="endDate" label="End date" />
        </div>

        <div class="md:col-span-2">
          <label class="text-xs font-medium text-slate-300">Reason</label>
          <textarea
            v-model="reason"
            class="mt-1 w-full rounded-lg border border-slate-700/80 bg-slate-950/60 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
            rows="3"
            placeholder="Briefly explain why you need this leave..."
            required
          />
        </div>

        <div class="md:col-span-2">
          <button
            class="inline-flex items-center rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 shadow-sm transition hover:bg-sky-400 disabled:opacity-60"
            type="submit"
            :disabled="loading"
          >
            Submit request
          </button>
        </div>
      </form>
    </section>

    <section class="rounded-2xl border border-slate-800/80 bg-slate-950/80 p-5 shadow-lg shadow-slate-950/40">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-semibold tracking-tight text-slate-50 sm:text-lg">
            My leave requests
          </h2>
          <p class="mt-1 text-xs text-slate-300 sm:text-sm">
            Review the status and details of all your submissions.
          </p>
        </div>
        <button
          class="rounded-full border border-slate-700/80 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-100 hover:border-slate-500 disabled:opacity-60"
          type="button"
          :disabled="loading"
          @click="loadLeaves"
        >
          Refresh
        </button>
      </div>

      <div v-if="loading" class="mt-4 text-xs text-slate-300 sm:text-sm">Loading...</div>
      <div v-else-if="leaves.length === 0" class="mt-4 text-xs text-slate-400 sm:text-sm">
        No leave requests yet. Submit your first request using the form above.
      </div>

      <div v-else class="mt-4 overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/60">
        <table class="w-full border-collapse text-left text-xs text-slate-200 sm:text-sm">
          <thead class="bg-slate-900/70 text-slate-300">
            <tr>
              <th class="px-3 py-2 font-medium">Type</th>
              <th class="px-3 py-2 font-medium">Start</th>
              <th class="px-3 py-2 font-medium">End</th>
              <th class="px-3 py-2 font-medium">Reason</th>
              <th class="px-3 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="l in leaves"
              :key="l._id"
              class="border-t border-slate-800/80 odd:bg-slate-950/40 even:bg-slate-900/40"
            >
              <td class="px-3 py-2 align-top">{{ l.leaveType }}</td>
              <td class="px-3 py-2 align-top">
                {{ new Date(l.startDate).toLocaleDateString() }}
              </td>
              <td class="px-3 py-2 align-top">
                {{ new Date(l.endDate).toLocaleDateString() }}
              </td>
              <td class="px-3 py-2 align-top max-w-[24rem] truncate" :title="l.reason">
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
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

