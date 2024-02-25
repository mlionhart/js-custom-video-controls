const media = document.querySelector('video');
const controls = document.querySelector('.controls');

const play = document.querySelector('.play');
const stop = document.querySelector('.stop');
const rwd = document.querySelector('.rwd');
const fwd = document.querySelector('.fwd');

// outer timer wrapper
const timerWrapper = document.querySelector('.timer');
// digital timer readout
const timer = document.querySelector('.timer span');
// gets wider as time elapses
const timerBar = document.querySelector('.timer div');

media.removeAttribute("controls"); // remove default controls
controls.style.visibility = 'visible'; // show custom controls

// invoke playPauseMedia() when play button is clicked
media.addEventListener('click', playPauseMedia);
play.addEventListener('click', playPauseMedia);
stop.addEventListener('click', stopMedia);
media.addEventListener('ended', stopMedia);
rwd.addEventListener('click', mediaBackward);
fwd.addEventListener('click', mediaForward);
// run a function every time the timeupdate event fires on the video element to update the timer
media.addEventListener('timeupdate', setTime);
// move through video by clicking or dragging timer bar
timerWrapper.addEventListener('mousedown', (event) => {
  // get distance from left edge of VP to left edge of timer div
  const divX = timerWrapper.getBoundingClientRect().x;
  // get width of timer div
  const divWidth = timerWrapper.getBoundingClientRect().width;
  const mouseX = event.clientX;
  // calc distance from mouse click to left edge of div
  const distance = mouseX - divX;
  // calc percentage mouse click is from left edge of div
  const percentage = (distance / divWidth) * 100;
  // set current time based on previous percentage
  media.currentTime = (media.duration * percentage) / 100;

  timerWrapper.addEventListener('mousemove', mouseMovehandler);

  document.addEventListener('mouseup', () => {
    timerWrapper.removeEventListener('mousemove', mouseMovehandler);
  });
});

// sole purpose of this function is to remove the event listener on line 37
function mouseMovehandler(event) {
  const divX = timerWrapper.getBoundingClientRect().x;
  const divWidth = timerWrapper.getBoundingClientRect().width;
  const mouseX = event.clientX;
  const distance = mouseX - divX;
  const percentage = (distance / divWidth) * 100;
  media.currentTime = (media.duration * percentage) / 100;
}

function playPauseMedia() {
  applyFix();

  if (media.paused) {
    play.setAttribute("data-icon", "u");
    setInterval(console.log(media.currentTime), 1000);
    media.play();
  } else {
    play.setAttribute('data-icon', 'P');
    media.pause();
  }
} // end playPauseMedia()

function stopMedia() {
  media.pause();
  // reset media to beginning (setting currentTime immediately jumps the media to that point)
  media.currentTime = 0;
  play.setAttribute("data-icon", "P");

  applyFix();
} // end stopMedia()

let intervalFwd;
let intervalRwd;

function mediaBackward() {
  // clear any classes or intervals set on the fwd button bc if we press the rwd button after pressing the fwd button, we want to cancel any fwd functionality and replace it with rwd functionality. If we tried to do both at once, it would break.
  clearInterval(intervalFwd);
  fwd.classList.remove("active");

  if (rwd.classList.contains("active")) {
    rwd.classList.remove("active");
    clearInterval(intervalRwd);
    // play() cancels rwd and start video playing again
    media.play();
  } else {
    rwd.classList.add("active");
    media.pause();
    intervalRwd = setInterval(windBackward, 200);
  }
} // end mediaBackward()

function mediaForward() {
  clearInterval(intervalRwd);
  rwd.classList.remove("active");

  if (fwd.classList.contains("active")) {
    fwd.classList.remove("active");
    clearInterval(intervalFwd);
    media.play();
  } else {
    fwd.classList.add("active");
    media.pause();
    intervalFwd = setInterval(windForward, 200);
  }
} // end mediaForward()

// bear in mind that when the interval is active, this function is called every 200ms
function windBackward() {
  // check if the video is less than 3 seconds in, i.e., if rewinding another 3 seconds would take it back past the start of the video. This would cause strange behavior, so if this is the case we stop the video playing by calling stopMedia(), remove the active class from the rwd button, and clear the intervalRwd interval to stop the rewind functionality. If we didn't do this last step, the video would just keep rewinding forever.
  if (media.currentTime <= 3) {
    // rwd.classList.remove("active");
    // clearInterval(intervalRwd);
    stopMedia();
  } else {
    // if the current time is not within 3 seconds of the start of the video, we remove 3 seconds from the current time by executing media.currentTime -= 3. So, in effect, we are rewinding the video by 3 seconds, once every 200ms.
    media.currentTime -= 3;
  }
}

function windForward() {
  // same functionality of windBackward()
  if (media.currentTime >= media.duration - 3) {
    // fwd.classList.remove("active");
    // clearInterval(intervalFwd);
    stopMedia();
  } else {
    media.currentTime += 3;
  }
}

function setTime() {
  const hours = Math.floor(media.currentTime / 6000);
  const minutes = Math.floor(media.currentTime / 60);
  const seconds = Math.floor(media.currentTime - minutes * 60);

  const hourValue = hours.toString().padStart(2, "0");
  const minuteValue = minutes.toString().padStart(2, "0");
  const secondValue = seconds.toString().padStart(2, "0");

  // actual time value (format: min:sec)
  const mediaTime = `${hourValue}:${minuteValue}:${secondValue}`;
  // the Node.textContent value of the timer is set to the time value, so it displays in the UI
  timer.textContent = mediaTime;

  // the length we should set the inner <div> to is worked out by first working out the width of the outer <div> (any element's clientWidth property will contain its length), and then multiplying it by the HTMLMediaElement.currentTime divided by the total HTMLMediaElement.duration of the media. We set the width of the inner <div> to equal the calculated bar length, plus "px", so it will be set to that number of pixels.
  const barLength =
    timerWrapper.clientWidth * (media.currentTime / media.duration);
  timerBar.style.width = `${barLength}px`;
}

function applyFix() {
  // fix to make play/pause and stop btns work while rwd and fwd are active
  rwd.classList.remove("active");
  fwd.classList.remove("active");
  clearInterval(intervalRwd);
  clearInterval(intervalFwd);
}