<script setup>
import Container from './Container.vue'
import IconButton from './IconButton.vue'
import IconSocialFacebook from './icons/IconSocialFacebook.vue'
import IconSocialInstagram from './icons/IconSocialInstagram.vue'
import IconSocialTelegram from './icons/IconSocialTelegram.vue'
</script>

<template>
  <footer class="mt-[64px] w-full">
    <div class="bg-bg-content rounded-t-[32px] pt-[80px] pb-[80px]">
      <Container>
        <div class="flex flex-col gap-[48px]">
          
          <!-- Top Section -->
          <div class="flex w-full justify-between items-start gap-[24px]">
            <!-- Left Side / Logo & Socials -->
            <div class="flex flex-col gap-[24px]">
              <img src="/Logo.svg" alt="LumaRate" class="w-auto h-[80px] mr-auto" />
              
              <div class="flex flex-row gap-[8px]">
                <IconButton variant="tertiary" size="m">
                  <IconSocialFacebook class="w-5 h-5 fill-current" />
                </IconButton>
                <IconButton variant="tertiary" size="m">
                  <IconSocialInstagram class="w-5 h-5 fill-current" />
                </IconButton>
                <IconButton variant="tertiary" size="m">
                  <IconSocialTelegram class="w-5 h-5 fill-current" />
                </IconButton>
              </div>
            </div>

            <!-- Right Side / Navigation Links -->
            <!-- The user previously mentioned gap 24px for columns in the top section  -->
            <div class="flex gap-[24px] w-full max-w-[600px] justify-between">
              <!-- Column 1 -->
              <div class="flex flex-col gap-[24px] flex-1">
                <h4 class="text-text-light heading-s">Контент</h4>
                <div class="flex flex-col gap-[16px]">
                  <a href="#" class="text-text-light opacity-70 hover:opacity-100 transition-opacity">Фильмы</a>
                  <a href="#" class="text-text-light opacity-70 hover:opacity-100 transition-opacity">Сериалы</a>
                  <a href="#" class="text-text-light opacity-70 hover:opacity-100 transition-opacity">Мультфильмы</a>
                </div>
              </div>

              <!-- Column 2 -->
              <div class="flex flex-col gap-[24px] flex-1">
                <h4 class="text-text-light heading-s">Помощь</h4>
                <div class="flex flex-col gap-[16px]">
                  <a href="#" class="text-text-light opacity-70 hover:opacity-100 transition-opacity">Список устройств</a>
                  <a href="#" class="text-text-light opacity-70 hover:opacity-100 transition-opacity">Дистрибьюторам</a>
                  <a href="#" class="text-text-light opacity-70 hover:opacity-100 transition-opacity">Контакты</a>
                </div>
              </div>
            </div>

          </div>

          <!-- Divider isn't shown in image, but there's a large gap before bottom -->
          
          <!-- Bottom Section -->
          <div class="flex justify-between items-center text-[14px] leading-[20px] text-text-light opacity-50">
            <p>© 2026 TOO «Luma». Все права защищены</p>
            <a href="#" class="hover:opacity-100 transition-opacity">Политика конфиденциальности</a>
          </div>

        </div>
      </Container>
    </div>
  </footer>
</template>
