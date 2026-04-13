<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import Container from '@/components/Container.vue'
import BaseButton from '@/components/BaseButton.vue'
import IconEdit from '@/components/icons/IconEdit.vue'
import { getFullImageUrl } from '@/utils/url'

const router = useRouter()
const { accessToken } = useAuth()
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const items = ref([])
const loading = ref(true) 
const isSearching = ref(false) 
const error = ref(null)
const searchQuery = ref('')
let searchTimeout = null

const fetchItems = async (isInitial = false) => {
  if (isInitial) loading.value = true
  else isSearching.value = true
  
  try {
    const url = new URL(`${API_BASE_URL}/admin/contents`)
    // Пробуем и search и q (некоторые бэкенды используют q)
    if (searchQuery.value) {
      url.searchParams.append('search', searchQuery.value)
    }
    url.searchParams.append('limit', '100') // Берем побольше для локальной фильтрации
    
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${accessToken.value}`
      }
    })
    
    if (!response.ok) throw new Error('Ошибка при загрузке списка контента')
    const data = await response.json()
    items.value = data.data || []
  } catch (err) {
    console.error('Fetch error:', err)
    error.value = err.message
  } finally {
    loading.value = false
    isSearching.value = false
  }
}

// Локальный фильтр (дает мгновенную реакцию до того как придет ответ от бэка)
const filteredItems = computed(() => {
  if (!searchQuery.value) return items.value
  const q = searchQuery.value.toLowerCase()
  return items.value.filter(item => 
    item.title?.toLowerCase().includes(q) || 
    item.originalTitle?.toLowerCase().includes(q) ||
    item.slug?.toLowerCase().includes(q)
  )
})

watch(searchQuery, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchItems()
  }, 300) // Уменьшил до 300ms для отзывчивости
})

const deleteItem = async (id, title) => {
  if (!confirm(`Вы уверены, что хотите удалить "${title}"?`)) return
  
  try {
    const response = await fetch(`${API_BASE_URL}/admin/contents/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken.value}`
      }
    })
    if (!response.ok) throw new Error('Ошибка при удалении')
    
    items.value = items.value.filter(item => item.id !== id)
  } catch (err) {
    alert(err.message)
  }
}

onMounted(() => fetchItems(true))
</script>

<template>
  <Container>
    <div class="space-y-[40px] animate-in fade-in slide-in-from-bottom-4 duration-700 pb-[100px]">
      <div class="flex items-center justify-between flex-wrap gap-[24px]">
        <h1 class="heading-l text-text-light tracking-tight font-bold">Управление контентом</h1>
        
        <BaseButton variant="primary" size="m" @click="router.push('/admin/content/add')">
          Добавить контент
        </BaseButton>
      </div>

      <!-- Поиск -->
      <div class="relative group">
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Поиск по названию или ссылке..."
          class="w-full bg-bg-content border border-white/5 rounded-[12px] px-[24px] py-[16px] text-text-light body-normal-regular focus:outline-none focus:border-primary/40 transition-all placeholder:text-text-light-disabled shadow-sm"
        />
        <div v-if="isSearching" class="absolute right-[24px] top-1/2 -translate-y-1/2">
           <div class="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      </div>

      <!-- Контейнер таблицы с фиксированной минимальной высотой для борьбы с прыжками -->
      <div class="relative bg-bg-content border border-white/5 rounded-[24px] overflow-hidden shadow-2xl min-h-[600px]">
        
        <!-- Загрузка (абсолютное позиционирование поверх контента) -->
        <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-bg-content z-30">
          <div class="text-center space-y-4">
            <div class="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
            <p class="text-text-light/40 body-normal-medium">Загрузка данных...</p>
          </div>
        </div>

        <!-- Если ничего не найдено -->
        <div v-else-if="filteredItems.length === 0" class="absolute inset-0 flex flex-col items-center justify-center p-20 text-center text-text-light/40 z-20">
          <div class="space-y-6">
            <div class="text-7xl opacity-10">🔍</div>
            <div class="space-y-2">
              <p class="heading-s text-text-light/60">Ничего не найдено</p>
              <p class="body-small-regular text-text-light-disabled">По запросу "{{ searchQuery }}" результатов нет</p>
            </div>
            <BaseButton v-if="searchQuery" variant="tertiary" size="s" @click="searchQuery = ''">
              Сбросить поиск
            </BaseButton>
          </div>
        </div>

        <!-- Основная таблица -->
        <table class="w-full text-left border-collapse transition-all duration-300" :class="{ 'opacity-30 grayscale-[0.5]': isSearching }">
          <thead>
            <tr class="border-b border-white/5 bg-white/[0.01]">
              <th class="px-[32px] py-[24px] label-normal font-bold text-text-light-disabled uppercase tracking-wider w-[100px]">Постер</th>
              <th class="px-[32px] py-[24px] label-normal font-bold text-text-light-disabled uppercase tracking-wider">Название</th>
              <th class="px-[32px] py-[24px] label-normal font-bold text-text-light-disabled uppercase tracking-wider">Тип</th>
              <th class="px-[32px] py-[24px] label-normal font-bold text-text-light-disabled uppercase tracking-wider">Год</th>
              <th class="px-[32px] py-[24px] label-normal font-bold text-text-light-disabled uppercase tracking-wider">Статус</th>
              <th class="px-[32px] py-[24px] label-normal font-bold text-text-light-disabled uppercase tracking-wider text-right">Управление</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            <tr 
              v-for="item in filteredItems" 
              :key="item.id" 
              class="hover:bg-white/[0.02] transition-colors group"
            >
              <td class="px-[32px] py-[16px]">
                <div class="w-[48px] h-[68px] bg-white/5 rounded-[8px] overflow-hidden border border-white/10 relative">
                  <img 
                    v-if="item.posterUrl"
                    :src="getFullImageUrl(item.posterUrl)" 
                    class="w-full h-full object-cover" 
                    alt="" 
                  />
                  <div v-else class="absolute inset-0 flex items-center justify-center opacity-20">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </div>
                </div>
              </td>
              <td class="px-[32px] py-[16px]">
                <div class="flex flex-col gap-1">
                  <span class="body-medium-medium text-text-light">{{ item.title }}</span>
                  <span class="body-small-regular text-text-light-disabled truncate max-w-[200px]">
                    {{ item.originalTitle || item.slug }}
                  </span>
                </div>
              </td>
              <td class="px-[32px] py-[16px]">
                <span class="px-2 py-1 bg-white/5 rounded text-[10px] font-bold text-text-light-secondary opacity-60 uppercase">
                  {{ item.type }}
                </span>
              </td>
              <td class="px-[32px] py-[16px] body-normal-medium text-text-light/80">
                {{ item.year }}
              </td>
              <td class="px-[32px] py-[16px]">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full" :class="item.isPublished ? 'bg-success shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-warning shadow-[0_0_8px_rgba(234,179,8,0.4)]'"></div>
                  <span class="body-small-medium" :class="item.isPublished ? 'text-success' : 'text-warning'">
                    {{ item.isPublished ? 'Активен' : 'Черновик' }}
                  </span>
                </div>
              </td>
              <td class="px-[32px] py-[16px]">
                <div class="flex items-center justify-end gap-[12px] opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                  <button 
                    @click="router.push(`/admin/content/edit/${item.id}`)"
                    class="p-[10px] bg-white/5 hover:bg-primary/20 text-text-light-secondary hover:text-primary rounded-[10px] transition-all"
                  >
                    <IconEdit class="w-[18px] h-[18px]" />
                  </button>
                  <button 
                    @click="deleteItem(item.id, item.title)"
                    class="p-[10px] bg-white/5 hover:bg-error/20 text-text-light-secondary hover:text-error rounded-[10px] transition-all"
                  >
                    <svg class="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </Container>
</template>

<style scoped>
.divide-y > :not([hidden]) ~ :not([hidden]) {
  border-top-width: 1px;
}

.animate-in {
  animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
