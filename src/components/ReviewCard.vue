<script setup>
import { ref, onMounted } from 'vue';
import StarRating from './StarRating.vue';

const props = defineProps({
  authorName: String,
  authorImage: String,
  authorRole: {
    type: String,
    default: 'USER'
  },
  rating: Number,
  date: String,
  text: String,
  title: String,
});

const emit = defineEmits(['read-more']);

const textRef = ref(null);
const isTruncated = ref(false);

const checkTruncation = () => {
  if (textRef.value) {
    isTruncated.value = textRef.value.scrollHeight > textRef.value.clientHeight;
  }
};

const getRoleLabel = (role) => {
  const roles = {
    'ADMIN': 'Администратор',
    'MODERATOR': 'Модератор',
    'EXPERT': 'Эксперт'
  }
  return roles[role] || null
}

const getRoleClass = (role) => {
  if (role === 'ADMIN') return 'text-primary bg-primary/10 border-primary/20'
  if (role === 'MODERATOR') return 'text-[#8E44AD] bg-[#8E44AD]/10 border-[#8E44AD]/20'
  if (role === 'EXPERT') return 'text-[#E67E22] bg-[#E67E22]/10 border-[#E67E22]/20'
  return ''
}

onMounted(() => {
  checkTruncation();
  window.addEventListener('resize', checkTruncation);
});
</script>

<template>
  <div class="w-full h-fit min-h-[400px] p-[32px] rounded-[24px] bg-bg-content flex flex-col gap-[24px] border border-white/5 transition-all hover:border-white/10">
    <!-- Header -->
    <div class="flex justify-between items-start">
      <div class="flex gap-[16px] items-center">
        <!-- Avatar -->
        <div class="w-[56px] h-[56px] rounded-full overflow-hidden bg-bg-body shrink-0 shadow-xl border border-white/5">
          <img v-if="authorImage" :src="authorImage" :alt="authorName" class="w-full h-full object-cover" />
          <div v-else class="w-full h-full flex items-center justify-center bg-bg-body text-text-light/20">
            <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          </div>
        </div>
        
        <!-- Info -->
        <div class="flex flex-col gap-[6px]">
          <div class="flex items-center gap-[8px]">
            <h4 class="heading-s text-text-light">{{ authorName }}</h4>
            <span 
              v-if="getRoleLabel(authorRole)"
              :class="[
                'text-[10px] font-bold uppercase tracking-widest px-[8px] py-[2px] rounded-full border',
                getRoleClass(authorRole)
              ]"
            >
              {{ getRoleLabel(authorRole) }}
            </span>
          </div>
          <StarRating v-if="rating" :modelValue="rating" readonly :size="18" />
        </div>
      </div>
      <span class="body-s text-text-light/40">{{ date }}</span>
    </div>

    <!-- Body -->
    <div class="flex-1 flex flex-col overflow-hidden relative">
      <h3 v-if="title" class="heading-m text-text-light mb-[12px] leading-snug">{{ title }}</h3>
      
      <p 
        ref="textRef"
        class="body-normal-regular text-text-light/80 line-clamp-[10] overflow-hidden whitespace-pre-wrap leading-relaxed"
      >
        {{ text }}
      </p>
      
      <button 
        v-if="isTruncated"
        @click="emit('read-more')"
        class="mt-auto pt-[16px] w-fit text-primary body-normal-medium hover:underline transition-all flex items-center gap-2 group"
      >
        Читать полностью
        <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Extra safety for line clamping */
.line-clamp-\[10\] {
  display: -webkit-box;
  -webkit-line-clamp: 10;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
