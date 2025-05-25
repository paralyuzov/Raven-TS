<script lang="ts" setup>
import { useForm, useField } from "vee-validate";
import { loginSchema } from "../validation/LoginSchema";
import { ref } from "vue";
import InputField from "./ui/InputField.vue";
import { useAuthStore } from "../store/auth";
import { useToastStore } from "../store/toast";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const toastStore = useToastStore();
const router = useRouter();
const serverError = ref("");
const rememberMe = ref(false);

const { handleSubmit, errors, meta } = useForm({
  validationSchema: loginSchema,
  initialValues: {
    identifier: "",
    password: "",
  },
});

const { value: identifier, handleBlur: blurEmail } = useField<string>("identifier");
const { value: password, handleBlur: blurPassword } = useField<string>("password");

const onSubmit = handleSubmit(async (values) => {
  try {
    serverError.value = "";
    const {...userData} = values;
     await authStore.login(userData);
    
    toastStore.info("Login successful! Welcome back.");
    router.push("/contacts");
    
  } catch (error) {
    serverError.value = authStore.error || "Login failed. Please try again.";
    toastStore.error(serverError.value, 5000);
  }
});
</script>

<template>
  <div class="w-full max-w-md mx-auto">
    <h2 class="text-2xl font-bold text-white mb-8 text-center">
      Sign In
    </h2>

    <div
      v-if="serverError"
      class="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl backdrop-blur-sm"
    >
      <div class="flex items-start">
        <svg
          class="h-5 w-5 mr-2 mt-0.5 text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>{{ serverError }}</span>
      </div>
    </div>

    <form @submit.prevent="onSubmit" class="space-y-6">
      <InputField
        id="identifier"
        label="Email Address"
        type="email"
        v-model="identifier"
        :error="errors.identifier"
        placeholder="Enter your email"
        @blur="blurEmail"
        icon="envelope"
        theme="dark"
      />

      <InputField
        id="password"
        label="Password"
        type="password"
        v-model="password"
        :error="errors.password"
        placeholder="Enter your password"
        @blur="blurPassword"
        icon="lock"
        theme="dark"
      />

      <div class="flex items-center justify-between text-sm">
        <div class="flex items-center">
          <input
            id="remember"
            type="checkbox"
            v-model="rememberMe"
            class="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500/30 focus:ring-offset-gray-800"
          />
          <label for="remember" class="ml-2 block text-gray-300">
            Remember me
          </label>
        </div>

        <div class="text-right">
          <a
            href="#"
            class="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Forgot password?
          </a>
        </div>
      </div>

      <div class="pt-2">
        <button
          type="submit"
          class="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 disabled:opacity-70 disabled:cursor-not-allowed"
          :disabled="!meta.valid || authStore.loading"
        >
          <div class="flex items-center justify-center">
            <svg
              v-if="authStore.loading"
              class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>{{ authStore.loading ? "Signing in..." : "Sign In" }}</span>
          </div>
        </button>
      </div>
    </form>
  </div>
</template>
