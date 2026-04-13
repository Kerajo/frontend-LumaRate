<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  /** 'portrait' = 9:16 (постер), 'landscape' = 16:9 (баннер), 'square' = 1:1 (фото актера) */
  variant: { type: String, default: 'portrait' },
  hint: { type: String, default: '' },
  /** Путь, сохранённый на сервере (для отображения уже загруженного файла) */
  modelValue: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'file-selected'])

const fileInput = ref(null)
const selectedFile = ref(null)
const previewUrl = ref(props.modelValue || null)
const isDragging = ref(false)

const aspectStyle = computed(() => {
  if (props.variant === 'landscape') return { aspectRatio: '16/9' }
  if (props.variant === 'square') return { aspectRatio: '1/1' }
  return { aspectRatio: '9/16' }
})

const previewWidth = computed(() => {
  if (props.variant === 'landscape') return 'w-full max-w-[320px]'
  if (props.variant === 'square') return 'w-[140px]'
  return 'w-[100px]'
})

const displayHint = computed(() => {
  if (props.hint) return props.hint
  if (props.variant === 'landscape') return 'Горизонтальный 16:9'
  if (props.variant === 'square') return 'Квадратный 1:1'
  return 'Вертикальный 9:16'
})

const triggerUpload = () => fileInput.value?.click()

const processFile = (file) => {
  if (!file || !file.type.startsWith('image/')) return
  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
  // Эмитим сам файл — родитель сам решает как его загружать
  emit('file-selected', file)
  // modelValue будет обновлён родителем после загрузки
}

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) processFile(file)
}

const handleDrop = (event) => {
  event.preventDefault()
  isDragging.value = false
  const file = event.dataTransfer.files[0]
  if (file) processFile(file)
}

const handleDragOver = (event) => {
  event.preventDefault()
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

const removeFile = () => {
  selectedFile.value = null
  previewUrl.value = null
  if (fileInput.value) fileInput.value.value = ''
  emit('file-selected', null)
  emit('update:modelValue', '')
}

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
</script>

<template>
  <div class="space-y-[12px]">
    <div class="flex items-center justify-between">
      <label class="body-normal-medium text-text-light-secondary ml-[4px]">{{ label }}</label>
      <span v-if="displayHint" class="body-small-regular text-text-light-disabled">{{ displayHint }}</span>
    </div>

    <!-- Drop Zone (no file selected) -->
    <div
      v-if="!previewUrl"
      @click="triggerUpload"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      :class="[
        'relative cursor-pointer rounded-[14px] border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center gap-[12px] p-[32px] min-h-[160px]',
        isDragging
          ? 'border-primary bg-primary/5 scale-[1.01]'
          : 'border-white/10 bg-bg-content hover:border-white/20 hover:bg-white/[0.02]'
      ]"
    >
      <!-- Upload Icon -->
      <div :class="['w-[56px] h-[56px] rounded-full flex items-center justify-center transition-all duration-200', isDragging ? 'bg-primary/20' : 'bg-white/5']">
        <svg :class="['w-[24px] h-[24px] transition-colors', isDragging ? 'text-primary' : 'text-text-light-disabled']" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
      </div>

      <div class="text-center">
        <p class="body-normal-medium text-text-light">
          <span :class="isDragging ? 'text-primary' : ''">Перетащите изображение</span>
          &nbsp;или&nbsp;
          <span class="text-primary underline underline-offset-2">выберите файл</span>
        </p>
        <p class="body-small-regular text-text-light-disabled mt-[4px]">PNG, JPG, WEBP до 20 МБ</p>
      </div>

      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="handleFileChange"
      />
    </div>

    <!-- Preview State (file selected) -->
    <div v-else class="flex items-start gap-[20px] p-[16px] bg-bg-content rounded-[14px] border border-white/5">
      <!-- Image Preview -->
      <div
        :class="['flex-shrink-0 bg-black rounded-[10px] overflow-hidden border border-white/10', previewWidth]"
        :style="aspectStyle"
      >
        <img
          :src="previewUrl"
          class="w-full h-full object-cover"
          alt="Preview"
          @error="e => e.target.style.opacity = '0.3'"
        />
      </div>

      <!-- File Info + Actions -->
      <div class="flex-1 flex flex-col justify-between gap-[16px] min-h-[60px]">
        <div>
          <p class="body-normal-medium text-text-light truncate max-w-[260px]">
            {{ selectedFile?.name || 'Загружено' }}
          </p>
          <p v-if="selectedFile" class="body-small-regular text-text-light-disabled mt-[2px]">
            {{ formatSize(selectedFile.size) }}
          </p>
          <p v-else class="body-small-regular text-primary mt-[2px]">Файл загружен ✓</p>
        </div>

        <div class="flex items-center gap-[12px]">
          <button
            type="button"
            @click="triggerUpload"
            class="flex items-center gap-[8px] bg-white/5 border border-white/5 px-[14px] py-[8px] rounded-[8px] body-small-medium text-text-light-secondary hover:text-text-light hover:border-white/15 transition-all"
          >
            <svg class="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            Заменить
          </button>

          <button
            type="button"
            @click="removeFile"
            class="flex items-center gap-[8px] bg-error/5 border border-error/10 px-[14px] py-[8px] rounded-[8px] body-small-medium text-error/70 hover:text-error hover:border-error/30 transition-all"
          >
            <svg class="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Удалить
          </button>
        </div>
      </div>

      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="handleFileChange"
      />
    </div>
  </div>
</template>
