<template>
  <section class="py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 class="text-center text-3xl font-bold mb-12">{{ t.services.title }}</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <div v-for="service in services" :key="service.title" class="bg-white shadow-md rounded-lg p-6">
          <img :src="service.image" alt="Service Image" class="w-full h-48 object-cover mb-4 rounded">
          <h5 class="text-xl font-bold mb-2">{{ t.services[service.title] }}</h5>
          <p>{{ service.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  props: ['t'],
  data() {
    return {
      services: [
        {
          title: "business_solutions",
          description: "Tailored solutions to meet your business needs and drive growth.",
          image: "https://placehold.co/300x200"
        },
        {
          title: "financial_advising",
          description: "Expert financial advice to help you make informed decisions.",
          image: "https://placehold.co/300x200"
        },
        {
          title: "job_seeking_help",
          description: "Guidance and resources to assist you in finding the right job.",
          image: "https://placehold.co/300x200"
        },
        {
          title: "web_development",
          description: "Professional web development services to build your online presence.",
          image: "https://placehold.co/300x200"
        },
        {
          title: "custom_app_dev",
          description: "Bespoke applications designed to meet your specific requirements.",
          image: "https://placehold.co/300x200"
        }
      ]
    }
  }
};
</script>
