<script setup>
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { accessToken } = useAuth()

// Компоненты проекта
import Container from '@/components/Container.vue'
import BaseButton from '@/components/BaseButton.vue'

const form = ref({
  name: '',
  slug: ''
})

const loading = ref(false)
const error = ref(null)
const success = ref(null)

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const slugify = (text) => {
  const map = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ь': '', 'ы': 'y', 'ъ': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
  };
  
  return text.toString().toLowerCase().trim()
    .split('')
    .map(char => map[char] || char)
    .join('')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const handleInput = () => {
  form.value.slug = slugify(form.value.name)
}

const handleSubmit = async () => {
  loading.value = true
  error.value = null
  success.value = null

  try {
    const response = await fetch(`${API_BASE_URL}/admin/genres`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken.value}`
      },
      body: JSON.stringify(form.value)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Ошибка при создании жанра')
    }

    success.value = `Жанр "${data.name}" успешно создан!`
    form.value.name = ''
    form.value.slug = ''
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
        <h1 class="heading-l text-text-light tracking-tight font-bold">Добавление жанра</h1>
        
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
          <label class="body-normal-medium text-text-light-secondary ml-[4px]">Название жанра</label>
          <input 
            v-model="form.name"
            @input="handleInput"
            type="text" 
            placeholder="Например: Фантастика"
            class="w-full bg-bg-content border border-white/5 rounded-[12px] px-[24px] py-[18px] text-text-light body-normal-regular focus:outline-none focus:border-primary/40 transition-all placeholder:text-text-light-disabled shadow-sm"
            required
          />
        </div>

        <!-- Slug -->
        <div class="space-y-[12px]">
          <label class="body-normal-medium text-text-light-secondary ml-[4px]">Slug (уникальный идентификатор)</label>
          <input 
            v-model="form.slug"
            type="text" 
            placeholder="fantastika"
            class="w-full bg-bg-content border border-white/5 rounded-[12px] px-[24px] py-[18px] text-text-light body-normal-regular focus:outline-none focus:border-primary/40 transition-all placeholder:text-text-light-disabled shadow-sm"
            required
          />
        </div>

        <!-- Кнопка отправки -->
        <div class="pt-[20px]">
          <BaseButton 
            variant="primary" 
            size="l"
            :disabled="loading"
            class="w-full md:w-fit !px-[40px]"
          >
            {{ loading ? 'Создание...' : 'Создать жанр' }}
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
