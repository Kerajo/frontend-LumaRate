<script setup>
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { accessToken } = useAuth()

// Компоненты проекта
import Container from '@/components/Container.vue'
import BaseButton from '@/components/BaseButton.vue'

const form = ref({
  name: '',
  code: ''
})

const loading = ref(false)
const error = ref(null)
const success = ref(null)

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const handleInput = () => {
  form.value.code = form.value.code.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2)
}

const handleSubmit = async () => {
  loading.value = true
  error.value = null
  success.value = null

  try {
    const response = await fetch(`${API_BASE_URL}/admin/countries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken.value}`
      },
      body: JSON.stringify(form.value)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Ошибка при создании страны')
    }

    success.value = `Страна "${data.name}" успешно создана!`
    form.value.name = ''
    form.value.code = ''
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Container>
    <div class="space-y-[40px] animate-in fade-in slide-in-from-bottom-4 duration-700 pb-[100px]">
      <div class="flex items-center justify-between">
        <h1 class="heading-l text-text-light tracking-tight font-bold">Добавление страны</h1>
        
        <div v-if="success" class="bg-primary/10 border border-primary/20 text-primary px-[20px] py-[10px] rounded-[10px] body-normal-medium">
          {{ success }}
        </div>
        <div v-if="error" class="bg-error/10 border border-error/20 text-error px-[20px] py-[10px] rounded-[10px] body-normal-medium">
          {{ error }}
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="max-w-[800px] space-y-[32px]">
        
        <!-- Название -->
        <div class="space-y-[12px]">
          <label class="body-normal-medium text-text-light-secondary ml-[4px]">Название страны</label>
          <input 
            v-model="form.name"
            type="text" 
            placeholder="Например: США"
            class="w-full bg-bg-content border border-white/5 rounded-[12px] px-[24px] py-[18px] text-text-light body-normal-regular focus:outline-none focus:border-primary/40 transition-all placeholder:text-text-light-disabled shadow-sm"
            required
          />
        </div>

        <!-- Код -->
        <div class="space-y-[12px]">
          <label class="body-normal-medium text-text-light-secondary ml-[4px]">Код страны (ISO 2-letter)</label>
          <input 
            v-model="form.code"
            @input="handleInput"
            type="text" 
            placeholder="Например: US"
            maxlength="2"
            class="w-full bg-bg-content border border-white/5 rounded-[12px] px-[24px] py-[18px] text-text-light body-normal-regular focus:outline-none focus:border-primary/40 transition-all placeholder:text-text-light-disabled shadow-sm"
            required
          />
          <p class="body-small-regular text-text-light-disabled ml-1">Автоматически преобразуется в верхний регистр</p>
        </div>

        <!-- Кнопка отправки -->
        <div class="pt-[20px]">
          <BaseButton 
            variant="primary" 
            size="l"
            :disabled="loading"
            class="w-full md:w-fit !px-[40px]"
          >
            {{ loading ? 'Создание...' : 'Создать страну' }}
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
