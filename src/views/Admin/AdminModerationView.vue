<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'

// Компоненты проекта
import Container from '@/components/Container.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseModal from '@/components/BaseModal.vue'
import BaseNotification from '@/components/BaseNotification.vue'
import StarRating from '@/components/StarRating.vue'

const { accessToken } = useAuth()
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const activeTab = ref('reviews') // 'reviews' or 'recensions'
const items = ref([])
const loading = ref(false)
const error = ref(null)

// Reject modal state
const showRejectModal = ref(false)
const rejectReason = ref('Нарушение правил')
const rejectTargetId = ref(null)

// Notification
const notification = ref({ show: false, message: '', type: 'success' })
const showNotification = (message, type = 'success') => {
  notification.value = { show: true, message, type }
}

const fetchQueue = async () => {
  loading.value = true
  error.value = null
  try {
    const endpoint = activeTab.value === 'reviews' ? 'moderation/reviews' : 'moderation/recensions'
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      headers: { 'Authorization': `Bearer ${accessToken.value}` }
    })
    const data = await response.json()
    if (response.ok) {
      items.value = data.data
    } else {
      throw new Error(data.message || 'Ошибка загрузки очереди')
    }
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(fetchQueue)

const handleTabChange = (tab) => {
  activeTab.value = tab
  items.value = []
  fetchQueue()
}

