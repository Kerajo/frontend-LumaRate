<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import BadgeInfo from './BadgeInfo.vue';
import IconButton from './IconButton.vue';
import IconBookmarks from './icons/IconBookmarks.vue';

const props = defineProps({
  size: {
    type: String,
    default: 'm', // 's' or 'm'
  },
  posterUrl: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    default: null,
  },
  statusText: {
    type: String,
    default: '',
  },
  genres: {
    type: Array,
    default: () => [],
  },
  ageLimit: {
    type: String,
    default: '',
  },
  year: {
    type: [String, Number],
    default: '',
  },
  slug: {
    type: String,
    required: true,
  }
});

const router = useRouter();
const isBookmarked = ref(false);

const toggleBookmark = (e) => {
  e.preventDefault();
  e.stopPropagation();
  isBookmarked.value = !isBookmarked.value;
};

const goToMovie = () => {
  router.push(`/movie/${props.slug}`);
};

const sizeClasses = computed(() => {
  if (props.size === 's') return 'w-[280px] h-[420px]';
  return 'w-[306px] h-[459px]';
});
</script>

<template>
  <div 
    :class="[
      'relative rounded-[8px] overflow-hidden group cursor-pointer flex-shrink-0',
      sizeClasses
    ]"
    @click="goToMovie"
  >
    <!-- Background Image with Blur on Hover -->
    <img 
      :src="posterUrl" 
      alt="Movie Poster" 
      class="absolute inset-0 w-full h-full object-cover transition-all duration-300 group-hover:blur-[8px] group-hover:scale-105"
    />
    
    <!-- Darker Overlay on Hover for Text Clarity -->
    <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

    <!-- Inner Content Wrapper with 16px Padding -->
    <div class="absolute inset-0 p-[16px] flex flex-col justify-between overflow-hidden">
      
      <!-- Top Badges & Bookmark -->
      <div class="flex justify-between items-start relative z-10">
        <div class="flex gap-[8px] flex-wrap items-start transition-opacity duration-300">
          <BadgeInfo v-if="rating" variant="rating" size="s" :rating="rating * 2">{{ (rating * 2).toFixed(1) }}</BadgeInfo>
          <BadgeInfo v-if="statusText" variant="default" size="s">{{ statusText }}</BadgeInfo>
        </div>
        
        <IconButton 
          variant="secondary" 
          size="s" 
          :isActive="isBookmarked"
          class="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          @click="toggleBookmark"
        >
          <IconBookmarks class="w-4 h-4" />
        </IconButton>
      </div>

      <!-- Bottom Genre, Year & Age Badges (Slide up on hover) -->
      <div class="flex gap-[8px] flex-wrap items-end relative z-10 translate-y-[20px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
        <BadgeInfo v-if="year" variant="translucent" size="s">{{ year }}</BadgeInfo>
        <BadgeInfo v-if="ageLimit" variant="translucent" size="s">{{ ageLimit }}</BadgeInfo>
        <BadgeInfo v-for="(genre, index) in genres" :key="index" variant="translucent" size="s">
          {{ genre }}
        </BadgeInfo>
      </div>

    </div>
  </div>
</template>
