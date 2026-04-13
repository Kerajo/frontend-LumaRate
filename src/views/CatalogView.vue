<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Container from '../components/Container.vue'
import BaseDropdown from '../components/BaseDropdown.vue'
import SortToggle from '../components/SortToggle.vue'
import MovieCard from '../components/MovieCard.vue'
import BaseButton from '../components/BaseButton.vue'

const route = useRoute()
const router = useRouter()
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const allMovies = ref([])
const totalItems = ref(0)
const displayCount = ref(8)
const isLoading = ref(true)

// Фильтры и сортировка
const selectedGenre = ref(null)
const selectedCountry = ref(null)
const selectedYear = ref(null)
const activeSortTab = ref('Новые')
const contentType = ref(route.query.type || null)

// Метаданные
const genreOptions = ref([])
const countryOptions = ref([])
const yearOptions = computed(() => {
  const currentYear = 2026
  const years = []
  for (let y = currentYear; y >= 1980; y--) {
    years.push(y)
  }
  return years
})

const mapMovie = (movie) => ({
  ...movie,
  rating: movie.siteRating ? movie.siteRating * 2 : 0,
  genres: movie.genres?.map(g => g.name) || [],
  ageLimit: movie.ageRating || '16+',
  statusText: movie.statusText || '' 
})

const fetchMetadata = async () => {
  try {
    const [genresRes, countriesRes] = await Promise.all([
      fetch(`${API_BASE_URL}/genres`),
      fetch(`${API_BASE_URL}/countries`)
    ])
    if (genresRes.ok) genreOptions.value = await genresRes.json()
    if (countriesRes.ok) countryOptions.value = await countriesRes.json()
  } catch (err) {
    console.error('Failed to fetch metadata:', err)
  }
}

const fetchMovies = async () => {
  // Обработка "Реки ИИ" (пустое состояние)
  if (activeSortTab.value === 'Реки ИИ') {
    allMovies.value = []
    totalItems.value = 0
    isLoading.value = false
    return
  }

  isLoading.value = true
  try {
    const params = new URLSearchParams({
      limit: '50',
      page: '1'
    })
    
    // Применяем фильтры
    if (contentType.value) params.append('type', contentType.value)
    if (selectedGenre.value) params.append('genre_ids', selectedGenre.value.id)
    if (selectedCountry.value) params.append('country_ids', selectedCountry.value.id)
    if (selectedYear.value) {
      params.append('year_from', selectedYear.value.toString())
      params.append('year_to', selectedYear.value.toString())
    }
    
    // Сортировка для API
    if (activeSortTab.value === 'Новые') params.append('sort', 'year_desc')
    if (activeSortTab.value === 'Высокий рейтинг') params.append('sort', 'rating_desc')

    const url = `${API_BASE_URL}/catalog?${params.toString()}`
    const response = await fetch(url)
    
    if (response.ok) {
      const data = await response.json()
      let movies = data.data.map(mapMovie)
      
      // Дополнительная локальная сортировка для гарантии (на случай проблем на бэкенде)
      if (activeSortTab.value === 'Высокий рейтинг') {
        movies.sort((a, b) => (b.siteRating || 0) - (a.siteRating || 0))
      } else if (activeSortTab.value === 'Новые') {
        movies.sort((a, b) => (b.year || 0) - (a.year || 0))
      }

      allMovies.value = movies
      totalItems.value = data.pagination?.total || data.data.length
    }
  } catch (err) {
    console.error('Failed to fetch movies:', err)
  } finally {
    isLoading.value = false
  }
}

const loadMore = () => {
  displayCount.value += 8
}

onMounted(async () => {
  await fetchMetadata()
  
  // Если в URL передан genre_id (переход с главной), находим этот жанр в списке
  if (route.query.genre_id) {
    const foundGenre = genreOptions.value.find(g => g.id === route.query.genre_id)
    if (foundGenre) {
      selectedGenre.value = foundGenre
    }
  }

  fetchMovies()
})

// Наблюдаем за любыми изменениями фильтров или сортировки
watch(
  [selectedGenre, selectedCountry, selectedYear, activeSortTab, () => route.query.type],
  ([newGenre, newCountry, newYear, newSort, newType]) => {
    contentType.value = newType || null
    displayCount.value = 8
    fetchMovies()
  }
)

const pageTitle = computed(() => {
  if (contentType.value === 'MOVIE') return 'Фильмы'
  if (contentType.value === 'SERIES') return 'Сериалы'
  if (contentType.value === 'CARTOON') return 'Мультфильмы'
  return 'Каталог'
})
</script>

<template>
  <main class="w-full pt-[160px] pb-[64px] min-h-screen bg-bg-body">
    <Container>
      
      <!-- Head -->
      <div class="flex flex-col gap-[24px]">
        
        <!-- Breadcrumbs -->
        <div class="flex items-center gap-[8px] body-m">
          <router-link to="/" class="text-text-light opacity-60 hover:opacity-100 transition-opacity">Главная</router-link>
          <span class="text-text-light opacity-60">/</span>
          <span class="text-text-light">{{ pageTitle }}</span>
        </div>
 
        <!-- Title -->
        <h1 class="text-4xl font-bold text-text-light">{{ pageTitle }}</h1>

        <!-- Controls (Filters & Sort) -->
        <div class="flex flex-col lg:flex-row justify-between w-full mt-[8px] gap-[24px]">
          
          <!-- Filters -->
          <div class="flex flex-wrap gap-[16px]">
            <BaseDropdown label="Жанры" :options="genreOptions" v-model="selectedGenre" />
            <BaseDropdown label="Страны" :options="countryOptions" v-model="selectedCountry" />
            <BaseDropdown label="Годы" :options="yearOptions" v-model="selectedYear" />
          </div>

          <!-- Sorting -->
          <SortToggle v-model="activeSortTab" />

        </div>
      </div>

      <!-- Grid -->
      <div class="mt-[64px]">
        <!-- AI Rivers Temporary Empty State -->
        <div v-if="activeSortTab === 'Реки ИИ'" class="flex flex-col items-center justify-center py-[100px] text-center gap-[24px] bg-bg-content rounded-[32px] border border-white/5">
          <div class="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary animate-pulse">
            <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div class="space-y-4">
            <h3 class="heading-m text-text-light">Рекомендации ИИ временно недоступны</h3>
            <p class="body-m text-text-light/40 max-w-[400px] mx-auto">Мы обучаем нейросеть подбирать контент специально под ваш вкус. Скоро здесь будет жарко!</p>
          </div>
        </div>

        <div v-else-if="!isLoading" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[32px]">
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
        
        <div v-else-if="isLoading" class="flex justify-center py-[100px]">
          <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>

        <div v-if="!isLoading && allMovies.length === 0 && activeSortTab !== 'Реки ИИ'" class="text-center py-[100px] text-text-light/40 bg-bg-content/50 rounded-[32px] border border-dashed border-white/5">
          Контент не найден по выбранным фильтрам
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
