<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { register } from "../services/auth.js";
import { errorMessages } from "../services/api.js";

const router = useRouter();
const form = ref({ username: "", email: "", password: "", confirmPassword: "", role: "owner" });
const errors = ref([]);
const loading = ref(false);

async function submit() {
  errors.value = [];
  loading.value = true;
  try {
    await register(form.value);
    router.push("/");
  } catch (err) {
    errors.value = errorMessages(err);   // shows all of Caitlyn's validation messages
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="container" style="max-width: 420px">
    <h1 class="h3 my-4">Create account</h1>

    <div v-if="errors.length" class="alert alert-danger">
      <div v-for="e in errors" :key="e">{{ e }}</div>
    </div>

    <form @submit.prevent="submit">
      <div class="mb-3">
        <label class="form-label">I am a</label>
        <select v-model="form.role" class="form-select">
          <option value="owner">Pet owner</option>
          <option value="sitter">Pet sitter</option>
        </select>
      </div>
      <input v-model="form.username" class="form-control mb-3" placeholder="Username" required />
      <input v-model="form.email" type="email" class="form-control mb-3" placeholder="Email" required />
      <input v-model="form.password" type="password" class="form-control mb-3" placeholder="Password" required />
      <input v-model="form.confirmPassword" type="password" class="form-control mb-3" placeholder="Confirm password" required />
      <button class="btn btn-primary w-100 mb-3" :disabled="loading">Sign up</button>
    </form>

    <span> Already have an account? </span>
    <router-link to="/login" class="link-primary">Log In</router-link>

  </div>
</template>