<template>
    <div class="VJS_video-player-wrapper" v-on:keydown.space="clickVideoButton" tabindex="0">
        <div class="VJS_video-spinner" v-if="showSpinner">
            <div class="VJS_video-spinner__inner"></div>
        </div>
        <video class="VJS_video-player" ref="videoPlayer" v-on:click="clickVideoButton" :preload="props.preload">
            <source v-for="source in props.sources" :src="source.url" :type="source.type" />
            Your browser does not support HTML5 video.
        </video>
        <div class="VJS_controls" ref="videoControls" v-bind:class="{ 'VJS_controls--fixed': !videoBeingPlayed }">
            <button class="VJS_controls__button"
                    v-on:click="clickVideoButton"
                    v-bind:class="{
                        'VJS_controls__button--play': !videoBeingPlayed,
                        'VJS_controls__button--pause': videoBeingPlayed
                    }">
            </button>
            <div class="VJS_controls__bar">
                <div ref="progressBar" class="VJS_controls__progress" v-on:click="clickSkipToPosition($event)">
                    <div class="VJS_controls__progress-time" v-if="timeElapsed">{{ timeElapsed }}</div>
                    <span class="VJS_controls__progress-back" v-bind:class="{ 'VJS_started': percentagePlayed !== 0 }" v-bind:style="{ width: percentagePlayed }"></span>
                    <div class="VJS_controls__progress-ranges">
                        <span class="VJS_controls__progress-range" v-for="range in bufferRanges" v-bind:style="{ left: range.start, width: range.end }"></span>
                    </div>
                </div>
                <div class="VJS_controls__time">{{ timeRemaining }}</div>
                <div class="VJS_controls__volume">
                    <div class="VJS_controls__volume-bar" v-bind:class="{ 'VJS_controls__volume-bar--active': volume >= 0.2 }" v-on:click="clickAdjustVolume(0.2)"></div>
                    <div class="VJS_controls__volume-bar" v-bind:class="{ 'VJS_controls__volume-bar--active': volume >= 0.4 }" v-on:click="clickAdjustVolume(0.4)"></div>
                    <div class="VJS_controls__volume-bar" v-bind:class="{ 'VJS_controls__volume-bar--active': volume >= 0.6 }" v-on:click="clickAdjustVolume(0.6)"></div>
                    <div class="VJS_controls__volume-bar" v-bind:class="{ 'VJS_controls__volume-bar--active': volume >= 0.8 }" v-on:click="clickAdjustVolume(0.8)"></div>
                    <div class="VJS_controls__volume-bar" v-bind:class="{ 'VJS_controls__volume-bar--active': volume === 1 }" v-on:click="clickAdjustVolume(1)"></div>
                </div>
                <div class="VJS_controls__full-screen" v-on:click="clickEnterFullScreen" v-if="props.allowFullScreen">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

    // Private vars
    let vm = null;
    let videoPlayer = null;
    let videoControls = null;
    let progressBar = null;
    let progressLoop = null;
    const fileName = 'ViewJs.vue';

    /**
     * Logs an error with the filename
     * @param {String} error
     */
    const logError = (error) => {
        console.error('View.JS:', fileName + ' -', error);
    };

    /**
     * Converts seconds to a human readable format
     * Checks if hours exists and prepends if needed
     * @param {Number} num | seconds to convert
     * @return {String} | human readable string 00:00:00
     */
    const secondsToHumanReadable = (num) => {
        let hours = Math.floor(num / 3600);
        let minutes = Math.floor((num % 3600) / 60);
        let seconds = num % 60;

        // Add leading zero if needed
        hours = (hours < 10) ? '0' + hours : hours;
        minutes = (minutes < 10) ? '0' + minutes : minutes;
        seconds = (seconds < 10) ? '0' + seconds : seconds;

        // If hours > 0, return string with hours prepended
        if(hours > 0) {
            return hours + ':' + minutes + ':' + seconds;
        }

        return minutes + ':' + seconds;
    };

    // Shows the time when hovering over the progress bar
    const showHoverTime = () => {
        progressBar.onmousemove = function(e) {
            const percentage = e.offsetX / progressBar.offsetWidth;
            const num = Math.floor(percentage * videoPlayer.duration);
            if(!isNaN(num)) {
                vm.timeElapsed = secondsToHumanReadable(num);
            }
        };
    };

    /**
     * On progress event we get the player's buffered attribute.
     * From here we can calculate an array of ranges to show
     * at what point the video has been loaded.
     */
    const calculateBufferRanges = () => {

        // Reset ranges every time
        vm.bufferRanges = [];

        // Loop through all ranges to calculate start and end times
        for(let i=0, l=videoPlayer.buffered.length; i<l; i++) {
            const totalDuration = videoPlayer.duration;
            const startTime = Math.floor((100 / totalDuration) * videoPlayer.buffered.start(i));
            const endTime = Math.floor((100 / totalDuration) * videoPlayer.buffered.end(i));
            vm.bufferRanges.push({
                start: startTime + '%',
                end: endTime + '%'
            });
        }
    };

    // Event listener for ended video
    const onVideoEnded = () => {
        vm.videoBeingPlayed = false;
    };

    // Click event handler for play/pause button
    const clickVideoButton = () => {

        if(vm.showSpinner) {
            return false;
        }

        (vm.videoBeingPlayed) ? pauseVideo() : playVideo();
    };

    // Handles video play event
    const playVideo = () => {
        videoPlayer.play();
        vm.videoBeingPlayed = true;
    };

    // Handles video pause event
    const pauseVideo = () => {
        videoPlayer.pause();
        vm.videoBeingPlayed = false;
    };

    // On timeupdate event, calculate remaining time of video
    const timeUpdate = () => {
        const duration = videoPlayer.duration;
        const currentTime = videoPlayer.currentTime;
        const percentage = Math.floor((100 / duration) * currentTime);
        const num = Math.round(duration - currentTime);
        vm.percentagePlayed = percentage + '%';
        vm.timeRemaining = secondsToHumanReadable(num);
    };

    // Click event handler for skipping to a certain position in the video
    const clickSkipToPosition = (e) => {
        const percentage = e.offsetX / progressBar.offsetWidth;
        videoPlayer.currentTime = percentage * videoPlayer.duration;
    };

    /**
     * Click event handler for volume control
     * @param {String} vol
     */
    const clickAdjustVolume = (vol) => {
        vm.volume = vol;
        videoPlayer.volume = vm.volume;
    };

    // Make the player full screen (fallbacks for all modern browsers)
    const clickEnterFullScreen = () => {
        if(videoPlayer.requestFullscreen) {
            videoPlayer.requestFullscreen();
        } else if(videoPlayer.webkitRequestFullScreen) {
            videoPlayer.webkitRequestFullScreen();
        } else if(videoPlayer.mozRequestFullScreen) {
            videoPlayer.mozRequestFullScreen();
        } else if (videoPlayer.msRequestFullscreen) {
            videoPlayer.msRequestFullscreen();
        }
    };

    // Shows buffering spinner
    const showSpinner = () => {
        vm.showSpinner = true;
    };

    // Hides buffering spinner
    const hideSpinner = () => {
        vm.showSpinner = false;
    };

    /**
     * Attaches all event listeners on init:
     *
     * - timeupdate | timeUpdate()            | ensures timer progresses during playback
     * - waiting    | showSpinner()           | shows the spinner when video is buffering
     * - canplay    | hideSpinner()           | hides the spinner when video stops buffering
     * - ended      | onVideoEnded()          | fires pause event on video to toggle button
     * - progress   | calculateBufferRanges() | loops through buffer ranges to show loaded chunks on progress bar
     */
    const attachEventListeners = () => {
        videoPlayer.addEventListener('timeupdate', timeUpdate);
        videoPlayer.addEventListener('waiting', showSpinner);
        videoPlayer.addEventListener('canplay', hideSpinner);
        videoPlayer.addEventListener('ended', onVideoEnded);
        videoPlayer.addEventListener('progress', calculateBufferRanges);
    };

    /**
     * Validate our main prop object that's passed through to our component.
     * @return {Object}
     */
    const getPropsValidation = () => {
        return {
            props: {
                type: Object,
                validator: function(prop) {

                    const sourceValues = ['url', 'type'];
                    const preloadValues = ['none', 'auto', 'metadata'];

                    if(!prop.hasOwnProperty('allowFullScreen')) {
                        logError('Missing `allowFullScreen` value in prop.');
                        return false;
                    }

                    if(!prop.hasOwnProperty('preload')) {
                        logError('Missing `preload` value in prop.');
                        return false;
                    } else if(preloadValues.indexOf(prop.preload) === -1) {
                        logError('`preload` value does not exist - Accepted values are: `none`, `auto` or `metadata`.');
                        return false;
                    }

                    if(!prop.hasOwnProperty('sources') || !prop.sources.length || !Array.isArray(prop.sources)) {
                        logError('`sources` value missing or badly constructed.');
                        return false;
                    }

                    for(let i=0, l=prop.sources.length; i<l; i++) {
                        for(let j=0, k=sourceValues.length; j<k; j++) {
                            if(!prop.sources[i].hasOwnProperty(sourceValues[j])) {
                                logError('source index[' + i + '] is missing property `' + sourceValues[j] + '`');
                                return false;
                            }
                        }
                    }

                    return true;
                }
            }
        };
    };

    /**
     * Construct object of public data
     * We expose this whole object publicly
     * All values are defaults
     */
    const getPublicData = () => {
        return {
            showSpinner: false,
            bufferRanges: [],
            videoBeingPlayed: false,
            percentagePlayed: 0,
            volume: 0.6,
            timeRemaining: '00:00',
            timeElapsed: null
        }
    };

    /**
     * Return all exposed methods
     * @return {Object} | all public methods
     */
    const getPublicMethods = () => {
        return {
            clickVideoButton,
            clickSkipToPosition,
            clickAdjustVolume,
            clickEnterFullScreen
        }
    };

    // Our default component setup
    const ViewJs = {
        props: getPropsValidation(),
        methods: getPublicMethods(),
        data: getPublicData,
        mounted: function() {

            // Vars
            vm = this;
            videoPlayer = vm.$refs.videoPlayer;
            videoControls = vm.$refs.videoControls;
            progressBar = vm.$refs.progressBar;

            // Attach all event listeners on load
            attachEventListeners();

            // Add hover event for progress bar
            showHoverTime();
        }
    };

    export default ViewJs;
