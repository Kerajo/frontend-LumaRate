<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { accessToken } = useAuth()

// Компоненты проекта
import Container from '@/components/Container.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseModal from '@/components/BaseModal.vue'
import IconButton from '@/components/IconButton.vue'
import AdminMultiSelect from '@/components/Admin/AdminMultiSelect.vue'

// Иконки
import IconEdit from '@/components/icons/IconEdit.vue'
import IconClose from '@/components/icons/IconClose.vue'

const users = ref([])
const loading = ref(false)
const error = ref(null)

// Модалки
const showDeleteModal = ref(false)
const showRoleModal = ref(false)
const selectedUser = ref(null)
const newRole = ref('')

const roles = [
  { id: 'ADMIN', name: 'Администратор' },
  { id: 'MODERATOR', name: 'Модератор' },
  { id: 'EXPERT', name: 'Эксперт' },
  { id: 'USER', name: 'Пользователь' }
]

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: { 'Authorization': `Bearer ${accessToken.value}` }
    })
    const data = await response.json()
    if (response.ok) {
      // Фильтруем удаленных пользователей
      users.value = data.data.filter(u => u.status !== 'DELETED')
    } else {
      throw new Error(data.message || 'Ошибка загрузки пользователей')
    }
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(fetchUsers)

const openDeleteModal = (user) => {
  selectedUser.value = user
  showDeleteModal.value = true
}

const openRoleModal = (user) => {
  selectedUser.value = user
  newRole.value = user.role
  showRoleModal.value = true
}

const confirmDelete = async () => {
  if (!selectedUser.value) return
  
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/${selectedUser.value.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${accessToken.value}` }
    })
    
    if (response.ok) {
      // Убираем пользователя из списка после удаления
      users.value = users.value.filter(u => u.id !== selectedUser.value.id)
      showDeleteModal.value = false
    } else {
      const data = await response.json()
      alert(data.message || 'Ошибка при удалении')
    }
  } catch (err) {
    console.error(err)
  }
}

const saveRole = async () => {
  if (!selectedUser.value || !newRole.value) return

  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/${selectedUser.value.id}/role`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${accessToken.value}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ role: newRole.value })
    })

    if (response.ok) {
      users.value = users.value.map(u => 
        u.id === selectedUser.value.id ? { ...u, role: newRole.value } : u
      )
      showRoleModal.value = false
    } else {
      const data = await response.json()
      alert(data.message || 'Ошибка при смене роли')
    }
  } catch (err) {
    console.error(err)
  }
}

const getRoleName = (role) => {
  const r = roles.find(item => item.id === role)
  return r ? r.name : role
}
</script>

<template>
  <Container>
    <div class="space-y-[40px] animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h1 class="heading-l text-text-light tracking-tight font-bold">Управление ролями</h1>

      <div v-if="error" class="bg-error/10 border border-error/20 text-error p-4 rounded-[12px]">
        {{ error }}
      </div>

      <!-- Таблица -->
      <div class="bg-bg-content border border-white/5 rounded-[24px] overflow-hidden shadow-2xl">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-white/5">
              <th class="px-[32px] py-[24px] label-normal font-bold text-text-light-disabled uppercase tracking-wider">Никнейм</th>
              <th class="px-[32px] py-[24px] label-normal font-bold text-text-light-disabled uppercase tracking-wider">Роль</th>
              <th class="px-[32px] py-[24px] float-right label-normal font-bold text-text-light-disabled uppercase tracking-wider mr-[32px]">Действие</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="user in users" 
              :key="user.id" 
              class="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors group"
            >
              <td class="px-[32px] py-[24px]">
                <div class="flex flex-col">
                  <span class="body-medium-medium text-text-light font-medium">{{ user.login }}</span>
                  <span class="body-small-regular text-text-light-disabled">ID: {{ user.id.slice(0, 8) }}...</span>
                </div>
              </td>
              <td class="px-[32px] py-[24px]">
                <div class="inline-flex items-center px-[12px] py-[6px] rounded-full body-small-medium tracking-wide"
                  :class="{
                    'bg-primary/10 text-primary': user.role === 'ADMIN',
                    'bg-info/10 text-info': user.role === 'MODERATOR',
                    'bg-warning/10 text-warning': user.role === 'EXPERT',
                    'bg-white/5 text-text-light': user.role === 'USER'
                  }"
                >
                  {{ getRoleName(user.role) }}
                </div>
              </td>
              <td class="px-[32px] py-[24px] h-full">
                <div class="flex items-center justify-end gap-[12px]">
                  <IconButton 
                    variant="tertiary" 
                    size="m" 
                    class="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/5"
                    @click="openRoleModal(user)"
                  >
                    <IconEdit class="w-[20px] h-[20px] text-text-light-secondary hover:text-primary transition-colors" />
                  </IconButton>
                  <IconButton 
                    variant="tertiary" 
                    size="m" 
                    class="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/5"
                    @click="openDeleteModal(user)"
                  >
                    <IconClose class="w-[20px] h-[20px] text-text-light-secondary hover:text-error transition-colors" />
                  </IconButton>
                </div>
              </td>
            </tr>
            <tr v-if="users.length === 0 && !loading">
              <td colspan="3" class="px-[32px] py-[60px] text-center text-text-light-disabled body-normal-regular">
                Пользователи не найдены
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Модалка удаления -->
    <BaseModal 
      :show="showDeleteModal" 
      title="Удаление аккаунта" 
      @close="showDeleteModal = false"
    >
      <div class="space-y-[32px] text-center py-[20px]">
        <p class="body-medium-regular text-text-light-secondary">
          Вы точно хотите удалить аккаунт <span class="text-text-light font-bold">@{{ selectedUser?.login }}</span>?
          <br/>
          <span class="text-error body-small-regular">Это действие нельзя будет отменить.</span>
        </p>
        <div class="flex gap-[16px] justify-center">
          <BaseButton variant="error" size="m" class="!px-[32px]" @click="confirmDelete">Да, хочу</BaseButton>
          <BaseButton variant="tertiary" size="m" class="!px-[32px]" @click="showDeleteModal = false">Нет</BaseButton>
        </div>
      </div>
    </BaseModal>

    <!-- Модалка смены роли -->
    <BaseModal 
      :show="showRoleModal" 
      title="Сменить роль" 
      overflowVisible
      @close="showRoleModal = false"
    >
      <div class="space-y-[32px] py-[20px]">
        <AdminMultiSelect 
          label="Выберите роль для пользователя"
          :options="roles"
          v-model="newRole"
          single
        />
        
        <div class="flex gap-[16px] pt-[20px]">
          <BaseButton variant="primary" size="m" class="flex-grow" @click="saveRole">Сохранить</BaseButton>
          <BaseButton variant="tertiary" size="m" class="!px-[24px]" @click="showRoleModal = false">Отмена</BaseButton>
        </div>
      </div>
    </BaseModal>
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

/* Стили для таблицы */
table {
  width: 100%;
}
th {
  font-weight: 700;
}
</style>
