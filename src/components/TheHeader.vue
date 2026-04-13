<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import BaseButton from './BaseButton.vue'
import IconButton from './IconButton.vue'
import IconSearchLine from './icons/IconSearchLine.vue'
import IconProfile from './icons/IconProfile.vue'
import IconClose from './icons/IconClose.vue'

const { currentUser } = useAuth()
const router = useRouter()
const isHidden = ref(false)
const isScrolled = ref(false)
const isSearchOpen = ref(false)
const searchQuery = ref('')
const searchInput = ref(null)
let lastScrollPosition = 0

const toggleSearch = () => {
  isSearchOpen.value = !isSearchOpen.value
  if (isSearchOpen.value) {
    setTimeout(() => {
      searchInput.value?.focus()
    }, 100)
    // Prevent scroll when search is open
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ name: 'search', query: { q: searchQuery.value.trim() } })
    closeSearch()
  }
}

const closeSearch = () => {
  isSearchOpen.value = false
  searchQuery.value = ''
  document.body.style.overflow = ''
}

const handleScroll = () => {
  const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop
  
  if (currentScrollPosition < 0) {
    return
  }

  isScrolled.value = currentScrollPosition > 50

  if (currentScrollPosition > lastScrollPosition && currentScrollPosition > 100) {
    isHidden.value = true
  } else if (currentScrollPosition < lastScrollPosition) {
    isHidden.value = false
  }

  lastScrollPosition = currentScrollPosition
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <header
    :class="[
      'w-full px-[40px] py-[24px] flex justify-between items-center fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out',
      isHidden ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100',
      isScrolled ? 'bg-[#111111]/95 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.5)]' : ''
    ]"
    :style="isScrolled ? {} : { background: 'linear-gradient(180deg, rgba(18, 18, 18, 0.8) 47.19%, rgba(18, 18, 18, 0.3) 76.55%, rgba(18, 18, 18, 0) 100%)' }"
  >
    <!-- Левая часть -->
    <div class="flex items-center gap-[120px]">
      <!-- Логотип -->
      <router-link to="/">
        <img src="/Logo.svg" alt="LumaRate" class="h-[48px] w-auto cursor-pointer hover:scale-105 transition-transform" />
      </router-link>

      <!-- Обертка навигации -->
      <div class="p-[4px] rounded-[8px] bg-bg-content flex gap-[16px]">
        <BaseButton variant="secondary" size="s" @click="router.push('/catalog')">Фильмы</BaseButton>
        <BaseButton variant="secondary" size="s">Сериалы</BaseButton>
        <BaseButton variant="secondary" size="s">Мультфильмы</BaseButton>
      </div>
    </div>

    <!-- Правая часть -->
    <div class="flex items-center gap-[16px]">
      <IconButton variant="secondary" size="m" @click="toggleSearch">
        <IconSearchLine class="w-6 h-6" />
      </IconButton>

      <template v-if="currentUser">
        <BaseButton variant="secondary" size="m" @click="router.push('/profile')">
          <template #left-icon>
            <IconProfile class="w-6 h-6" />
          </template>
          {{ currentUser.username }}
        </BaseButton>
      </template>
      <template v-else>
        <BaseButton variant="primary" size="m" @click="router.push('/login')"> Войти </BaseButton>
      </template>
    </div>
  </header>

  <!-- Search Popup Overlay -->
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div v-if="isSearchOpen" class="fixed inset-0 z-[100] flex flex-col items-center justify-start pt-[160px] bg-bg-body/95 backdrop-blur-xl px-[40px]">
      <!-- Close Button -->
      <button 
        @click="closeSearch" 
        class="absolute top-[40px] right-[40px] text-text-light opacity-60 hover:opacity-100 transition-opacity p-2"
      >
        <IconClose class="w-8 h-8" />
      </button>

      <!-- Search Input Container -->
      <div class="w-full max-w-[800px] flex flex-col gap-[32px]">
        <div class="relative group">
          <input 
            ref="searchInput"
            v-model="searchQuery"
            type="text" 
            placeholder="Название фильма или сериала" 
            class="w-full bg-transparent border-b-2 border-text-light/20 focus:border-primary text-text-light heading-l py-[16px] outline-none transition-colors placeholder:text-text-light/20"
            @keyup.enter="handleSearch"
            @keyup.esc="closeSearch"
          />
          <IconClose 
            v-if="searchQuery" 
            class="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 text-text-light/40 hover:text-text-light cursor-pointer transition-colors" 
            @click="searchQuery = ''"
          />
          <IconSearchLine 
            v-else 
            class="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 text-text-light/40 group-focus-within:text-primary transition-colors pointer-events-none" 
          />
        </div>
        
        <p class="body-m text-text-light/40">Нажмите Enter для начала поиска</p>
      </div>
    </div>
  </Transition>
</template>
