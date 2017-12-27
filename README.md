# View.js

Single page component HTML5 video player component for Vue.js

DEMO: https://liamtarpey.github.io/View.js/

## Running this repository

Clone this repository and run ` yarn ` or ` npm install ` to install all the dependencies.

You can then run ` npm run build ` and this project will be running on ` localhost:8080 `.

You might need to install some dependencies globally if you haven't done so already previously.

## Using the component in your project

Grab the ` viewjs.vue ` file in the ` src ` and copy it into your project.

You will need some kind of module bundler to handle the `.vue` file - I'm using webpack for this example.

1. Import the component into your project:
` import ViewJs from './viewjs.vue'; ` (or whatever path you need)

2. Define a data object that will be passed to the component on your parent component:
```
const videoWrapper = new Vue({
    el: '#video-wrapper',
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
        viewJs: ViewJs
    }
});
```

3. Include the component HTML in your page:
```
<div id="video-wrapper">
    <view-js :props="viewJs"></view-js>
</div>
```

## Options

In your data object, you can define the following:
- `allowFullScreen` | {Boolean} | if you want the full screen button to appear
- `preload`         | {String}  | if you want the video to preload on page load. possible values are: ` none `, ` auto ` & ` metadata `
- `sources`         | {Array}   | Array of objects containing ` url ` and ` type ` values
