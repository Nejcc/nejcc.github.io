<template>
  <section class="bg-blue-600 text-white text-center py-20">
    <h1 class="text-4xl font-bold">{{ t.welcome.title }}</h1>
    <p class="mt-4 text-lg">{{ t.welcome.description }}</p>
    <p class="mt-4 text-md">We help businesses thrive by providing top-notch services tailored to their unique needs. From strategic financial advice to custom application development, our team of experts is dedicated to delivering solutions that drive success.</p>
    <a href="#" @click.prevent="$emit('switch-panel', 'services')" class="mt-8 inline-block bg-blue-800 text-white py-2 px-4 rounded">{{ t.welcome.more_info }}</a>
  </section>
</template>

<script>
export default {
  props: ['t']
};
</script>