</script>

<style scoped>
    .VJS_video-player-wrapper {
        position: relative;
        display: block;
    }
    .VJS_video-player-wrapper:hover .VJS_controls {
        opacity: 1;
        visibility: visible;
    }
    .VJS_video-player-wrapper:focus {
        outline: none;
    }
    .VJS_video-player {
        display: block;
        width: 100%;
        font-family: arial, sans-serif;
    }
    .VJS_video-spinner {
        position: absolute;
        top: 50%;
        left: 50%;
        margin: -30px 0 0 -30px;
        border-radius: 5px;
        background: rgba(0,0,0,0.6);
        padding: 14px;
        z-index: 99;
    }
    .VJS_video-spinner__inner,
    .VJS_video-spinner__inner:after {
        width: 20px;
        height: 20px;
        border-radius: 50%;
    }
    .VJS_video-spinner__inner {
        border: 16px solid rgba(255, 255, 255,.4);
        border-left: 16px solid #ffffff;
        animation: viewJsSpinner 1.1s infinite linear;
    }
    .VJS_controls {
        position: absolute;
        left: 12px;
        bottom: 12px;
        right: 12px;
        padding: 4px 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
    }
    .VJS_controls--fixed {
        opacity: 1;
        visibility: visible;
    }
    .VJS_controls__button {
        flex: 0 0 80px;
        display: block;
        position: relative;
        height: 40px;
        margin-right: 24px;
        text-align: center;
        background-color: rgba(0,0,0,.7);
        border-radius: 8px;
        border: none;
    }
    .VJS_controls__button:hover {
        cursor: pointer;
    }
    .VJS_controls__button:focus {
        outline: none;
    }
    .VJS_controls__button:before,
    .VJS_controls__button:after {
        content: '';
        position: absolute;
    }
    .VJS_controls__button--play:before {
        left: 50%;
        top: 50%;
        margin: -10px 0 0 -6px;
        width: 0;
        height: 0;
        border-top: 10px solid transparent;
        border-bottom: 10px solid transparent;
        border-left: 18px solid white;
    }
    .VJS_controls__button--pause:before,
    .VJS_controls__button--pause:after {
        height: 22px;
        width: 6px;
        background-color: white;
        top: 9px;
    }
    .VJS_controls__button--pause:before {
        left: 32px;
    }
    .VJS_controls__button--pause:after {
        left: 42px;
    }
    .VJS_controls__bar {
        display: flex;
        flex-grow: 1;
        align-items: center;
        background-color: rgba(0,0,0,.7);
        border-radius: 8px;
        height: 34px;
    }
    .VJS_controls__progress {
       flex: 1;
       margin: 0 20px;
       width: 100%;
       height: 6px;
       border-radius: 3px;
       background-color: black;
       position: relative;
    }
    .VJS_controls__progress:hover {
        cursor: pointer;
    }
    .VJS_controls__progress:hover .VJS_controls__progress-time {
        display: block;
    }
    .VJS_controls__progress-time {
        display: none;
        position: absolute;
        top: -40px;
        left: 50%;
        background-color: rgba(0,0,0,.7);
        color: #fff;
        padding: 4px 12px;
        border-top-left-radius: 5px;
        border-top-right-radius: 5px;
    }
    .VJS_controls__progress-back {
        position: absolute;
        height: 6px;
        top: 0;
        left: 0;
        width: 0;
        background-color: #33ccff;
        border-radius: 3px;
        z-index: 2;
    }
    .VJS_controls__progress-ranges {
        position: absolute;
        height: 6px;
        top: 0;
        left: 0;
        right: 0;
        z-index: 0;
        overflow: hidden;
    }
    .VJS_controls__progress-range {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        width: 0;
        border-radius: 3px;
        background-color: grey;
    }
    .VJS_controls__time {
        color: white;
        font-size: 14px;
        margin-right: 12px;
    }
    .VJS_controls__volume {
        width: 32px;
        height: 18px;
        position: relative;
    }
    .VJS_controls__volume-bar {
        width: 3px;
        position: absolute;
        bottom: 0;
        background-color: white;
        transition: height .25s ease;
    }
    .VJS_controls__volume-bar--active {
        background-color: #33ccff;
    }
    .VJS_controls__volume-bar:hover {
        cursor: pointer;
    }
    .VJS_controls__volume-bar:first-child  { left:0; height:5px; }
    .VJS_controls__volume-bar:nth-child(2) { left:5px; height:8px; }
    .VJS_controls__volume-bar:nth-child(3) { left:10px; height:12px; }
    .VJS_controls__volume-bar:nth-child(4) { left:15px; height:15px; }
    .VJS_controls__volume-bar:last-child   { left:20px; height:18px; }
    .VJS_controls__volume-bar:first-child:hover  { height:8px; }
    .VJS_controls__volume-bar:nth-child(2):hover { height:11px; }
    .VJS_controls__volume-bar:nth-child(3):hover { height:15px; }
    .VJS_controls__volume-bar:nth-child(4):hover { height:18px; }
    .VJS_controls__volume-bar:last-child:hover   { height:21px; }
    .VJS_controls__full-screen {
        width: 26px;
        height: 16px;
        position: relative;
        transition: transform .2s ease;
        margin-right: 12px;
    }
    .VJS_controls__full-screen:hover {
        transform: scale(1.05);
        cursor: pointer;
    }
    .VJS_controls__full-screen span {
        position: absolute;
        width: 10px;
        height: 5px;
        display: block;
    }
    .VJS_controls__full-screen span:first-child {
        top: 0;
        left: 0;
        border-left: 2px solid white;
        border-top: 2px solid white;
    }
    .VJS_controls__full-screen span:nth-child(2) {
        top: 0;
        right: 0;
        border-top: 2px solid white;
        border-right: 2px solid white;
    }
    .VJS_controls__full-screen span:nth-child(3) {
        bottom: 0;
        left: 0;
        border-left: 2px solid white;
        border-bottom: 2px solid white;
    }
    .VJS_controls__full-screen span:last-child {
        bottom: 0;
        right: 0;
        border-bottom: 2px solid white;
        border-right: 2px solid white;
    }
    @keyframes viewJsSpinner {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
</style>
