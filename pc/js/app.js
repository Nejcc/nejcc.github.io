Vue.component('button-counter', {
    data: function () {
        return {
            count: 0
        }
    },
    template: '<button @click="count++" :class="">You clicked me {{ count }} times.</button>'
})

Vue.component('blog-post', {
    props: ['title'],
    template: '<h3>{{ title }}</h3>'
})