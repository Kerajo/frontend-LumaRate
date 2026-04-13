<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import BaseButton from '../components/BaseButton.vue'

const router = useRouter()
const { currentUser, logout } = useAuth()

const handleLogout = async () => {
  await logout()
  router.push('/')
}
</script>

<template>
  <main class="w-full flex-grow pt-[160px] pb-[64px] flex justify-center text-text-light min-h-[50vh]">
    <div class="flex flex-col gap-[24px] text-center w-full max-w-[536px]">
      <h1 class="heading-xl font-bold">Мой профиль</h1>
      
      <div v-if="currentUser" class="bg-bg-content p-[32px] rounded-[16px] flex flex-col gap-[16px] items-center text-center">
        <!-- Аватарка (заглушка) -->
        <div class="w-[120px] h-[120px] rounded-full bg-primary flex items-center justify-center text-white heading-l">
          {{ currentUser.username.charAt(0).toUpperCase() }}
        </div>
        
        <p class="heading-m">Вы вошли как: <strong class="text-primary">{{ currentUser.username }}</strong></p>
        
        <p class="body-m opacity-60">Здесь в будущем будут ваши настройки, избранные фильмы и история оценок.</p>

        <BaseButton variant="error" size="m" class="w-full mt-[16px]" @click="handleLogout">
          Выйти из аккаунта
        </BaseButton>
      </div>
      
      <div v-else class="bg-bg-content p-[32px] rounded-[16px]">
        <p class="body-m text-[#FF3B30]">Вы не авторизованы. Пожалуйста, войдите в систему.</p>
      </div>
    </div>
  </main>
</template>
