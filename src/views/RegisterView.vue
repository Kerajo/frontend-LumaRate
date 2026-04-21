<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import BaseButton from '../components/BaseButton.vue'

const router = useRouter()
const { register } = useAuth()

const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')

const handleRegister = async () => {
  // 1. Проверка пустоты
  if (!username.value || !password.value || !confirmPassword.value) {
    errorMessage.value = 'Пожалуйста, заполните все поля'
    return
  }

  // 1.5. Формат логина
  const loginRegex = /^[a-z0-9_.-]{3,50}$/
  if (!loginRegex.test(username.value)) {
    errorMessage.value = 'Логин: 3-50 символов (строчные латинские буквы, цифры, _, ., -)'
    return
  }

  // 2. Требования к паролю
  const specialCharsRegex = /[!@#$%^&*(),.?":{}|<>]/
  if (password.value.length < 8 || !specialCharsRegex.test(password.value)) {
    errorMessage.value = 'Пароль должен содержать минимум 8 символов и спецсимволы (!@# и т.д.)'
    return
  }

  // 3. Совпадение паролей
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Пароли не совпадают'
    return
  }

  // Регистрация
  const res = await register(username.value, password.value)
  if (!res.success) {
    errorMessage.value = res.error
    return
  }

  errorMessage.value = ''
  router.push('/')
}
</script>

<template>
  <main class="w-full min-h-screen flex items-center justify-center relative bg-bg-body">
    <!-- Background Image with Gradient Overlay -->
    <div class="absolute inset-0">
      <img src="/authbg.jpg" alt="Background" class="w-full h-full object-cover opacity-50" />
      <div class="absolute inset-0 bg-gradient-to-t from-bg-body via-transparent to-bg-body"></div>
      <div class="absolute inset-0 bg-black/40"></div>
    </div>

    <!-- Auth Block -->
    <div
      class="relative z-10 w-[536px] bg-bg-content rounded-[16px] p-[32px] flex flex-col gap-[32px] shadow-2xl"
    >
      <!-- Head -->
      <div class="flex flex-col items-center text-center gap-[8px]">
        <h1 class="text-text-light heading-l font-bold">Регистрация</h1>
        <p class="text-text-light opacity-60 body-m max-w-[320px]">
          Создайте аккаунт, указав логин, пароль<br />и подтвердив его
        </p>
      </div>

      <!-- Content (Inputs) -->
      <div class="flex flex-col gap-[16px]">
        <input
          v-model="username"
          type="text"
          placeholder="Логин"
          :class="[
            'w-full bg-bg-body text-text-light body-m p-[20px] rounded-[8px] outline-none border transition-colors placeholder:opacity-50',
            errorMessage && errorMessage === 'Пожалуйста, заполните все поля' && !username
              ? 'border-[#FF3B30]'
              : 'border-transparent focus:border-primary/50',
          ]"
          @keyup.enter="handleRegister"
        />
        <input
          v-model="password"
          type="password"
          placeholder="Пароль"
          :class="[
            'w-full bg-bg-body text-text-light body-m p-[20px] rounded-[8px] outline-none border transition-colors placeholder:opacity-50',
            errorMessage &&
            (errorMessage.includes('Пароль') ||
              errorMessage.includes('Пароли') ||
              (errorMessage === 'Пожалуйста, заполните все поля' && !password))
              ? 'border-[#FF3B30]'
              : 'border-transparent focus:border-primary/50',
          ]"
          @keyup.enter="handleRegister"
        />
        <input
          v-model="confirmPassword"
          type="password"
          placeholder="Подтвердите пароль"
          :class="[
            'w-full bg-bg-body text-text-light body-m p-[20px] rounded-[8px] outline-none border transition-colors placeholder:opacity-50',
            errorMessage &&
            (errorMessage.includes('Пароли') ||
              (errorMessage === 'Пожалуйста, заполните все поля' && !confirmPassword))
              ? 'border-[#FF3B30]'
              : 'border-transparent focus:border-primary/50',
          ]"
          @keyup.enter="handleRegister"
        />
        <div v-if="errorMessage" class="text-[#FF3B30] body-m px-[4px]">
          {{ errorMessage }}
        </div>
      </div>

      <!-- Footer (Buttons) -->
      <div class="flex flex-col gap-[16px]">
        <BaseButton variant="primary" size="m" class="w-full justify-center" @click="handleRegister"
          >Создать</BaseButton
        >
        <BaseButton
          variant="tertiary"
          size="m"
          class="w-full justify-center"
          @click="router.push('/login')"
        >
          Уже есть аккаунт
        </BaseButton>
      </div>
    </div>
  </main>
</template>
