<script setup>
defineProps({
  storeCount: { type: Number, default: 0 },
})
</script>

<template>
  <section class="hero">
    <div class="hero__image">
      <img
  src="../assets/img/Jonkoping_MorgonljusEDIT.jpg"
  alt="Panoramic view of Jönköping city and Lake Vättern"
  loading="eager"
/>

      <div class="hero__overlay"></div>
    </div>
    <div class="hero__content container">
      <p class="hero__eyebrow">Discover your new favorite store in Jönköping</p>
      <h1 class="hero__title">Jönköping City Stores</h1>
      <p class="hero__subtitle">
        Explore over {{ storeCount }} shops, boutiques, and restaurants across Jönköping to find the best way to spend your day.
      </p>
      <a href="#stores" class="btn btn--primary btn--lg">Browse stores</a>
    </div>
  </section>
</template>
