<template>
  <section class="py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 class="text-center text-3xl font-bold mb-12">{{ t.contact.title }}</h2>
      <form class="max-w-lg mx-auto">
        <div class="mb-4">
          <label for="name" class="block text-gray-700">{{ t.contact.name }}</label>
          <input type="text" id="name" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required>
        </div>
        <div class="mb-4">
          <label for="email" class="block text-gray-700">{{ t.contact.email }}</label>
          <input type="email" id="email" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required>
        </div>
        <div class="mb-4">
          <label for="message" class="block text-gray-700">{{ t.contact.message }}</label>
          <textarea id="message" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" rows="3" required></textarea>
        </div>
        <button type="submit" class="w-full bg-blue-600 text-white py-2 px-4 rounded-md">{{ t.contact.submit }}</button>
      </form>
    </div>
  </section>
</template>

<script>
export default {
  props: ['t']
};
</script>
