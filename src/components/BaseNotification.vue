<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  message: { type: String, default: '' },
  type: { type: String, default: 'success' }, // 'success', 'error', 'info'
  duration: { type: Number, default: 3000 }
})

const emit = defineEmits(['close'])

const progress = ref(100)
let timer = null
let progressTimer = null

const startTimers = () => {
  if (timer) clearTimeout(timer)
  if (progressTimer) clearInterval(progressTimer)
  
  progress.value = 100
  const step = 100 / (props.duration / 10)
  
  progressTimer = setInterval(() => {
    progress.value -= step
    if (progress.value <= 0) {
      clearInterval(progressTimer)
    }
  }, 10)

  timer = setTimeout(() => {
    emit('close')
  }, props.duration)
}

onMounted(() => {
  if (props.show) startTimers()
})

onUnmounted(() => {
  if (timer) clearTimeout(timer)
  if (progressTimer) clearInterval(progressTimer)
})

// Watch show to restart timers
import { watch } from 'vue'
watch(() => props.show, (newVal) => {
  if (newVal) startTimers()
})
</script>

<template>
  <Transition name="notification">
    <div 
      v-if="show"
      class="fixed top-[40px] right-[40px] z-[9999] min-w-[320px] max-w-[400px] overflow-hidden rounded-[16px] border border-white/5 bg-[#1a1a1a]/80 py-[20px] px-[24px] shadow-2xl backdrop-blur-xl"
    >
      <div class="flex items-center gap-[16px]">
        <!-- Success Icon -->
        <div 
          v-if="type === 'success'"
          class="flex h-[32px] min-w-[32px] items-center justify-center rounded-full bg-primary/20 text-primary"
        >
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 7L5 11L15 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        
        <!-- Error Icon -->
        <div 
          v-else-if="type === 'error'"
          class="flex h-[32px] min-w-[32px] items-center justify-center rounded-full bg-error/20 text-error"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 1L1 13M1 1L13 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>

        <div class="flex flex-col gap-[4px]">
          <span class="body-normal-medium text-text-light">{{ message }}</span>
        </div>

        <button 
          @click="$emit('close')"
          class="ml-auto text-text-light/20 hover:text-text-light transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 1L1 13M1 1L13 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <!-- Progress Bar -->
      <div class="absolute bottom-0 left-0 h-[3px] bg-primary/30 transition-all duration-100 ease-linear" :style="{ width: progress + '%', backgroundColor: type === 'error' ? 'var(--color-error)' : 'var(--color-primary)' }"></div>
    </div>
  </Transition>
</template>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(40px) scale(0.95);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(40px) scale(0.95);
}
</style>
