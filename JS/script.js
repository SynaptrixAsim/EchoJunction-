let currentSong = new Audio;
let songs;
let currFolder;

//function for converting time in minute:second format
function formatSecondsToMinutes(seconds) {
    seconds = Number(seconds); // ensure it's a number
    if (isNaN(seconds) || seconds < 0) {
        return "00:00"
    }

    let mins = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);

    let formattedMins = mins < 10 ? '0' + mins : mins;
    let formattedSecs = secs < 10 ? '0' + secs : secs;

    return `${formattedMins}:${formattedSecs}`;
}


async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    // console.log(response);

    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")

    songs = []

    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    //get the song list

    let songUL = document.querySelector(".song-list").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""

    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML +
            `<li>
                        <div class="list-name">
                            <img src="image/svg-images/music-list-play.svg">
                            <div class="song-info">
                                <div>${song.replaceAll("%20", " ").slice(0, -4)}</div>
                            </div>
                        </div>
                        <div class="play-now">
                            <span>Play Now</span>
                            <img src="image/svg-images/play.svg">
                        </div>
                    </li>`
        console.log(song.replaceAll("%20", " "));
    }

    //attach the event lisner
    Array.from(document.querySelector(".song-list").getElementsByTagName("li")).forEach(e => {
        // e.addEventListener("click", element => {
        //     console.log(e.getElementsByTagName("div")[1].firstElementChild.innerHTML);
        //     playMusic(e.getElementsByTagName("div")[1].firstElementChild.innerHTML.trim());
        // })
        e.addEventListener("click", element => {
            let songName = e.querySelector(".song-info div").innerText.trim() + ".mp3";
            playMusic(songName);
            console.log(e.getElementsByTagName("div")[1].firstElementChild.innerHTML);
        });

    });

    return songs

}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;

    if (!pause) {
        currentSong.play();
        // ✅ Update the play button image
        document.querySelectorAll(".psd img").forEach(img => {
            img.src = "image/svg-images/paused.svg";
        });
    } else {
        // optional: show play icon if paused
        document.querySelectorAll(".psd img").forEach(img => {
            img.src = "image/svg-images/play.svg";
        });
    }
    document.querySelector(".playbar-info").innerHTML = decodeURI(track.replace(".mp3", ""));
    document.querySelector(".playbar-time").innerHTML = "00:00 / 00:00";
};

async function displayPlaylist() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    // console.log(response);

    let div = document.createElement("div")
    div.innerHTML = response;

    div.getElementsByTagName("a")

    let achros = div.getElementsByTagName("a")

    let myCard = document.querySelector(".card-container")
    let array = Array.from(achros)
    for (let i = 0; i < array.length; i++) {
        const e = array[i];
        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0];

            //get meta data of the folder
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();
            console.log(response);
            myCard.innerHTML = myCard.innerHTML + `<div class="wdth"><div data-folder="${folder}" class="card">
                                            <div>
                                                <div class="card-bg">
                                                    <img src="songs/${folder}/cover.jpg">
                                                </div>
                                                <button class="btn flex" id="play">
                                                    <img src="image/svg-images/play.svg" alt="Play" title="Play">
                                                </button>
                                                <div class="play-card detail">${response.title}</div>
                                                <div class="play-card singer">${response.description}</div>
                                            </div>
                                        </div></div>`
        }
    };

    //load the card when clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async (item) => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    });

}


async function main() {

    await getSongs("songs/Atif%20Aslam")

    playMusic(songs[0], true)


    //display all the playlists
    displayPlaylist()

    //attach an event lisner to play, next and previous
    document.querySelectorAll(".psd").forEach(play => {
        play.addEventListener("click", () => {
            if (currentSong.paused) {
                currentSong.play();
                play.querySelector("img").src = "image/svg-images/paused.svg";
            } else {
                currentSong.pause();
                play.querySelector("img").src = "image/svg-images/play.svg";
            }
        });
    });


    //time update event
    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".playbar-time").innerHTML = `${formatSecondsToMinutes(currentSong.currentTime)} / ${formatSecondsToMinutes(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    //add an event listener to the seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let parcent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = parcent + "%";
        currentSong.currentTime = ((currentSong.duration) * parcent) / 100
    })

    //add  event linstener on humberger
    document.querySelector(".humburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })

    //add event listner to profiles button
    document.querySelector(".profile").addEventListener("click", () => {
        document.querySelectorAll(".me").forEach(app => {
            if (app.style.display === "flex") {
                app.style.display = "none";
            }
            else {
                app.style.display = "flex";
            }
        });;
    })

    //add event listner to the Profile Icon
    // let hand = document.querySelector(".rt-hand")
    // document.querySelector(".profile").addEventListener("click", () => {
    //     if (hand.src.includes("right-hand-point.svg")) {
    //         console.log(hand);
    //         hand.src = "image/svg-images/down-hand-point.svg"
    //     }
    //     else {
    //         hand.src = "image/svg-images/right-hand-point.svg"
    //     }
    // })


    //add event linstener to close left
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    })

    //addd event listener to previous
    previous.addEventListener("click", () => {
        console.log("previous click");
        currentSong.pause()

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        console.log(songs, index);
        if ((index + 1) > 0) {
            playMusic(songs[index - 1])
        }
    })

    //addd event listener to next
    next.addEventListener("click", () => {
        console.log("next click");
        currentSong.pause()

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        console.log(songs, index);
        if ((index + 1) <= songs.length - 1) {
            playMusic(songs[index + 1])
        }

    })

    let volumeRange = document.querySelector(".range").getElementsByTagName("input")[0];
    let vol = document.querySelector(".vol-line");
    let lastVolume = 0.05; // store previous volume before mute

    // Set default volume
    currentSong.volume = lastVolume;
    volumeRange.value = lastVolume * 100;

    // Volume slider event
    volumeRange.addEventListener("input", (e) => {
        let newVolume = parseInt(e.target.value) / 100;
        currentSong.volume = newVolume;

        if (newVolume > 0) {
            lastVolume = newVolume; // update lastVolume when user changes volume
            vol.src = "image/svg-images/volume.svg"; // change icon if not muted
        } else {
            vol.src = "image/svg-images/mute.svg";
        }
    });

    // Mute/Unmute toggle
    document.querySelector(".vol-btn").addEventListener("click", () => {
        if (currentSong.volume > 0) {
            lastVolume = currentSong.volume;
            currentSong.volume = 0;
            volumeRange.value = 0;
            vol.src = "image/svg-images/mute.svg";
        } else {
            currentSong.volume = lastVolume;
            volumeRange.value = lastVolume * 100;
            vol.src = "image/svg-images/volume.svg";
        }
    });



}

main()