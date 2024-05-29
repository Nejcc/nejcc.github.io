<template>
  <section class="bg-gray-100 py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 class="text-center text-3xl font-bold mb-12">{{ t.about.title }}</h2>
      <p class="text-center text-lg">{{ t.about.description }}</p>
    </div>
  </section>
</template>

<script>
export default {
  props: ['t']
};
</script>
