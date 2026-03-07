import { createApp } from "vue";
import { createPinia } from "pinia";
import "./style.css";
import "@vuepic/vue-datepicker/dist/main.css";
import App from "./App.vue";
import { useAuthStore } from "./stores/auth";
import { createAppRouter } from "./router";

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);

const auth = useAuthStore();
auth.init();

const router = createAppRouter({ authStore: auth });
app.use(router);

app.mount("#app");