const approveItem = async (id) => {
  try {
    const endpoint = activeTab.value === 'reviews' ? 'moderation/reviews' : 'moderation/recensions'
    const response = await fetch(`${API_BASE_URL}/${endpoint}/${id}/approve`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken.value}` }
    })
    if (response.ok) {
      items.value = items.value.filter(item => item.id !== id)
      showNotification('Одобрено и опубликовано!', 'success')
    } else {
      const data = await response.json()
      showNotification(data.message || 'Ошибка одобрения', 'error')
    }
  } catch (err) {
    console.error(err)
  }
}

const rejectItem = (id) => {
  rejectTargetId.value = id
  rejectReason.value = 'Нарушение правил'
  showRejectModal.value = true
}

const confirmReject = async () => {
  const id = rejectTargetId.value
  if (!id) return

  try {
    const endpoint = activeTab.value === 'reviews' ? 'moderation/reviews' : 'moderation/recensions'
    const response = await fetch(`${API_BASE_URL}/${endpoint}/${id}/reject`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${accessToken.value}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reason: rejectReason.value })
    })
    if (response.ok) {
      items.value = items.value.filter(item => item.id !== id)
      showRejectModal.value = false
      showNotification('Заявка отклонена', 'error')
    } else {
      const data = await response.json()
      showNotification(data.message || 'Ошибка отклонения', 'error')
    }
  } catch (err) {
    console.error(err)
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  // toLocaleDateString в ru-RU уже добавляет "г." при year: numeric
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}
</script>

<template>
  <Container>
    <div class="space-y-[40px] animate-in fade-in slide-in-from-bottom-4 duration-700 pb-[100px]">
      <div class="flex items-center justify-between">
        <h1 class="heading-l text-text-light tracking-tight font-bold">Модерация контента</h1>
        
        <!-- Tabs -->
        <div class="flex bg-white/5 p-[4px] rounded-[12px] border border-white/5">
          <button 
            @click="handleTabChange('reviews')"
            :class="['px-[24px] py-[10px] rounded-[10px] body-normal-medium transition-all', activeTab === 'reviews' ? 'bg-primary text-text-dark font-bold shadow-lg' : 'text-text-light-disabled hover:text-text-light']"
          >
            Отзывы
          </button>
          <button 
            @click="handleTabChange('recensions')"
            :class="['px-[24px] py-[10px] rounded-[10px] body-normal-medium transition-all', activeTab === 'recensions' ? 'bg-primary text-text-dark font-bold shadow-lg' : 'text-text-light-disabled hover:text-text-light']"
          >
            Рецензии
          </button>
        </div>
      </div>

      <div v-if="error" class="bg-error/10 border border-error/20 text-error p-[20px] rounded-[16px]">
        {{ error }}
      </div>

      <!-- Queue List -->
      <div v-if="items.length > 0" class="grid grid-cols-1 gap-[24px]">
        <div 
          v-for="item in items" 
          :key="item.id"
          class="bg-bg-content border border-white/5 rounded-[24px] p-[32px] flex flex-col gap-[24px] shadow-2xl hover:border-primary/20 transition-all group"
        >
          <!-- Header -->
          <div class="flex justify-between items-start">
            <div class="flex gap-[20px] items-center">
              <div class="w-[56px] h-[56px] rounded-full overflow-hidden border border-white/10 shrink-0">
                <img src="/author.png" alt="Avatar" class="w-full h-full object-cover" />
              </div>
              <div class="flex flex-col gap-[4px]">
                <h3 class="body-medium-medium text-text-light font-bold flex items-center gap-[8px]">
                  {{ item.author?.login || 'Пользователь' }}
                  <span v-if="item.author?.role === 'EXPERT'" class="label-normal bg-primary/10 text-primary px-[8px] py-[2px] rounded uppercase tracking-wider">Expert</span>
                </h3>
                <div class="flex items-center gap-[12px]">
                  <StarRating v-if="activeTab === 'reviews'" :modelValue="item.rating || 0" readonly :size="16" />
                  <span class="text-text-light-disabled/40">•</span>
                  <span class="text-text-light-secondary body-small-medium">{{ formatDate(item.createdAt || item.publishedAt) }}</span>
                </div>
                <div class="body-small-medium text-primary/60">К фильму: <span class="text-text-light-secondary">{{ item.content?.title }}</span></div>
              </div>
            </div>
          </div>

          <!-- Body -->
          <div class="flex flex-col gap-[12px]">
            <h4 v-if="item.title" class="heading-s text-text-light font-bold">{{ item.title }}</h4>
            <p v-if="item.textPreview || item.text" class="body-normal-regular text-text-light-secondary leading-relaxed whitespace-pre-wrap">{{ item.textPreview || item.text }}</p>
          </div>

          <!-- Actions -->
          <div class="flex gap-[16px] pt-[8px]">
            <BaseButton 
              variant="primary" 
              size="m" 
              class="font-bold px-[32px]"
              @click="approveItem(item.id)"
            >
              Одобрить
            </BaseButton>
            <BaseButton 
              variant="error" 
              size="m" 
              class="font-bold px-[32px]"
              @click="rejectItem(item.id)"
            >
              Отклонить
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!loading" class="flex flex-col items-center justify-center py-[100px] text-center gap-[16px]">
        <div class="w-[80px] h-[80px] bg-white/5 rounded-full flex items-center justify-center text-text-light-disabled/20">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="flex flex-col gap-[4px]">
          <h2 class="heading-m text-text-light">Очередь пуста</h2>
          <p class="body-normal-regular text-text-light-disabled">На данный момент нет новых {{ activeTab === 'reviews' ? 'отзывов' : 'рецензий' }} для проверки.</p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col gap-[24px]">
        <div v-for="i in 3" :key="i" class="h-[250px] bg-bg-content border border-white/5 rounded-[24px] animate-pulse"></div>
      </div>
    </div>
  </Container>

  <!-- Reject Modal -->
  <BaseModal
    :show="showRejectModal"
    title="Отклонить заявку"
    @close="showRejectModal = false"
  >
    <div class="space-y-[24px] py-[8px]">
      <div class="space-y-[10px]">
        <label class="body-normal-medium text-text-light-secondary">Укажите причину отклонения</label>
        <input
          v-model="rejectReason"
          type="text"
          placeholder="Например: Нарушение правил сообщества"
          class="w-full bg-bg-content border border-white/5 rounded-[12px] px-[24px] py-[16px] text-text-light body-normal-regular focus:outline-none focus:border-error/40 transition-all placeholder:text-text-light-disabled"
          @keyup.enter="confirmReject"
        />
      </div>
      <div class="flex gap-[16px] pt-[8px]">
        <BaseButton variant="error" size="m" class="flex-grow" @click="confirmReject">Отклонить</BaseButton>
        <BaseButton variant="tertiary" size="m" class="!px-[32px]" @click="showRejectModal = false">Отмена</BaseButton>
      </div>
    </div>
  </BaseModal>

  <BaseNotification
    :show="notification.show"
    :message="notification.message"
    :type="notification.type"
    @close="notification.show = false"
  />
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
