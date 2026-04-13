<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import BaseButton from '../components/BaseButton.vue'

const router = useRouter()
const { login } = useAuth()

const username = ref('')
const password = ref('')
const errorMessage = ref('')

const handleLogin = async () => {
  if (!username.value || !password.value) {
    errorMessage.value = 'Пожалуйста, заполните все поля'
    return
  }
  
  const res = await login(username.value, password.value)
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
        <h1 class="text-text-light heading-l font-bold">Авторизация</h1>
        <p class="text-text-light opacity-60 body-m">Войдите в аккаунт, используя логин и пароль</p>
      </div>

      <!-- Content (Inputs) -->
      <div class="flex flex-col gap-[16px]">
        <input
          v-model="username"
          type="text"
          placeholder="Логин"
          :class="['w-full bg-bg-body text-text-light body-m p-[20px] rounded-[8px] outline-none border transition-colors placeholder:opacity-50', errorMessage ? 'border-[#FF3B30]' : 'border-transparent focus:border-primary/50']"
          @keyup.enter="handleLogin"
        />
        <input
          v-model="password"
          type="password"
          placeholder="Пароль"
          :class="['w-full bg-bg-body text-text-light body-m p-[20px] rounded-[8px] outline-none border transition-colors placeholder:opacity-50', errorMessage ? 'border-[#FF3B30]' : 'border-transparent focus:border-primary/50']"
          @keyup.enter="handleLogin"
        />
        <div v-if="errorMessage" class="text-[#FF3B30] body-m px-[4px]">
          {{ errorMessage }}
        </div>
        <a href="#" class="text-text-light opacity-60 hover:opacity-100 transition-opacity body-m w-fit mt-[4px]"
          >Не помню пароль</a
        >
      </div>

      <!-- Footer (Buttons) -->
      <div class="flex flex-col gap-[16px]">
        <BaseButton variant="primary" size="m" class="w-full justify-center" @click="handleLogin">Войти</BaseButton>
        <BaseButton
          variant="tertiary"
          size="m"
          class="w-full justify-center"
          @click="router.push('/register')"
          >Создать аккаунт</BaseButton
        >
      </div>
    </div>
  </main>
</template>
