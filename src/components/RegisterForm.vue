<script lang="ts" setup>
import { useForm, useField } from 'vee-validate';
import { registerSchema } from '../validation/RegisterSchema';
import { ref } from 'vue';
import InputField from './ui/InputField.vue';
import { useAuthStore } from '../store/auth';
import { useToastStore } from '../store/toast';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const toastStore = useToastStore();
const router = useRouter();
const serverError = ref('');

const { handleSubmit, errors, meta } = useForm({
    validationSchema: registerSchema,
    initialValues: {
        firstName: '',
        lastName: '',
        nickname: '',
        email: '',
        password: '',
        confirmPassword: ''
    },
});

const { value: firstName, handleBlur: blurFirstName } = useField<string>('firstName');
const { value: lastName, handleBlur: blurLastName } = useField<string>('lastName');
const { value: nickname, handleBlur: blurNickname } = useField<string>('nickname');
const { value: email, handleBlur: blurEmail } = useField<string>('email');
const { value: password, handleBlur: blurPassword } = useField<string>('password');
const { value: confirmPassword, handleBlur: blurConfirmPassword } = useField<string>('confirmPassword');

const onSubmit = handleSubmit(async (values) => {
    try {
        serverError.value = '';
        const { confirmPassword: _, ...userData } = values;
        await authStore.register(userData);

        toastStore.success('Account created successfully!', 3000);


        router.push('/login');


    } catch (error) {
        serverError.value = authStore.error || 'Registration failed. Please try again.';

        toastStore.error(authStore.error || 'Registration failed. Please try again.', 5000);
    }
});
</script>

<template>
    <div class="w-full max-w-md mx-auto">
        <h2 class="text-2xl font-bold text-white mb-8 text-center">
            Create Your Account
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

        <form @submit.prevent="onSubmit" class="space-y-5">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField id="firstName" label="First Name" v-model="firstName" :error="errors.firstName"
                    placeholder="Enter your first name" @blur="blurFirstName" theme="dark" />

                <InputField id="lastName" label="Last Name" v-model="lastName" :error="errors.lastName"
                    placeholder="Enter your last name" @blur="blurLastName" theme="dark" />
            </div>

            <InputField id="nickname" label="Nickname" v-model="nickname" :error="errors.nickname"
                placeholder="Choose a nickname" @blur="blurNickname" theme="dark" icon="user" />

            <InputField id="email" label="Email Address" type="email" v-model="email" :error="errors.email"
                placeholder="your.email@example.com" @blur="blurEmail" theme="dark" icon="envelope" />

            <InputField id="password" label="Password" type="password" v-model="password" :error="errors.password"
                placeholder="Create a strong password" @blur="blurPassword" theme="dark" icon="lock" />

            <InputField id="confirmPassword" label="Confirm Password" type="password" v-model="confirmPassword"
                :error="errors.confirmPassword" placeholder="Confirm your password" @blur="blurConfirmPassword"
                theme="dark" icon="lock" />

            <div class="pt-2">
                <button type="submit"
                    class="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 disabled:opacity-70 disabled:cursor-not-allowed"
                    :disabled="!meta.valid || authStore.loading">
                    <div class="flex items-center justify-center">
                        <svg v-if="authStore.loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                            </circle>
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                            </path>
                        </svg>
                        <span>{{ authStore.loading ? 'Creating account...' : 'Sign Up' }}</span>
                    </div>
                </button>
            </div>
        </form>
    </div>
</template>