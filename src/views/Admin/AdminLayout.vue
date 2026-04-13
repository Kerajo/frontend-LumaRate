<script setup>
import { RouterLink, RouterView, useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { computed } from 'vue'

// Импортируем компоненты проекта
import BaseButton from '@/components/BaseButton.vue'
import IconLogoPrimary from '@/components/icons/IconLogoPrimary.vue'
import IconEdit from '@/components/icons/IconEdit.vue'
import IconGavel from '@/components/icons/IconGavel.vue'
import IconProfile from '@/components/icons/IconProfile.vue'
import IconExit from '@/components/icons/IconExit.vue'

const { currentUser, logout } = useAuth()
const router = useRouter()
const route = useRoute()

const handleLogout = async () => {
  await logout()
  router.push('/login')
}

const isAdmin = computed(() => currentUser.value?.role === 'ADMIN')

const isActive = (path) => route.path === path
</script>

<template>
  <div class="flex min-h-screen bg-bg-body text-text-light font-sans">
    <!-- Sidebar -->
    <aside class="w-[320px] bg-bg-content border-r border-white/5 flex flex-col p-[40px] fixed h-full z-20">
      <div class="mb-[60px]">
        <router-link to="/" class="flex items-center gap-3">
          <IconLogoPrimary class="w-[48px] h-[48px]" />
          <span class="heading-m text-text-light">LumaRate</span>
        </router-link>
      </div>

      <nav class="flex-grow flex flex-col gap-[16px]">
        <!-- Контент (Только для Админа) -->
        <BaseButton 
          v-if="isAdmin"
          :variant="isActive('/admin/content') ? 'primary' : 'tertiary'"
          size="m"
          class="w-full justify-start !px-[20px]"
          @click="router.push('/admin/content')"
        >
          <template #left-icon>
            <IconEdit class="w-[24px] h-[24px]" />
          </template>
          Контент
        </BaseButton>

        <!-- Актеры - Только для Админа -->
        <BaseButton 
          v-if="isAdmin"
          :variant="isActive('/admin/persons') ? 'primary' : 'tertiary'"
          size="m"
          class="w-full justify-start !px-[20px]"
          @click="router.push('/admin/persons')"
        >
          <template #left-icon>
            <IconProfile class="w-[24px] h-[24px]" />
          </template>
          Актеры
        </BaseButton>

        <!-- Жанры - Только для Админа -->
        <BaseButton 
          v-if="isAdmin"
          :variant="isActive('/admin/genres') ? 'primary' : 'tertiary'"
          size="m"
          class="w-full justify-start !px-[20px]"
          @click="router.push('/admin/genres')"
        >
          <template #left-icon>
            <IconEdit class="w-[24px] h-[24px]" />
          </template>
          Жанры
        </BaseButton>

        <!-- Страны - Только для Админа -->
        <BaseButton 
          v-if="isAdmin"
          :variant="isActive('/admin/countries') ? 'primary' : 'tertiary'"
          size="m"
          class="w-full justify-start !px-[20px]"
          @click="router.push('/admin/countries')"
        >
          <template #left-icon>
            <div class="w-[24px] h-[24px] flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            </div>
          </template>
          Страны
        </BaseButton>

        <!-- Модерация (Админ и Модератор) -->
        <BaseButton 
          :variant="isActive('/admin/moderation') ? 'primary' : 'tertiary'"
          size="m"
          class="w-full justify-start !px-[20px]"
          @click="router.push('/admin/moderation')"
        >
          <template #left-icon>
            <IconGavel class="w-[24px] h-[24px]" />
          </template>
          Модерация
        </BaseButton>

        <!-- Роли (Только для Админа) -->
        <BaseButton 
          v-if="isAdmin"
          :variant="isActive('/admin/roles') ? 'primary' : 'tertiary'"
          size="m"
          class="w-full justify-start !px-[20px]"
          @click="router.push('/admin/roles')"
        >
          <template #left-icon>
            <IconProfile class="w-[24px] h-[24px]" />
          </template>
          Роли
        </BaseButton>
      </nav>

      <!-- Выход -->
      <BaseButton 
        variant="error" 
        size="m" 
        class="mt-auto w-full justify-start !px-[20px]"
        @click="handleLogout"
      >
        <template #left-icon>
          <IconExit class="w-[24px] h-[24px]" />
        </template>
        Выход
      </BaseButton>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-grow ml-[320px] bg-bg-body min-h-screen">
      <div class="py-[60px]">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Убираем стандартные стили кнопок если они мешают кастомизации ширины */
:deep(.BaseButton) {
  width: 100%;
}
</style>
