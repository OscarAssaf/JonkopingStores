<template>
  <footer class="footer">
    <div class="footer__inner container">
      <div class="footer__brand">
        <span class="footer__logo">JC</span>
        <div>
          <p class="footer__name">Jönköping City Stores</p>
          <p class="footer__tagline">Your guide to shopping in Jönköping</p>
        </div>
      </div>
      <p class="footer__copy">
        &copy; {{ new Date().getFullYear() }} Jönköping City Stores. Built with Vue.js.
      </p>
    </div>
  </footer>
</template>
