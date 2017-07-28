<template>
    <div id="video-player-wrapper">
        <video id="video-player" ref="videoPlayer">
            <source :src="viewSource" :type="viewType" :preload="viewPreload" />
        </video>
        <div id="video-player-controls" ref="videoControls" class="controls fixed">
            <button class="controls__button" v-on:click="videoButton" v-bind:class="{play:!videoBeingPlayed,pause:videoBeingPlayed}">
            </button>
            <div class="controls__bar">
                <div ref="progressBar" class="controls__progress" v-on:click="skipToPosition($event)">
                    <div class="controls__progress-time">{{ timeElapsed }}</div>
                    <span class="controls__progress-back" v-bind:style="{ width: percentagePlayed }"></span>
                </div>
                <div class="controls__time">{{ timeRemaining }}</div>
                <div class="controls__volume">
                    <div class="controls__volume-bar" v-bind:class="{ active: volume >= 0.2 }" v-on:click="adjustVolume(1)"></div>
                    <div class="controls__volume-bar" v-bind:class="{ active: volume >= 0.4 }" v-on:click="adjustVolume(2)"></div>
                    <div class="controls__volume-bar" v-bind:class="{ active: volume >= 0.6 }" v-on:click="adjustVolume(3)"></div>
                    <div class="controls__volume-bar" v-bind:class="{ active: volume >= 0.8 }" v-on:click="adjustVolume(4)"></div>
                    <div class="controls__volume-bar" v-bind:class="{ active: volume === 1 }" v-on:click="adjustVolume(5)"></div>
                </div>
                <div class="controls__full-screen" v-on:click="enterFullScreen">
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

    // Public vars
    let vm = null;
    let videoPlayer = null;
    let videoControls = null;
    let progressBar = null;
    let progressLoop = null;

    const secondsToHumanReadable = (num) => {
        let hours = Math.floor(num / 3600);
        let minutes = Math.floor((num % 3600) / 60);
        let seconds = num % 60;

        // Add leading zero if needed
        hours = (hours < 10) ? '0' + hours : hours;
        minutes = (minutes < 10) ? '0' + minutes : minutes;
        seconds = (seconds < 10) ? '0' + seconds : seconds;

        if(hours > 0) {
            return hours + ':' + minutes + ':' + seconds;
        }

        return minutes + ':' + seconds;
    };

    const showHoverTime = () => {
        progressBar.onmousemove = function(e) {
            const percentage = e.offsetX / progressBar.offsetWidth;
            const num = Math.floor(percentage * videoPlayer.duration)
            vm.$data.timeElapsed = secondsToHumanReadable(num);
        };
    };

    const toggleFixedClass = () => {
        videoControls.classList.toggle('fixed');
    };

    const bufferedPercentage = () => {
        // something to show buffering
    };

    const onVideoEnded = () => {
        videoPlayer.addEventListener('ended', function() {
            vm.$data.videoBeingPlayed = false;
            vm.toggleFixedClass();
        });
    };

    const videoButton = () => {
        (vm.$data.videoBeingPlayed) ? vm.pauseVideo() : vm.playVideo();
    };

    const playVideo = () => {
        videoPlayer.play();
        videoPlayer.addEventListener('timeupdate', vm.timeUpdate);
        vm.$data.videoBeingPlayed = true;
        vm.toggleFixedClass();
    };

    const pauseVideo = () => {
        videoPlayer.pause();
        vm.$data.videoBeingPlayed = false;
    };

    const timeUpdate = () => {
        const duration = videoPlayer.duration;
        const currentTime = videoPlayer.currentTime;
        const percentage = Math.floor((100 / duration) * currentTime);
        const num = Math.round(duration - currentTime);
        vm.$data.percentagePlayed = percentage + '%';
        vm.$data.timeRemaining = secondsToHumanReadable(num);
    };

    const skipToPosition = (e) => {
        const percentage = e.offsetX / progressBar.offsetWidth;
        videoPlayer.currentTime = percentage * videoPlayer.duration;
    };

    const adjustVolume = (vol) => {
        // 5:1, 4:0.8, 3:0.6 , 2:0.4 , 1:0.2
        vm.$data.volume = vol / 5;
        videoPlayer.volume = vm.$data.volume;
    };

    const enterFullScreen = () => {
        videoPlayer.webkitRequestFullScreen();
    };

    const getPropsValidation = () => {
        return {
            viewSource: {
                type: String,
                required: true
            },
            viewType: {
                type: String,
                required: true
            },
            viewPreload: {
                type: String,
                required: false
            }
        };
    };

    /**
     * Define all exposed data
     * This is where we define all our default data
     */
    const publicData = {
        videoBeingPlayed: false,
        percentagePlayed: 0,
        volume: 0.6,
        timeRemaining: '00:00',
        timeElapsed: '00:00'
    };

    /**
     * Return all exposed methods
     * @return {Object} | all public methods
     */
    const getPublicMethods = () => {
        return {
            showHoverTime: showHoverTime,
            toggleFixedClass: toggleFixedClass,
            bufferedPercentage: bufferedPercentage,
            onVideoEnded: onVideoEnded,
            videoButton: videoButton,
            playVideo: playVideo,
            pauseVideo: pauseVideo,
            timeUpdate: timeUpdate,
            skipToPosition: skipToPosition,
            adjustVolume: adjustVolume,
            enterFullScreen: enterFullScreen
        }
    };

    const ViewJsComponent = {
        name: 'ViewJs',
        props: getPropsValidation(),
        methods: getPublicMethods(),
        data: function() {
            return publicData
        },
        mounted: function() {

            // Vars
            vm = this;
            videoPlayer = vm.$refs.videoPlayer;
            videoControls = vm.$refs.videoControls;
            progressBar = vm.$refs.progressBar;

            // Buffer video
            vm.bufferedPercentage();

            // Add ended event listener
            vm.onVideoEnded();

            // Add hover event for progress bar
            vm.showHoverTime();
        }
    };

    export default ViewJsComponent;
