<script setup>
import { ref } from 'vue'
import Container from './Container.vue'
import BadgeInfo from './BadgeInfo.vue'
import { getFullImageUrl } from '../utils/url'
import BaseButton from './BaseButton.vue'
import IconButton from './IconButton.vue'
import IconBookmarks from './icons/IconBookmarks.vue'

defineProps({
  title: { type: String, default: 'LumaRate' },
  description: { type: String, default: 'Лучшие фильмы и сериалы в одном месте' },
  rating: { type: Number, default: 0 },
  genres: { type: Array, default: () => [] },
  ageLimit: { type: String, default: '16+' },
  year: { type: [String, Number], default: '' },
  bannerUrl: { type: String, default: '/Banner.png' },
  slug: { type: String, default: '' }
})

const isBookmarked = ref(false)
const toggleBookmark = () => {
  isBookmarked.value = !isBookmarked.value
}
</script>

<template>
  <div
    class="w-full relative flex flex-col justify-end transition-all duration-700"
    :style="{
      height: '85vh',
      minHeight: '700px',
      maxHeight: '880px',
      borderRadius: '0 0 32px 32px',
      backgroundColor: '#0a0a0b',
      backgroundImage: `
        linear-gradient(
          180deg,
          rgba(0, 0, 0, 0.4) 0%,
          rgba(0, 0, 0, 0) 50%,
          rgba(0, 0, 0, 0.8) 96.63%
        ),
        url('${getFullImageUrl(bannerUrl)}')`,
      backgroundPosition: 'center',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat'
    }"
  >
    <Container class="pb-[48px]">
      <div class="flex flex-col gap-[24px] max-w-[800px] animate-in fade-in slide-in-from-bottom-6 duration-700">
        <!-- Tags -->
        <div class="flex flex-wrap gap-[8px]">
          <BadgeInfo v-if="rating" variant="rating" :rating="rating">{{ rating.toFixed(1) }}</BadgeInfo>
          <BadgeInfo v-if="ageLimit">{{ ageLimit }}</BadgeInfo>
          <BadgeInfo v-if="year">{{ year }}</BadgeInfo>
          <BadgeInfo v-for="genre in genres" :key="genre">{{ genre }}</BadgeInfo>
        </div>

        <!-- Title & Description -->
        <div class="flex flex-col gap-[16px]">
          <h1 class="heading-4xl text-text-light drop-shadow-lg">{{ title }}</h1>
          <p class="body-normal-regular text-text-light/80 drop-shadow-md leading-relaxed">
            {{ description }}
          </p>
        </div>

        <!-- Buttons -->
        <div class="flex items-center gap-[8px]">
          <BaseButton 
            variant="primary" 
            size="m"
            @click="$router.push(`/movie/${slug}`)"
            v-if="slug"
          >
            О фильме
          </BaseButton>
          <IconButton 
            variant="secondary" 
            size="m" 
            :isActive="isBookmarked"
            @click="toggleBookmark"
          >
            <IconBookmarks class="w-6 h-6" />
          </IconButton>
        </div>
      </div>
    </Container>
  </div>
</template>

<style scoped>
.animate-in {
  animation: slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
