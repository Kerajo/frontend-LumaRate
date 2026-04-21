<script setup>
import { ref, watch, nextTick } from 'vue'
import BaseButton from './BaseButton.vue'
import IconSearchLine from './icons/IconSearchLine.vue'
import IconClose from './icons/IconClose.vue'

const props = defineProps({
  movie: {
    type: Object,
    required: true,
  },
})

const GEMINI_API_KEY = 'AIzaSyBFVSBbtcPn2oP9p1CuKH8d_IF1AMPlhCU'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`

const messages = ref([])
const userInput = ref('')
const isLoading = ref(false)
const chatContainer = ref(null)
const isChatVisible = ref(false)

const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

const toggleChat = () => {
  isChatVisible.value = true
}

const sendMessage = async () => {
  if (!userInput.value.trim() || isLoading.value) return

  const query = userInput.value.trim()
  messages.value.push({ role: 'user', text: query })
  userInput.value = ''
  isLoading.value = true

  await scrollToBottom()

  try {
    const movieData = {
      title: props.movie.title,
      description: props.movie.description,
      genres: props.movie.genres?.map((g) => g.name).join(', '),
      directors: props.movie.directors?.map((d) => d.fullName).join(', '),
      actors: props.movie.actors?.map((a) => a.fullName).join(', '),
      year: props.movie.year,
      rating: props.movie.ratings?.siteRating,
    }

    const prompt = `
      Ты — ассистент по фильмам на сайте LumaRate. Отвечай на вопросы пользователя о текущем фильме.
      
      Информация о фильме:
      Название: ${movieData.title}
      Год: ${movieData.year}
      Жанры: ${movieData.genres}
      Режиссеры: ${movieData.directors}
      Актеры: ${movieData.actors}
      Описание: ${movieData.description}
      Рейтинг: ${movieData.rating}
      
      Инструкции:
      1. Отвечай кратко и дружелюбно на русском языке.
      2. Используй ТОЛЬКО предоставленную информацию или общеизвестные факты об этом фильме.
      3. Если информации недостаточно или вопрос не касается фильма, вежливо ответь, что не обладаешь такими данными.
      4. Не выдумывай сюжетные повороты, если их нет в описании.
      5. Отвечай простым текстом без форматирования JSON или Markdown (кроме абзацев).
      
      Вопрос пользователя: "${query}"
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

    if (!response.ok) throw new Error('AI error')

    const data = await response.json()
    const aiText = data.candidates[0].content.parts[0].text.trim()

    messages.value.push({ role: 'ai', text: aiText })
  } catch (err) {
    console.error('Chat AI failed:', err)
    messages.value.push({
      role: 'ai',
      text: 'Извините, произошла ошибка при обработке запроса. Попробуйте позже.',
    })
  } finally {
    isLoading.value = false
    await scrollToBottom()
  }
}

const clearChat = () => {
  messages.value = []
}
</script>

<template>
  <div class="flex flex-col gap-8 w-full">
    <!-- Header -->
    <h2 class="lg:heading-xl heading-m text-text-light">Спросить у Luma AI</h2>

    <!-- Expandable Container -->
    <div
      @click="!isChatVisible && toggleChat()"
      :class="[
        'bg-bg-content rounded-[24px] border border-white/5 flex flex-col transition-all duration-500 ease-in-out cursor-default',
        !isChatVisible ? 'h-[100px] cursor-pointer hover:bg-white/5 active:scale-[0.99]' : 'h-[500px]',
      ]"
    >
      <!-- Initial CTA (Visible only when collapsed) -->
      <div
        v-if="!isChatVisible"
        class="h-full flex items-center justify-between px-8 animate-in fade-in duration-500"
      >
        <div class="flex flex-col gap-1">
          <p class="body-m text-text-light">Задайте любой вопрос о фильме!</p>
          <p class="body-s text-text-light/40">Сюжет, актеры или интересные факты</p>
        </div>
        <BaseButton variant="primary" size="s" class="rounded-full px-6">
          Задать вопрос
        </BaseButton>
      </div>

      <!-- Chat Board (Visible only when expanded) -->
      <div v-else class="flex flex-col h-full overflow-hidden animate-in fade-in duration-700">
        <!-- Messages Area -->
        <div
          ref="chatContainer"
          class="flex-grow overflow-y-auto p-6 flex flex-col gap-4 custom-scrollbar"
        >
          <div
            v-if="messages.length === 0"
            class="h-full flex flex-col items-center justify-center text-center gap-4 opacity-40 px-10"
          >
            <p class="body-m text-text-light">Задайте любой вопрос ИИ о фильме</p>
            <p class="body-s text-text-light/60">
              "О чем этот фильм?", "Кто в главных ролях?", "Какой жанр?"
            </p>
          </div>

          <div
            v-for="(msg, index) in messages"
            :key="index"
            :class="[
              'max-w-[85%] p-4 rounded-[20px] body-normal-regular leading-relaxed animate-in fade-in slide-in-from-bottom-1 duration-300',
              msg.role === 'user'
                ? 'self-end bg-primary/10 text-text-light rounded-tr-[4px] border border-primary/20'
                : 'self-start bg-white/5 text-text-light/90 rounded-tl-[4px] border border-white/5',
            ]"
          >
            {{ msg.text }}
          </div>

          <div
            v-if="isLoading"
            class="self-start bg-white/5 p-4 rounded-[20px] rounded-tl-[4px] border border-white/5 flex gap-2"
          >
            <div class="w-2 h-2 bg-text-light/20 rounded-full animate-bounce"></div>
            <div
              class="w-2 h-2 bg-text-light/20 rounded-full animate-bounce [animation-delay:0.2s]"
            ></div>
            <div
              class="w-2 h-2 bg-text-light/20 rounded-full animate-bounce [animation-delay:0.4s]"
            ></div>
          </div>
        </div>

        <!-- Input Area && Header Tools -->
        <div class="p-4 border-t border-white/5 bg-black/10">
          <div class="flex items-center justify-between mb-4 px-2">
            <p class="label-normal text-primary/60 uppercase tracking-widest">Luma AI Chat</p>
            <button
              v-if="messages.length"
              @click.stop="clearChat"
              class="body-s text-text-light/40 hover:text-text-light transition-colors"
            >
              Очистить историю
            </button>
          </div>

          <div class="relative flex items-center group">
            <input
              v-model="userInput"
              type="text"
              placeholder="Ваш вопрос о фильме..."
              class="w-full bg-white/5 rounded-full py-3 pl-6 pr-[120px] text-text-light body-normal-regular outline-none focus:bg-white/10 border border-transparent focus:border-primary/30 transition-all placeholder:text-text-light/20"
              @keyup.enter="sendMessage"
              :disabled="isLoading"
              @click.stop
            />
            <div class="absolute right-2 flex items-center gap-2">
              <IconClose
                v-if="userInput && !isLoading"
                class="w-5 h-5 text-text-light/40 hover:text-text-light cursor-pointer"
                @click.stop="userInput = ''"
              />
              <BaseButton
                v-if="userInput"
                variant="primary"
                size="s"
                class="rounded-full !py-1 !px-4"
                :loading="isLoading"
                @click.stop="sendMessage"
              >
                Отправить
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.1);
}

.animate-in {
  animation-fill-mode: both;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes slideInFromBottom {
  from { transform: translateY(10px); }
  to { transform: translateY(0); }
}
.fade-in { animation-name: fadeIn; }
.slide-in-from-bottom-1 { animation-name: slideInFromBottom; }
</style>
