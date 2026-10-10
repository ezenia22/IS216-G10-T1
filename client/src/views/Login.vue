<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { login } from "../services/auth.js";
import { errorMessages } from "../services/api.js";

const router = useRouter();
const route = useRoute();
const form = ref({ email: "", password: "" });
const message = ref("");
const loading = ref(false);

async function submit() {
  message.value = "";
  loading.value = true;
  try {
    await login(form.value);
    router.push(route.query.redirect || "/");   // back to the page they wanted
  } catch (err) {
    message.value = errorMessages(err)[0];
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="container" style="max-width: 420px">
    <h1 class="h3 mt-4">Log In</h1>
    <p>Welcome back</p>

    <div v-if="message" class="alert alert-danger">
      <div> {{ message }} </div>
    </div>

    <form @submit.prevent="submit">
      <!-- <input v-model="form.username" class="form-control mb-3" placeholder="Username" required /> -->
      <input v-model="form.email" type="email" class="form-control mb-3" placeholder="Email" required />
      <input v-model="form.password" type="password" class="form-control mb-3" placeholder="Password" required />
      <button class="btn btn-primary w-100 mb-3" :disabled="loading">Log In</button>
    </form>

    <span> Don't have an account? </span>
    <router-link to="/register" class="link-primary">Create One</router-link>

  </div>
</template>