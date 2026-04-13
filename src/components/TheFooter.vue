<script setup>
import Container from './Container.vue'
import IconButton from './IconButton.vue'
import IconSocialFacebook from './icons/IconSocialFacebook.vue'
import IconSocialInstagram from './icons/IconSocialInstagram.vue'
import IconSocialTelegram from './icons/IconSocialTelegram.vue'
</script>

<template>
  <footer class="lg:mt-[64px] mt-[32px] w-full">
    <div class="bg-bg-content lg:rounded-t-[32px] rounded-t-[24px] lg:pt-[80px] lg:pb-[80px] pt-[48px] pb-[40px]">
      <Container>
        <div class="flex flex-col lg:gap-[48px] gap-[40px]">
          
          <!-- Top Section -->
          <div class="flex flex-col lg:flex-row w-full justify-between items-center lg:items-start gap-[40px] lg:gap-[24px]">
            <!-- Left Side / Logo & Socials -->
            <div class="flex flex-col items-center lg:items-start gap-[24px]">
              <img src="/Logo.svg" alt="LumaRate" class="w-auto lg:h-[80px] h-[56px]" />
              
              <div class="flex flex-row gap-[12px]">
                <IconButton variant="tertiary" size="m">
                  <IconSocialFacebook class="w-5 h-5 fill-current text-text-light/60" />
                </IconButton>
                <IconButton variant="tertiary" size="m">
                  <IconSocialInstagram class="w-5 h-5 fill-current text-text-light/60" />
                </IconButton>
                <IconButton variant="tertiary" size="m">
                  <IconSocialTelegram class="w-5 h-5 fill-current text-text-light/60" />
                </IconButton>
              </div>
            </div>

            <!-- Right Side / Navigation Links -->
            <div class="flex flex-col sm:flex-row gap-[32px] lg:gap-[24px] w-full lg:max-w-[600px] justify-between text-center lg:text-left">
              <!-- Column 1 -->
              <div class="flex flex-col gap-[16px] lg:gap-[24px] flex-1">
                <h4 class="text-text-light heading-s">Контент</h4>
                <div class="flex flex-col gap-[12px] lg:gap-[16px]">
                  <a href="#" class="text-text-light opacity-70 hover:opacity-100 transition-opacity body-normal-regular">Фильмы</a>
                  <a href="#" class="text-text-light opacity-70 hover:opacity-100 transition-opacity body-normal-regular">Сериалы</a>
                  <a href="#" class="text-text-light opacity-70 hover:opacity-100 transition-opacity body-normal-regular">Мультфильмы</a>
                </div>
              </div>

              <!-- Column 2 -->
              <div class="flex flex-col gap-[16px] lg:gap-[24px] flex-1">
                <h4 class="text-text-light heading-s">Помощь</h4>
                <div class="flex flex-col gap-[12px] lg:gap-[16px]">
                  <a href="#" class="text-text-light opacity-70 hover:opacity-100 transition-opacity body-normal-regular">Список устройств</a>
                  <a href="#" class="text-text-light opacity-70 hover:opacity-100 transition-opacity body-normal-regular">Дистрибьюторам</a>
                  <a href="#" class="text-text-light opacity-70 hover:opacity-100 transition-opacity body-normal-regular">Контакты</a>
                </div>
              </div>
            </div>

          </div>
          
          <!-- Bottom Section -->
          <div class="flex flex-col lg:flex-row justify-between items-center gap-4 text-[14px] leading-[20px] text-text-light opacity-50 text-center lg:text-left">
            <p>© 2026 TOO «Luma». Все права защищены</p>
            <a href="#" class="hover:opacity-100 transition-opacity">Политика конфиденциальности</a>
          </div>

        </div>
      </Container>
    </div>
  </footer>
</template>
