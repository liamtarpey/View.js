// Import Vue.js library
import Vue from 'vue';

// Import the .vue component from wherever it lives in your project
import ViewJs from './viewjs.vue';

/**
 * Usage example
 * Ensure the component has a Vue element wrapper and
 * register the component like the example below
 */
const videoWrapper = new Vue({
    el: '#video-wrapper',
    data: function() {
        return {
            viewJs: {
                allowFullScreen: true,
                preload: 'none',
                sources: [
                    {
                        url: 'http://nettuts.s3.amazonaws.com/763_sammyJSIntro/trailer_test.mp4',
                        type: 'video/mp4'
                    },
                    {
                        url: 'http://nettuts.s3.amazonaws.com/763_sammyJSIntro/trailer_test.ogg',
                        type: 'video/ogg'
                    }
                ]
            }
        }
    },
    components: {
        viewJs: ViewJs
    }
});
