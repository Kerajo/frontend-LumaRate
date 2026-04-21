<script setup>
import { ref, onMounted } from 'vue'
import MovieCategoryBlock from './MovieCategoryBlock.vue'
import MovieCard from './MovieCard.vue'
import BaseButton from './BaseButton.vue'
import IconSearchLine from './icons/IconSearchLine.vue'
import IconClose from './icons/IconClose.vue'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
const GEMINI_API_KEY = 'AIzaSyBFVSBbtcPn2oP9p1CuKH8d_IF1AMPlhCU'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`

const userQuery = ref('')
const isLoading = ref(false)
const error = ref(null)
const recommendations = ref(null)
const allAvailableMovies = ref([])

const suggestions = [
  'Хочу фильм про шпионов',
  'Что-то веселое на вечер',
  'Захватывающий триллер',
  'Мультфильм для всей семьи',
]

const mapMovie = (movie) => ({
  ...movie,
  rating: movie.siteRating ? movie.siteRating * 2 : 0,
  genres: movie.genres?.map((g) => g.name) || [],
  ageLimit: movie.ageLimit || '16+',
  statusText: movie.statusText || '',
})

const fetchAvailableMovies = async () => {
  try {
    // Получаем список фильмов для контекста ИИ (лимит 100 для полноты)
    const response = await fetch(`${API_BASE_URL}/catalog?limit=100`)
    if (response.ok) {
      const data = await response.json()
      allAvailableMovies.value = data.data.map(mapMovie)
    }
  } catch (err) {
    console.error('Failed to fetch movies for AI context:', err)
  }
}

const getRecommendations = async (query) => {
  if (!query.trim()) return

  userQuery.value = query
  isLoading.value = true
  error.value = null
  recommendations.value = null

  try {
    const movieContext = allAvailableMovies.value.map((m) => ({
      title: m.title,
      slug: m.slug,
      genres: m.genres,
      description: m.shortDescription || m.description,
    }))

    const prompt = `
      Ты — интеллектуальный помощник видеосервиса LumaRate. Твоя задача — рекомендовать фильмы пользователю на основе его запроса и нашего каталога.
      
      Каталог фильмов:
      ${JSON.stringify(movieContext)}
      
      Запрос пользователя: "${query}"
      
      Правила:
      1. Выбери от 2 до 8 наиболее подходящих фильмов из предоставленного выше каталога.
      2. Если в каталоге нет точного совпадения, выбери наиболее близкие по жанру или настроению.
      3. Ответ ДОЛЖЕН быть строго в формате JSON:
      {
        "explanation": "Короткое (2-3 предложения) приветливое объяснение выбора на русском языке",
        "recommendedSlugs": ["slug1", "slug2", ...]
      }
      4. Не выдумывай фильмы, которых нет в списке.
      5. Используй только slug для идентификации рекомендаций.
    `

    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) throw new Error('AI service error')

    const data = await response.json()
    const aiText = data.candidates[0].content.parts[0].text

    // Очистка от markdown если ИИ его добавил
    const jsonStr = aiText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()
    const result = JSON.parse(jsonStr)

    // Маппим полученные slug обратно в объекты фильмов
    const recommendedMovies = result.recommendedSlugs
      .map((slug) => allAvailableMovies.value.find((m) => m.slug === slug))
      .filter((m) => !!m)

    recommendations.value = {
      explanation: result.explanation,
      movies: recommendedMovies,
    }
  } catch (err) {
    console.error('AI Recommendation failed:', err)
    error.value = 'К сожалению, ИИ временно не может подобрать рекомендации. Попробуйте позже.'
  } finally {
    isLoading.value = false
  }
}

const reset = () => {
  userQuery.value = ''
  recommendations.value = null
  error.value = null
}

onMounted(fetchAvailableMovies)
</script>

<template>
  <MovieCategoryBlock title="ИИ Рекомендации" class="relative overflow-hidden">
    <div
      class="w-full bg-bg-content rounded-[32px] p-6 lg:p-10 border border-white/5 relative z-10"
    >
      <!-- Ambient light effect -->
      <div
        class="absolute -top-[100px] -right-[100px] w-[300px] h-[300px] bg-primary/10 blur-[100px] rounded-full pointer-events-none"
      ></div>

      <!-- Chat UI -->
      <div class="flex flex-col gap-8">
        <!-- Input Section -->
        <div class="max-w-[800px] w-full mx-auto flex flex-col gap-6">
          <div v-if="!recommendations && !isLoading" class="space-y-2">
            <h3 class="heading-m text-text-light">Что вы хотите посмотреть?</h3>
            <p class="body-m text-text-light/40">
              Опишите ваше настроение или предпочтения, и наш ИИ подберет идеальный фильм.
            </p>
          </div>

          <div class="relative group">
            <input
              v-model="userQuery"
              type="text"
              placeholder="Например: хочу захватывающий детектив про космос"
              class="w-full bg-transparent border-b-2 border-text-light/10 focus:border-primary text-text-light lg:heading-m heading-s py-4 outline-none transition-colors placeholder:text-text-light/20 pr-[120px]"
              @keyup.enter="getRecommendations(userQuery)"
              :disabled="isLoading"
            />

            <div class="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <IconClose
                v-if="userQuery && !isLoading"
                class="w-6 h-6 text-text-light/40 hover:text-text-light cursor-pointer transition-colors"
                @click="reset"
              />
              <BaseButton
                v-if="userQuery"
                variant="primary"
                size="s"
                class="rounded-full"
                :loading="isLoading"
                @click="getRecommendations(userQuery)"
              >
                <template v-if="!isLoading">Найти</template>
              </BaseButton>
              <IconSearchLine
                v-else
                class="w-6 h-6 text-text-light/20 group-focus-within:text-primary transition-colors pointer-events-none"
              />
            </div>
          </div>

          <!-- Suggestions -->
          <div v-if="!recommendations && !isLoading" class="flex flex-wrap gap-2 mt-2">
            <button
              v-for="s in suggestions"
              :key="s"
              @click="getRecommendations(s)"
              class="px-4 py-2 rounded-full bg-white/5 border border-white/5 text-text-light/60 body-small-medium hover:bg-primary/20 hover:text-primary hover:border-primary/20 transition-all"
            >
              {{ s }}
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="flex flex-col items-center justify-center py-12 gap-4">
          <div
            class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"
          ></div>
          <p class="text-text-light/40 body-m animate-pulse">Анализируем каталог LumaRate...</p>
        </div>

        <!-- Error State -->
        <div
          v-if="error"
          class="bg-error/10 border border-error/20 rounded-2xl p-4 text-error text-center"
        >
          {{ error }}
        </div>

        <!-- Results Display -->
        <div
          v-if="recommendations"
          class="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700"
        >
          <!-- AI Explanation -->
          <div
            class="flex items-start gap-4 bg-white/5 p-6 rounded-2xl border border-white/5 max-w-[900px]"
          >
            <div
              class="w-10 h-10 bg-primary/20 rounded-full flex-shrink-0 flex items-center justify-center text-primary"
            >
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div class="space-y-1">
              <p class="label-normal text-primary uppercase tracking-wider">Luma AI</p>
              <p class="body-normal-regular text-text-light/70 leading-relaxed">
                "{{ recommendations.explanation }}"
              </p>
            </div>
          </div>

          <!-- Movie Grid -->
          <div
            class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6"
          >
            <MovieCard
              v-for="movie in recommendations.movies"
              :key="movie.id"
              size="m"
              :posterUrl="movie.posterUrl"
              :rating="movie.rating"
              :statusText="movie.statusText"
              :year="movie.year"
              :ageLimit="movie.ageLimit"
              :genres="movie.genres"
              :slug="movie.slug"
              fluid
            />
          </div>

          <div class="flex justify-center">
            <BaseButton variant="secondary" size="m" @click="reset"> Новый поиск </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </MovieCategoryBlock>
</template>

<style scoped>
.animate-in {
  animation-duration: 0.7s;
  animation-fill-mode: both;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideInFromBottom {
  from {
    transform: translateY(20px);
  }
  to {
    transform: translateY(0);
  }
}

.fade-in {
  animation-name: fadeIn;
}

.slide-in-from-bottom-4 {
  animation-name: slideInFromBottom;
}
</style>
