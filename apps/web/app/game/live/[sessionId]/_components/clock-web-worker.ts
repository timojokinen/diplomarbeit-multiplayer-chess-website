let count = 0;
let interval: ReturnType<typeof setInterval>;

self.onmessage = function (event: any) {
  switch (event.data.command) {
    case "start":
      clearInterval(interval); // Clear any existing interval
      count = event.data.timeRemaining;
      tick();
      interval = setInterval(tick, 500);
      break;
    case "stop":
      clearInterval(interval);
      break;
  }
};

function tick() {
  if (count <= 0) {
    clearInterval(interval);
    return;
  }
  count -= 500;
  if (count < 0) count = 0;
  postMessage(count);
}
