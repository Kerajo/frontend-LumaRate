<script setup>
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import Container from '@/components/Container.vue'
import BaseButton from '@/components/BaseButton.vue'
import AdminImageUpload from '@/components/Admin/AdminImageUpload.vue'

const { accessToken } = useAuth()

const form = ref({
  fullName: '',
  photoUrl: ''
})

const loading = ref(false)
const error = ref(null)
const success = ref(null)

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const handleSubmit = async () => {
  loading.value = true
  error.value = null
  success.value = null

  if (!form.value.photoUrl) {
    error.value = 'Пожалуйста, загрузите фото персоны'
    loading.value = false
    return
  }

  try {
    // 1. Отправляем данные персоны (с путём к фото)
    const response = await fetch(`${API_BASE_URL}/admin/persons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken.value}`
      },
      body: JSON.stringify(form.value)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Ошибка при создании персоны')
    }

    success.value = `Персона "${data.fullName || form.value.fullName}" успешно создана!`
    form.value.fullName = ''
    form.value.photoUrl = ''
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Container>
    <div class="space-y-[40px] animate-in pb-[100px]">
      <div class="flex items-center justify-between flex-wrap gap-[16px]">
        <h1 class="heading-l text-text-light tracking-tight font-bold">Добавление актёров и режиссёров</h1>

        <div v-if="success" class="bg-primary/10 border border-primary/20 text-primary px-[20px] py-[10px] rounded-[10px] body-normal-medium">
          {{ success }}
        </div>
        <div v-if="error" class="bg-error/10 border border-error/20 text-error px-[20px] py-[10px] rounded-[10px] body-normal-medium">
          {{ error }}
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="max-w-[800px] space-y-[32px]">

        <!-- Полное имя -->
        <div class="space-y-[12px]">
          <label class="body-normal-medium text-text-light-secondary ml-[4px]">Полное имя</label>
          <input
            v-model="form.fullName"
            type="text"
            placeholder="Например: Кристофер Нолан"
            class="w-full bg-bg-content border border-white/5 rounded-[12px] px-[24px] py-[18px] text-text-light body-normal-regular focus:outline-none focus:border-primary/40 transition-all placeholder:text-text-light-disabled shadow-sm"
            required
          />
        </div>

        <!-- URL Фото -->
        <AdminImageUpload
          label="Фото персоны"
          variant="square"
          v-model="form.photoUrl"
        />

        <!-- Кнопка отправки -->
        <div class="pt-[20px]">
          <BaseButton
            variant="primary"
            size="l"
            :disabled="loading"
            class="w-full md:w-fit !px-[40px]"
          >
            {{ loading ? 'Создание...' : 'Создать персону' }}
          </BaseButton>
        </div>

      </form>
    </div>
  </Container>
</template>

<style scoped>
.animate-in {
  animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