</script>

<style lang="sass" scoped>
    #video-player {
        display: block;
        width: 100%;
    }
    #video-player-wrapper {
        position: relative;
        display: block;
    }
    .controls {
        position: absolute;
        left: 12px;
        bottom: 12px;
        right: 12px;
        padding: 4px 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .controls__button {
        background-color: rgba(0,0,0,.7);
        border-radius: 8px;
        width: 80px;
        height: 40px;
        display: block;
        border: none;
        margin-right: 24px;
        text-align: center;
        position: relative;
    }
    .controls__button:hover {
        cursor: pointer;
    }
    .controls__button:focus {
        outline: none;
    }
    .controls__button:before,
    .controls__button:after {
        content: '';
        position: absolute;
    }
    .controls__button.play:before {
        left: 50%;
        top: 50%;
        margin: -10px 0 0 -6px;
        width: 0;
        height: 0;
        border-top: 10px solid transparent;
        border-bottom: 10px solid transparent;
        border-left: 18px solid white;
    }
    .controls__button.pause:before,
    .controls__button.pause:after {
        height: 22px;
        width: 6px;
        background-color: white;
        top: 9px;
    }
    .controls__button.pause:before {
        left: 32px;
    }
    .controls__button.pause:after {
        left: 42px;
    }
    .controls__bar {
        display: flex;
        flex-grow: 1;
        align-items: center;
        background-color: rgba(0,0,0,.7);
        border-radius: 8px;
        height: 34px;
    }
    .controls__progress {
       flex: 1;
       margin: 0 12px;
       width: 100%;
       height: 6px;
       border-radius: 3px;
       background-color: black;
       position: relative;
   }
   .controls__progress:hover {
       cursor: pointer;
   }
    .controls__progress-back {
        position: absolute;
        height: 6px;
        top: 0;
        left: 0;
        width: 0;
        background-color: #33ccff;
        border-radius: 3px;
    }
    .controls__progress-back:before {
        content: '';
        position: absolute;
        top: -5px;
        right: -5px;
        width: 12px;
        height: 12px;
        border-radius: 100%;
        background-color: #33ccff;
        border: 2px solid #25bbed;
    }
    .controls__time {
        font-family: arial, sans-serif;
        color: white;
        font-size: 14px;
        margin-right: 12px;
    }
    .controls__volume {
        width: 32px;
        height: 14px;
        position: relative;
    }
    .controls__volume-bar {
        width: 3px;
        position: absolute;
        bottom: 0;
        background-color: white;
        transition: height .25s ease;
    }
    .controls__volume-bar.active {
        background-color: #33ccff;
    }
    .controls__volume-bar:hover {
        cursor: pointer;
    }
    .controls__volume-bar:first-child  { left:0; height:5px; }
    .controls__volume-bar:nth-child(2) { left:5px; height:8px; }
    .controls__volume-bar:nth-child(3) { left:10px; height:12px; }
    .controls__volume-bar:nth-child(4) { left:15px; height:15px; }
    .controls__volume-bar:last-child   { left:20px; height:18px; }
    .controls__volume-bar:first-child:hover  { height:8px; }
    .controls__volume-bar:nth-child(2):hover { height:11px; }
    .controls__volume-bar:nth-child(3):hover { height:15px; }
    .controls__volume-bar:nth-child(4):hover { height:18px; }
    .controls__volume-bar:last-child:hover   { height:21px; }
    .controls__full-screen {
        width: 26px;
        height: 16px;
        position: relative;
        transition: transform .2s ease;
        margin-right: 12px;
    }
    .controls__full-screen:hover {
        transform: scale(1.05);
        cursor: pointer;
    }
    .controls__full-screen span {
        position: absolute;
        width: 10px;
        height: 5px;
        display: block;
    }
    .controls__full-screen span:first-child {
        top: 0;
        left: 0;
        border-left: 2px solid white;
        border-top: 2px solid white;
    }
    .controls__full-screen span:nth-child(2) {
        top: 0;
        right: 0;
        border-top: 2px solid white;
        border-right: 2px solid white;
    }
    .controls__full-screen span:nth-child(3) {
        bottom: 0;
        left: 0;
        border-left: 2px solid white;
        border-bottom: 2px solid white;
    }
    .controls__full-screen span:last-child {
        bottom: 0;
        right: 0;
        border-bottom: 2px solid white;
        border-right: 2px solid white;
    }
</style>
