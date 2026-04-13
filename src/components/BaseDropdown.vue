<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import IconDownLine from './icons/IconDownLine.vue'

defineProps({
  label: { type: String, required: true },
  options: { type: Array, default: () => [] },
  modelValue: { type: String, default: null }
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const dropdownRef = ref(null)

const toggle = () => {
  isOpen.value = !isOpen.value
}

const selectOption = (opt) => {
  emit('update:modelValue', opt)
  isOpen.value = false
}

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
})</script>

<template>
  <div class="relative" ref="dropdownRef">
    <button 
      @click="toggle"
      class="flex items-center justify-between gap-[8px] p-[16px] bg-bg-content rounded-[8px] hover:brightness-110 transition-all min-w-[140px]"
    >
      <span class="px-[4px] text-text-light body-m whitespace-nowrap">
        {{ modelValue || label }}
      </span>
      <IconDownLine 
        class="w-[24px] h-[24px] text-text-light opacity-80 transition-transform duration-300"
        :class="isOpen ? 'rotate-180' : ''"
      />
    </button>

    <!-- Выпадающий список -->
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
        class="absolute top-full left-0 mt-[8px] w-full min-w-max bg-bg-content rounded-[8px] py-[8px] z-50 shadow-lg border border-white/5 overflow-hidden"
      >
        <!-- Кнопка сброса если что-то выбрано -->
        <button 
          v-if="modelValue"
          @click="selectOption(null)"
          class="w-full text-left px-[20px] py-[10px] body-m text-text-light opacity-50 hover:bg-bg-body hover:opacity-100 transition-colors"
        >
          Все {{ label.toLowerCase() }}
        </button>

        <button 
          v-for="opt in options" 
          :key="opt"
          @click="selectOption(opt)"
          class="w-full text-left px-[20px] py-[10px] body-m text-text-light transition-colors"
          :class="modelValue === opt ? 'bg-bg-body font-bold text-primary' : 'hover:bg-bg-body opacity-80 hover:opacity-100'"
        >
          {{ opt }}
        </button>
      </div>
    </transition>
  </div>
</template>
