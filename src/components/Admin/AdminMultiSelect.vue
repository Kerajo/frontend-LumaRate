<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import IconDownLine from '@/components/icons/IconDownLine.vue'
import IconClose from '@/components/icons/IconClose.vue'

const props = defineProps({
  label: { type: String, required: true },
  options: { type: Array, default: () => [] }, // [{ id, name }]
  modelValue: { type: [Array, String], default: () => [] }, // [id] or id
  placeholder: { type: String, default: 'Поиск...' },
  single: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const searchQuery = ref('')
const dropdownRef = ref(null)

const toggle = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) searchQuery.value = ''
}

const filteredOptions = computed(() => {
  if (!searchQuery.value) return props.options
  const q = searchQuery.value.toLowerCase()
  return props.options.filter(opt => opt.name.toLowerCase().includes(q))
})

const isSelected = (id) => {
  if (props.single) return props.modelValue === id
  return props.modelValue.includes(id)
}

const selectOption = (opt) => {
  if (props.single) {
    emit('update:modelValue', opt.id)
    isOpen.value = false
    return
  }
  
  const newValue = isSelected(opt.id)
    ? props.modelValue.filter(id => id !== opt.id)
    : [...props.modelValue, opt.id]
  emit('update:modelValue', newValue)
}

const removeTag = (id) => {
  if (props.single) {
    emit('update:modelValue', null)
    return
  }
  emit('update:modelValue', props.modelValue.filter(v => v !== id))
}

const getOptionName = (id) => {
  const opt = props.options.find(o => o.id === id)
  return opt ? opt.name : id
}

const displayValue = computed(() => {
  if (props.single) return getOptionName(props.modelValue)
  return props.modelValue
})

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="space-y-[8px]">
    <label class="body-m text-text-light/60 ml-[4px]">{{ label }}</label>
    
    <div class="relative" ref="dropdownRef">
      <!-- Trigger area -->
      <div 
        @click="toggle"
        class="min-h-[58px] bg-bg-content border border-white/5 rounded-[8px] px-[20px] py-[12px] flex flex-wrap gap-[8px] items-center cursor-pointer hover:brightness-110 transition-all pr-[50px]"
      >
        <!-- Placeholder if empty -->
        <span v-if="single ? !modelValue : modelValue.length === 0" class="text-text-light/20 body-m pl-[4px]">
          Выберите из списка...
        </span>

        <!-- Tags (Multi mode) -->
        <template v-if="!single">
          <div 
            v-for="id in modelValue" 
            :key="id"
            @click.stop
            class="flex items-center gap-[4px] bg-bg-body border border-white/10 px-[12px] py-[4px] rounded-[6px] group hover:border-primary/40 transition-colors"
          >
            <span class="text-[14px] text-text-light group-hover:text-primary transition-colors">{{ getOptionName(id) }}</span>
            <button type="button" @click.stop="removeTag(id)" class="text-text-light/40 hover:text-status-error">
              <IconClose class="w-[14px] h-[14px]" />
            </button>
          </div>
        </template>

        <!-- Single selection display -->
        <template v-else-if="modelValue">
          <span class="text-text-light body-m pl-[4px]">{{ displayValue }}</span>
        </template>

        <!-- Chevron -->
        <div class="absolute right-[20px] top-1/2 -translate-y-1/2 pointer-events-none text-text-light/40">
          <IconDownLine 
            class="w-[24px] h-[24px] transition-transform duration-300"
            :class="isOpen ? 'rotate-180' : ''"
          />
        </div>
      </div>

      <!-- Dropdown list -->
      <transition
        enter-active-class="transition ease-out duration-100"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <div 
          v-if="isOpen"
          class="absolute top-full left-0 mt-[12px] w-full bg-bg-content rounded-[12px] py-[12px] z-50 shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/10 flex flex-col gap-[8px]"
        >
          <!-- Search Input -->
          <div class="px-[12px] pb-[4px]">
            <input 
              v-model="searchQuery"
              @click.stop
              :placeholder="placeholder"
              class="w-full bg-bg-body border border-white/5 rounded-[8px] px-[16px] py-[10px] text-text-light body-m focus:outline-none focus:border-primary/50"
            />
          </div>

          <!-- Options List -->
          <div class="max-h-[250px] overflow-y-auto px-[8px]">
            <button 
              v-for="opt in filteredOptions" 
              :key="opt.id"
              type="button"
              @click.stop="selectOption(opt)"
              class="w-full text-left px-[16px] py-[12px] rounded-[8px] body-m transition-all flex items-center justify-between group"
              :class="isSelected(opt.id) ? 'bg-primary/10 text-primary' : 'text-text-light/80 hover:bg-bg-body hover:text-text-light'"
            >
              <span>{{ opt.name }}</span>
              <div v-if="isSelected(opt.id)" class="w-1.5 h-1.5 rounded-full bg-primary"></div>
            </button>
            <div v-if="filteredOptions.length === 0" class="py-[20px] text-center text-text-light/20 body-m">
              Ничего не найдено
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}
.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>
