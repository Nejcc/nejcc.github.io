<template>
  <nav class="bg-white shadow-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex">
          <div class="flex-shrink-0">
            <img src="/mnt/data/image.png" alt="After.si Logo" class="h-10">
          </div>
          <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
            <a href="#" @click.prevent="$emit('switch-panel', 'home')" class="text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium">{{ t.navbar.home }}</a>
            <a href="#" @click.prevent="$emit('switch-panel', 'services')" class="text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium">{{ t.navbar.services }}</a>
            <a href="#" @click.prevent="$emit('switch-panel', 'about')" class="text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium">{{ t.navbar.about }}</a>
            <a href="#" @click.prevent="$emit('switch-panel', 'contact')" class="text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium">{{ t.navbar.contact }}</a>
          </div>
        </div>
        <div class="flex items-center">
          <select @change="switchLanguage($event)" class="bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            <option value="en">English</option>
            <option value="sl">Slovenian</option>
          </select>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  props: ['t'],
  methods: {
    switchLanguage(event) {
      this.$emit('switch-language', event.target.value);
    }
  }
};
</script>
