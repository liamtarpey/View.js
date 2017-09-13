<template>
    <div id="app">
        <div class="video-wrapper">
            <ViewJs :props="viewJs"></ViewJs>
        </div>
    </div>
</template>

<script>

    // Import the .vue component from wherever it lives in your project
    import ViewJs from './components/ViewJs.vue';

    /**
     * Usage example
     * Ensure the component has a Vue element wrapper and
     * register the component like the example below
     */
    export default {
        data: function() {
            return {
                viewJs: {
                    allowFullScreen: true,
                    preload: 'auto',
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
            ViewJs
        }
    };
</script>

<style>
    .video-wrapper {
        width: 100%;
        margin: auto;
        max-width: 700px;
    }
</style>
