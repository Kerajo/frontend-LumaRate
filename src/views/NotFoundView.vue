<script setup>
import { useRouter } from 'vue-router'
import BaseButton from '../components/BaseButton.vue'

const router = useRouter()
</script>

<template>
  <main class="w-full h-screen flex flex-col items-center justify-center">
    <!-- Center wrapper with gap-32 -->
    <div class="flex flex-col items-center text-center mt-[-64px]">
      
      <!-- "head": error image and title -->
      <div class="flex flex-col items-center gap-[24px]">
        <img src="/error.svg" alt="404 Error" class="h-[120px] w-auto object-contain" />
        <h1 class="text-text-light heading-xl font-bold">Упс, ошибка!</h1>
      </div>

      <!-- Description -->
      <p class="text-text-light opacity-80 body-m mt-[32px]">
        Такой страницы не существует, либо она была удалена
      </p>

      <!-- Button with custom shadow effect -->
      <div class="mt-[32px]">
        <BaseButton 
          variant="primary" 
          size="l" 
          @click="router.push('/')"
          style="box-shadow: 0 110px 31px 0 rgba(142, 230, 0, 0.00), 0 70px 28px 0 rgba(142, 230, 0, 0.01), 0 40px 24px 0 rgba(142, 230, 0, 0.05), 0 18px 18px 0 rgba(142, 230, 0, 0.09), 0 4px 10px 0 rgba(142, 230, 0, 0.10);"
        >
          На главную
        </BaseButton>
      </div>

    </div>
  </main>
</template>
