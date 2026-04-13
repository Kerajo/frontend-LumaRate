<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import Container from '../components/Container.vue'
import BaseDropdown from '../components/BaseDropdown.vue'
import SortToggle from '../components/SortToggle.vue'
import MovieCard from '../components/MovieCard.vue'
import BaseButton from '../components/BaseButton.vue'

const route = useRoute()
const searchQuery = computed(() => route.query.q || '')
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const allMovies = ref([])
const totalFound = ref(0)
const displayCount = ref(8)
const isLoading = ref(false)

// Маппинг данных аналогично главной и странице фильма
const mapMovie = (movie) => {
  if (!movie) return null
  return {
    ...movie,
    rating: movie.siteRating || movie.imdbRating || movie.kinopoiskRating || 0,
    genres: movie.genres?.map(g => g.name) || [],
    ageLimit: movie.ageRating || '16+',
    statusText: movie.statusText || '' 
  }
}

const fetchSearchResults = async (query) => {
  if (!query) {
    allMovies.value = []
    totalFound.value = 0
    return
  }

  isLoading.value = true
  try {
    const response = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}&limit=40`)
    if (response.ok) {
      const data = await response.json()
      allMovies.value = data.data.map(mapMovie)
      totalFound.value = data.total || allMovies.value.length
    }
  } catch (err) {
    console.error('Search failed:', err)
  } finally {
    isLoading.value = false
  }
}

const loadMore = () => {
  displayCount.value += 8
}

// Следим за изменением поискового запроса в URL
watch(searchQuery, (newQuery) => {
  fetchSearchResults(newQuery)
  displayCount.value = 8
}, { immediate: true })

// Фильтры (пока декоративные, так как поиск в API простой)
const selectedGenre = ref(null)
const selectedCountry = ref(null)
const selectedYear = ref(null)

const genreOptions = ['Комедия', 'Драма', 'Фантастика', 'Триллер', 'Ужасы', 'Боевик']
const countryOptions = ['Россия', 'США', 'Корея', 'Казахстан', 'Франция']
const yearOptions = ['2026', '2025', '2024', '2023', '2022', '2021', '2020']
</script>

<template>
  <main class="w-full pt-[160px] pb-[64px] min-h-screen flex flex-col bg-bg-body">
    <Container>
      
      <!-- Head -->
      <div class="flex flex-col gap-[24px]">
        
        <!-- Breadcrumbs -->
        <div class="flex items-center gap-[8px] body-m">
          <router-link to="/" class="text-text-light opacity-60 hover:opacity-100 transition-opacity">Главная</router-link>
          <span class="text-text-light opacity-60">/</span>
          <span class="text-text-light">Поиск</span>
        </div>

        <!-- Title -->
        <h1 class="text-4xl font-bold text-text-light">
          Поиск: <span class="text-primary">{{ searchQuery }}</span>
          <span v-if="!isLoading && totalFound > 0" class="ml-4 text-xl text-text-light/40 font-normal">
            ({{ totalFound }} презультатов)
          </span>
        </h1>

        <!-- Controls (Filters & Sort) -->
        <div class="flex justify-between w-full mt-[8px]">
          
          <!-- Filters -->
          <div class="flex gap-[16px]">
            <BaseDropdown label="Жанры" :options="genreOptions" v-model="selectedGenre" />
            <BaseDropdown label="Страны" :options="countryOptions" v-model="selectedCountry" />
            <BaseDropdown label="Годы" :options="yearOptions" v-model="selectedYear" />
          </div>

          <!-- Sorting -->
          <SortToggle />

        </div>
      </div>

      <!-- Grid -->
      <div class="mt-[64px] flex-grow">
        <!-- Loading State -->
        <div v-if="isLoading" class="flex flex-col items-center justify-center py-[100px] gap-4">
          <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p class="text-text-light/40 body-m animate-pulse">Ищем лучшие фильмы для вас...</p>
        </div>

        <!-- Results Grid -->
        <div v-else-if="allMovies.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[32px]">
          <MovieCard 
            v-for="(movie, index) in allMovies.slice(0, displayCount)" 
            :key="movie.id || index"
            size="m"
            :posterUrl="movie.posterUrl"
            :rating="movie.rating"
            :statusText="movie.statusText"
            :year="movie.year"
            :ageLimit="movie.ageLimit"
            :genres="movie.genres"
            :slug="movie.slug"
          />
        </div>
        
        <!-- Empty State -->
        <div v-else-if="!isLoading" class="flex flex-col items-center justify-center py-[100px] text-center gap-[24px] bg-white/5 rounded-[32px] border border-white/5">
          <div class="p-8 bg-white/5 rounded-full">
            <svg class="w-16 h-16 text-text-light/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div class="space-y-2">
            <p class="heading-m text-text-light">По вашему запросу ничего не найдено</p>
            <p class="body-m text-text-light/40">Попробуйте изменить запрос или поискать в каталоге</p>
          </div>
          <BaseButton variant="primary" size="l" class="px-8" @click="$router.push('/catalog')">Перейти в каталог</BaseButton>
        </div>

        <!-- Load More Button -->
        <div v-if="!isLoading && displayCount < allMovies.length" class="flex justify-center mt-[64px]">
          <BaseButton variant="secondary" size="l" @click="loadMore">
            Показать еще
          </BaseButton>
        </div>
      </div>

    </Container>
  </main>
</template>
