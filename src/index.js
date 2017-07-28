// Import Vue.js library
import Vue from 'vue';

// Import the .vue component from wherever it lives in your project
import ViewJs from './viewjs.vue';

/**
 * Usage example
 * Ensure the component has a Vue element wrapper and
 * register the component  like the example below
 */
const videoWrapper = new Vue({
    el: '#video-wrapper',
    components: {
        viewJs: ViewJs
    }
});
