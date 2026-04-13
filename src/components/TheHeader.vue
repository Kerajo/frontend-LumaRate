<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import BaseButton from './BaseButton.vue'
import IconButton from './IconButton.vue'
import IconSearchLine from './icons/IconSearchLine.vue'
import IconProfile from './icons/IconProfile.vue'
import IconClose from './icons/IconClose.vue'
import IconMenu from './icons/IconMenu.vue'

const { currentUser } = useAuth()
const router = useRouter()

const isHidden = ref(false)
const isScrolled = ref(false)
const isSearchOpen = ref(false)
const isMenuOpen = ref(false)
const searchQuery = ref('')
const searchInput = ref(null)
let lastScrollPosition = 0

// Lock scroll when overlays are open
watch([isSearchOpen, isMenuOpen], ([search, menu]) => {
  if (search || menu) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

const toggleSearch = () => {
  isSearchOpen.value = !isSearchOpen.value
  if (isSearchOpen.value) {
    isMenuOpen.value = false // Close menu if search opens
    setTimeout(() => {
      searchInput.value?.focus()
    }, 100)
  }
}

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
  if (isMenuOpen.value) {
    isSearchOpen.value = false // Close search if menu opens
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
}

const navigate = (path) => {
  router.push(path)
  isMenuOpen.value = false
}

const handleScroll = () => {
  const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop
  
  if (currentScrollPosition < 0) return

  isScrolled.value = currentScrollPosition > 50

  if (currentScrollPosition > lastScrollPosition && currentScrollPosition > 100) {
    if (!isMenuOpen.value && !isSearchOpen.value) isHidden.value = true
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
      'w-full lg:px-[40px] px-[20px] py-[16px] lg:py-[24px] fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out',
      isHidden ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100',
      isScrolled || isMenuOpen ? 'bg-[#111111]/95 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.5)]' : ''
    ]"
    :style="isScrolled || isMenuOpen ? {} : { background: 'linear-gradient(180deg, rgba(18, 18, 18, 0.8) 47.19%, rgba(18, 18, 18, 0.3) 76.55%, rgba(18, 18, 18, 0) 100%)' }"
  >
    <!-- Desktop Header Layout (>= 1024px) -->
    <div class="hidden lg:flex w-full justify-between items-center">
      <!-- Left side (Logo + Nav) -->
      <div class="flex items-center gap-[120px]">
        <router-link to="/">
          <img src="/Logo.svg" alt="LumaRate" class="h-[48px] w-auto cursor-pointer hover:scale-105 transition-transform" />
        </router-link>

        <div class="p-[4px] rounded-[8px] bg-bg-content flex gap-[16px]">
          <BaseButton variant="secondary" size="s" @click="router.push('/catalog?type=MOVIE')">Фильмы</BaseButton>
          <BaseButton variant="secondary" size="s" @click="router.push('/catalog?type=SERIES')">Сериалы</BaseButton>
          <BaseButton variant="secondary" size="s" @click="router.push('/catalog?type=CARTOON')">Мультфильмы</BaseButton>
        </div>
      </div>

      <!-- Right side (Search + Profile) -->
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
    </div>

    <!-- Mobile/Tablet Header Layout (< 1024px) -->
    <div class="lg:hidden grid grid-cols-3 items-center w-full">
      <!-- Left: Burger -->
      <div class="flex justify-start">
        <IconButton 
          variant="secondary" 
          size="m" 
          @click="toggleMenu"
        >
          <IconMenu v-if="!isMenuOpen" class="w-6 h-6" />
          <IconClose v-else class="w-6 h-6" />
        </IconButton>
      </div>

      <!-- Center: Logo -->
      <div class="flex justify-center">
        <router-link to="/" @click="isMenuOpen = false">
          <img src="/Logo.svg" alt="LumaRate" class="h-[32px] w-auto cursor-pointer hover:scale-105 transition-transform" />
        </router-link>
      </div>

      <!-- Right: Search -->
      <div class="flex justify-end">
        <IconButton variant="secondary" size="m" @click="toggleSearch">
          <IconSearchLine class="w-6 h-6" />
        </IconButton>
      </div>
    </div>
  </header>

  <!-- Mobile Menu Overlay -->
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0 -translate-y-4"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 -translate-y-4"
  >
    <div v-if="isMenuOpen" class="fixed inset-0 z-[40] bg-bg-body pt-[100px] px-[20px] flex flex-col gap-[40px]">
      <nav class="flex flex-col gap-[12px]">
        <p class="label-normal text-text-light-disabled uppercase tracking-widest mb-2 px-4">Навигация</p>
        <button 
          v-for="link in [
            { name: 'Фильмы', path: '/catalog?type=MOVIE' },
            { name: 'Сериалы', path: '/catalog?type=SERIES' },
            { name: 'Мультфильмы', path: '/catalog?type=CARTOON' }
          ]" 
          :key="link.name"
          @click="navigate(link.path)"
          class="w-full text-left px-6 py-4 rounded-[16px] bg-bg-content hover:bg-white/10 text-text-light heading-s transition-all"
        >
          {{ link.name }}
        </button>
      </nav>

      <div class="mt-auto pb-[40px] flex flex-col gap-4">
        <template v-if="currentUser">
           <BaseButton variant="primary" size="l" class="w-full" @click="navigate('/profile')">
             Профиль
           </BaseButton>
        </template>
        <template v-else>
           <BaseButton variant="primary" size="l" class="w-full" @click="navigate('/login')">
             Войти в аккаунт
           </BaseButton>
        </template>
      </div>
    </div>
  </Transition>

  <!-- Search Popup Overlay -->
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div v-if="isSearchOpen" class="fixed inset-0 z-[100] flex flex-col items-center justify-start pt-[120px] lg:pt-[160px] bg-bg-body/95 backdrop-blur-xl lg:px-[40px] px-[20px]">
      <button 
        @click="closeSearch" 
        class="absolute top-[32px] lg:top-[40px] right-[20px] lg:right-[40px] text-text-light opacity-60 hover:opacity-100 transition-opacity p-2"
      >
        <IconClose class="lg:w-8 lg:h-8 w-6 h-6" />
      </button>

      <div class="w-full max-w-[800px] flex flex-col gap-[32px]">
        <div class="relative group">
          <input 
            ref="searchInput"
            v-model="searchQuery"
            type="text" 
            placeholder="Название фильма или сериала" 
            class="w-full bg-transparent border-b-2 border-text-light/20 focus:border-primary text-text-light lg:heading-l heading-m py-[16px] outline-none transition-colors placeholder:text-text-light/20"
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
            class="absolute right-0 top-1/2 -translate-y-1/2 lg:w-8 lg:h-8 w-6 h-6 text-text-light/40 group-focus-within:text-primary transition-colors pointer-events-none" 
          />
        </div>
        
        <p class="body-m text-text-light/40 lg:block hidden">Нажмите Enter для начала поиска</p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
@media (min-width: 1024px) {
  .fixed.inset-0.z-\[40\] {
    display: none !important;
  }
}
</style>
