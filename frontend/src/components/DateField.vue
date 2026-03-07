<script setup>
import { computed, onMounted, ref, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  label: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue"]);

const isOpen = ref(false);
const currentYear = ref(0);
const currentMonth = ref(0); // 0-based

function parseYmd(value) {
  if (!value) return null;
  const parts = value.split("-");
  if (parts.length !== 3) return null;
  const [y, m, d] = parts.map((p) => Number(p));
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function toYmd(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function setFromModel(value) {
  const d = parseYmd(value) || new Date();
  currentYear.value = d.getFullYear();
  currentMonth.value = d.getMonth();
}

watch(
  () => props.modelValue,
  (val) => {
    setFromModel(val);
  },
  { immediate: true }
);

onMounted(() => {
  setFromModel(props.modelValue);
});

const displayValue = computed(() => {
  const d = parseYmd(props.modelValue);
  if (!d) return "";
  return d.toLocaleDateString("en-GB");
});

const monthLabel = computed(() => {
  const date = new Date(currentYear.value, currentMonth.value, 1);
  return date.toLocaleString("en-US", { month: "short", year: "numeric" });
});

const weeks = computed(() => {
  const first = new Date(currentYear.value, currentMonth.value, 1);
  const startWeekday = first.getDay(); // 0=Sun
  const daysInMonth = new Date(
    currentYear.value,
    currentMonth.value + 1,
    0
  ).getDate();

  const cells = [];
  for (let i = 0; i < startWeekday; i += 1) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d += 1) {
    cells.push(d);
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  const rows = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }
  return rows;
});

function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value -= 1;
  } else {
    currentMonth.value -= 1;
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value += 1;
  } else {
    currentMonth.value += 1;
  }
}

function selectDay(day) {
  if (!day) return;
  const d = new Date(currentYear.value, currentMonth.value, day);
  emit("update:modelValue", toYmd(d));
  isOpen.value = false;
}
</script>

<template>
  <div class="relative">
    <label v-if="label" class="text-xs font-medium text-slate-300">
      {{ label }}
    </label>
    <input
      :value="displayValue"
      class="mt-1 w-full rounded-lg border border-slate-700/80 bg-slate-950/60 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
      type="text"
      placeholder="dd/mm/yyyy"
      readonly
      @click="isOpen = !isOpen"
    />

    <div
      v-if="isOpen"
      class="absolute z-20 mt-2 w-64 rounded-xl border border-slate-700/80 bg-slate-950 p-3 text-xs text-slate-100 shadow-xl"
    >
      <div class="mb-2 flex items-center justify-between">
        <button
          type="button"
          class="rounded-full border border-slate-700/80 bg-slate-900/80 px-2 py-1 text-[10px]"
          @click="prevMonth"
        >
          ‹
        </button>
        <span class="text-[11px] font-medium uppercase tracking-wide text-slate-200">
          {{ monthLabel }}
        </span>
        <button
          type="button"
          class="rounded-full border border-slate-700/80 bg-slate-900/80 px-2 py-1 text-[10px]"
          @click="nextMonth"
        >
          ›
        </button>
      </div>

      <table class="w-full border-collapse text-center text-[10px]">
        <thead class="text-slate-400">
          <tr>
            <th class="py-1">Su</th>
            <th class="py-1">Mo</th>
            <th class="py-1">Tu</th>
            <th class="py-1">We</th>
            <th class="py-1">Th</th>
            <th class="py-1">Fr</th>
            <th class="py-1">Sa</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(week, wi) in weeks" :key="wi">
            <td
              v-for="(day, di) in week"
              :key="di"
              class="h-7 w-7"
            >
              <button
                v-if="day"
                type="button"
                class="inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] hover:bg-sky-600/80"
                @click="selectDay(day)"
              >
                {{ day }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

