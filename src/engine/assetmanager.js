class AssetManager {
    constructor() {
        this.successCount = 0;
        this.errorCount = 0;
        this.cache = [];
        this.downloadQueue = [];
    }

    queueDownload(path) {
        console.log("Queueing " + path);
        this.downloadQueue.push(path);
    }

    isDone() {
        return this.downloadQueue.length === this.successCount + this.errorCount;
    }

    downloadAll(callback) {
        if (this.downloadQueue.length === 0) setTimeout(callback, 10);
        for (let i = 0; i < this.downloadQueue.length; i++) {
            let that = this;

            const path = this.downloadQueue[i];
            console.log(path);
            let ext = path.substring(path.length - 3);

            switch (ext) {
                case "png":
                    let img = new Image();

                    img.addEventListener("load", () => {
                        console.log("Loaded image " + img.src);
                        that.successCount++;
                        if (that.isDone()) callback();
                    });
                    img.addEventListener("error", () => {
                        console.log("Error loading " + img.src);
                        that.errorCount++;
                        if (that.isDone()) callback();
                    });

                    img.src = path;
                    this.cache[path] = img;
                    break;

                case "mp3":
                    let aud = new Audio();

                    aud.addEventListener("loadeddata", () => {
                        console.log("Loaded audio " + aud.src);
                        that.successCount++;
                        if (that.isDone()) callback();
                    });
                    aud.addEventListener("error", () => {
                        console.log("Error loading " + aud.src);
                        that.errorCount++;
                        if (that.isDone()) callback();
                    });
                    aud.addEventListener("ended", () => {
                        aud.pause();
                        aud.currentTime = 0;
                    });

                    aud.src = path;
                    aud.load();
                    this.cache[path] = aud;
                    break;

                default:
                    console.log("Unknown file type: " + ext);
                    break;
            }
        }
    }

    getAsset(path) {
        return this.cache[path];
    }

    playAsset(path) {
        /** @type {HTMLAudioElement} */
        let aud = this.cache[path];
        aud.currentTime = 0;
        aud.play().catch(() =>
            console.log("Audio could not be played (probably due to browser not allowing autoplay)")
        );
    }

    muteAudio(mute) {
        for (let key in this.cache) {
            let asset = this.cache[key];
            if (asset instanceof Audio) {
                asset.muted = mute;
            }
        }
    }

    adjustVolume(volume) {
        for (let key in this.cache) {
            let asset = this.cache[key];
            if (asset instanceof Audio) {
                asset.volume = volume;
            }
        }
    }

    pauseBackgroundMusic() {
        for (let key in this.cache) {
            let asset = this.cache[key];
            if (asset instanceof Audio) {
                asset.pause();
                asset.currentTime = 0;
            }
        }
    }

    autoRepeat(path) {
        let aud = this.cache[path];
        aud.addEventListener("ended", () => {
            aud.play();
        });
    }
}
