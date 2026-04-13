<script setup>
</script>

<template>
  <div class="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
    <div class="bg-zinc-900 border border-zinc-800 p-10 rounded-2xl max-w-md shadow-2xl">
      <div class="mb-6 flex justify-center">
        <div class="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 9-6 6"/><path d="m9 9 6 6"/><circle cx="12" cy="12" r="10"/></svg>
        </div>
      </div>
      <h1 class="text-3xl font-bold text-white mb-4">Доступ ограничен</h1>
      <p class="text-zinc-400 mb-8 leading-relaxed">
        У вас недостаточно прав для просмотра этого раздела. Пожалуйста, обратитесь к администратору, если вы считаете, что это ошибка.
      </p>
      <router-link 
        to="/" 
        class="inline-block py-3 px-8 bg-zinc-100 text-zinc-950 font-semibold rounded-xl hover:bg-white transition-colors duration-200"
      >
        Вернуться на главную
      </router-link>
    </div>
  </div>
</template>
