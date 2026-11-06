// Guide · Part 4 · Real time.
// Sources (read-only): JanelKit/docs/lenguaje.md (Vídeo: <video> y Frames), docs/patrones.md
// (the whole page) and docs/arquitectura.md (Rendimiento: Vídeo), cross-checked against
// packages/janelkit/src/janelkit/video.py. The complete example and the "Ordinary Python"
// snippets are run against JanelKit 0.2 by scripts/validate_doc_examples.py.
export const realtimeDocs = [
  {
    slug: 'video',
    title: 'Video and frames',
    description: 'Show live images from a camera, a model or a simulation with <video> and Frames, draw over them, and know which pixel was clicked.',
    learn: [
      'Why frames travel through Frames and not through state.',
      'How to push images from any thread and show the latest one with <video>.',
      'How to place elements over the image and find the pixel the user clicked.',
      'How to know the frame rate and whether the source stopped.'
    ],
    sections: [
      {
        id: 'frames-not-state',
        title: 'Frames do not go through reactivity',
        body: 'A camera delivers 30 to 60 images per second. A state per image would recalculate the interface each time, so images take another road: a Frames object, which any thread can feed with push, and <video source={frames}>, which always shows the latest one. What is reactive is what you learn from the images: the detections, the counts, the measurements.\n\nAn image is a NumPy array or a QImage in the same process as the interface. Your model reads it there, without a server and without serializing anything, and its results go into state like any other data.',
        table: { headers: ['Path', 'Carries', 'How'], rows: [
          ['Frames → <video>', 'Every image, latest first', 'frames.push(image) from any thread; images that cannot be shown in time are skipped, never queued.'],
          ['Frames → your model', 'The latest image when the model is free', 'async for image in frames, with the model in background().'],
          ['state → template', 'Results: boxes, labels, counts', 'An ordinary assignment after the await.']
        ] }
      },
      {
        id: 'first-video',
        title: 'A first video, without a camera',
        body: 'This complete component draws a scene that changes color 30 times per second, so it runs on any computer. A timer stands in for the camera. Click on the image to mark a point; the mark is placed in image pixels, so it stays on the same spot of the image when the window is resized.',
        language: 'janel', standalone: true,
        code: `<script lang="python">
import itertools
from PySide6.QtGui import QColor, QImage
from janelkit import Frames, interval, state

frames = Frames(stall_after=1.0)
marks = state([])
hues = itertools.count(0, 4)

@interval(33)
def draw():                        # stands in for a camera
    image = QImage(320, 180, QImage.Format.Format_RGB32)
    image.fill(QColor.fromHsv(next(hues) % 360, 150, 230))
    frames.push(image)

def mark(event):
    if event.image_x is not None:  # None outside the image
        marks.value.append((event.image_x, event.image_y))

def pct(value, axis):              # image pixels to a percentage of the image
    size = frames.size or (1, 1)
    return f"{100 * value / size[axis]}%"
</script>

<column padding={16} gap={8}>
  <video source={frames} flex={1} on:click={mark} label="Scene">
    {#each marks as m}
      <flex class="mark" style={{"left": pct(m[0], 0), "top": pct(m[1], 1)}} />
    {/each}
  </video>
  <text>{frames.fps:.0f} fps · {len(marks)} mark(s){" · no signal" if frames.stalled else ""}</text>
  <row gap={8}>
    <button on:click={draw.stop()}>Stop the source</button>
    <button on:click={draw.start()}>Start it</button>
  </row>
</column>

<style>
.mark { position: absolute; width: 10px; height: 10px; border-radius: 5px; background: white; border: 2px solid black; }
</style>`,
        explanation: [
          'frames.push(image) hands each new image to Frames; <video> shows the latest one. The image never goes into a state.',
          'The children of <video> sit on a layer of the exact size of the visible image, so left: 50% is the middle of the image, not of the element.',
          'event.image_x and event.image_y are the clicked pixel of the image, whatever the fit; they are None outside the image.',
          'frames.fps and frames.stalled are reactive: the last line follows them. Stop the source, and after one second without push it says no signal.'
        ],
        expected: 'The image changes color continuously and the text shows about 30 fps. Each click on the image adds a white mark where you clicked. Stop the source freezes the image, and a second later the text says no signal; Start it brings the image back.',
        pitfalls: [
          'Do not put images in a state. Use Frames for images and state for what you learn from them.',
          'A real camera should push from its own thread, not from a timer on the interface thread; see the next sections.'
        ]
      },
      {
        id: 'push',
        title: 'What push accepts',
        body: 'frames.push(image) accepts a NumPy array, or any object with the buffer protocol, of bytes shaped height × width (gray), height × width × 3 (color="rgb" or "bgr") or × 4 ("rgba", "bgra"), and also a QImage. It copies the image, so the buffer can be reused, and converts it in the thread that calls it, not in the interface thread. Frames(color="bgr") is what OpenCV delivers; the default is "rgb".\n\nIf images arrive faster than the interface can show them, the extra ones are skipped: <video> and async for always receive the latest. async for image in frames, and await frames.next(), give you the very object you pushed. frames.latest() is the last image and frames.clear() empties the view.',
        language: 'python',
        code: `# In a component script; camera is an opened cv2.VideoCapture and model is yours.
import threading
from janelkit import Frames, background, on_mount, spawn, state

frames = Frames(color="bgr")       # OpenCV delivers BGR
faces = state([])

def capture():                     # its own thread: never touches state
    while True:
        ok, image = camera.read()
        if ok:
            frames.push(image)

async def detect():
    async for image in frames:     # the latest, each time the model is free
        faces.value = await background(model, image)

on_mount(lambda: (threading.Thread(target=capture, daemon=True).start(), spawn(detect())))`,
        explanation: [
          'The capture thread only pushes. Reading or writing state there raises WrongThreadError.',
          'detect runs on the interface thread, but the model runs in background(), so a model at 12 fps does not slow a preview at 30. NumPy, OpenCV and PyTorch release the GIL while they work.',
          'faces is assigned after the await, back on the interface thread, and the template shows the boxes.'
        ]
      },
      {
        id: 'overlay',
        title: 'Draw over the image, and find the clicked pixel',
        body: 'The children of <video> go in a box with position: relative of the exact size of the image you see, so percentages are percentages of the image, also with fit="contain" (bands around it) or fit="cover" (cropped). Detection boxes are ordinary elements, with styles and clicks. For a mirror, such as a front camera, flip the image before push so the coordinates still match.\n\n<video> receives on:click, on:dblclick, on:contextmenu and on:pointerdown, up, move, enter and leave. Its PointerEvent has, besides x and y on the element, image_x and image_y: the position in image pixels, as floats. They are None without a frame, in the bands of fit="contain" and for a click from the keyboard. In tests, app.find(label="Scene").click(x=100, y=50) clicks that point of the element.',
        pitfalls: [
          'A child with position: absolute, such as a detection box, does not let clicks through to the <video>, as in any box. Its on:pointerdown and the other pointer events still bubble up.',
          'Do not draw on the array you pushed: the preview, the model and a recording may all hold it. Copy it first, or better, draw with child elements.'
        ]
      },
      {
        id: 'source-health',
        title: 'Know the frame rate, and when the source stops',
        body: 'frames.size, (width, height) or None, and frames.fps are reactive. frames.stalled becomes True when more than stall_after seconds pass without a push (1.5 by default, Frames(stall_after=…)), and False again with the next image; at that moment fps also drops to 0. Before the first image and after clear() it is False: to know whether any image arrived, check frames.size is None.\n\nFrames only sees the pushes. A source that keeps pushing the same frozen image, such as a disconnected camera whose last frame is processed in each cycle, is not detected this way; the code that reads the camera has to know.',
        language: 'janel',
        code: `<!-- Partial template. -->
{#if frames.stalled}
  <text class="warning">No signal</text>
{/if}`
      },
      {
        id: 'cameras',
        title: 'Opening cameras is up to you',
        body: 'JanelKit shows images; it does not open cameras. Use OpenCV (cv2.VideoCapture) in a thread of your own, as above, or QtMultimedia, which is in PySide6-Addons: JanelKit installs only PySide6-Essentials, so install the Addons yourself (pip install PySide6-Addons) if you choose it. <video> does not decode video files and has no audio; to play a film, use a player.',
        see: ['real-time']
      }
    ],
    summary: [
      'Images go through Frames to <video>; results go through state to the template.',
      'push works from any thread, copies the image and keeps only the latest.',
      'Children of <video> are placed in image percentages; image_x and image_y give the clicked pixel.',
      'fps, size and stalled are reactive; stalled only sees pushes.'
    ]
  },
  {
    slug: 'real-time',
    title: 'Real-time applications',
    description: 'What latency to expect from video, and the patterns that keep a live application correct and responsive: the processing cycle, state after an await, and views that are not seen.',
    learn: [
      'What latency <video> gives, and the cases it is not built for.',
      'How to structure a processing cycle so heavy work never touches state.',
      'Why state can look half-updated after an await, and how to avoid it.',
      'How to stop work that nobody sees, and how to measure a cycle.'
    ],
    sections: [
      {
        id: 'latency',
        title: 'What latency to expect',
        body: 'From push until the image is drawn takes one refresh of the monitor plus a few milliseconds. From 640 × 480 to 1080p that is 13 to 17 ms at the median and 21 to 32 ms at the 95th percentile, measured with a real window on a 2013 laptop with a 60 Hz screen, on Windows with Direct3D 11; Linux and macOS have not been measured. Almost all of it is waiting for the next refresh: up to 16.7 ms at 60 Hz. What your camera and your code take comes on top.\n\nThat is enough to watch cameras or processed video live, from 15 to 60 fps and up to 1080p, with boxes, labels and clicks over it: inspection, monitoring, labeling, calibration, machine dashboards. Several views at once work too, because each push costs on the thread that calls it, not on the interface thread.',
        table: { headers: ['Not built for', 'Why', 'What to do'], rows: [
          ['Less than one refresh between image and screen (VR or AR headsets, following a hand with no delay)', 'Drawing waits for the monitor refresh and goes through the system compositor', 'A graphics engine that presents directly, outside JanelKit'],
          ['A control loop that decides from what is on screen, or hard deadlines (every 5 ms without fail)', 'Python, its garbage collector and the interface handlers can delay the interface thread, and the operating system gives no timing guarantees', 'The control in its own thread or process, reading the camera directly; the interface only shows and configures'],
          ['Knowing the exact refresh in which each frame appears, or syncing the screen with something else', 'Frames does not report when each image is presented, and one may take a refresh longer than another', 'Synchronize in hardware (the camera trigger), or measure the whole system’s latency and compensate'],
          ['Showing every frame without losing any', 'Frames keeps the latest on purpose: if images arrive faster than they are drawn, they are skipped', 'A queue of your own in the camera thread to record or analyze every frame; Frames only for the view'],
          ['Playing video with synchronized audio', '<video> shows loose images: it does not decode, and has no audio or timestamps', 'A player: QtMultimedia (in PySide6-Addons) or an external one'],
          ['4K at 60 fps, or many 1080p views', 'The cost grows with the pixels: at 1080p, push to delivery is already about 5 ms (11 ms at p95) on that laptop', 'Shrink the image to the size it is shown at before push (cv2.resize)']
        ] },
        pitfalls: [
          'Push from the camera thread or inside background(), not from a timer on the interface thread: there, the copy and conversion of each image cost the interface.',
          'Keep handlers and effects short: while the interface thread is busy, the next image waits to be delivered.'
        ]
      },
      {
        id: 'cycle',
        title: 'The cycle: runner, Options and Snapshot',
        body: 'Heavy work, such as reading the cameras and running the model, goes to a thread with background(). That code never touches state: it receives everything it needs in an object built before the await (Options), and returns an immutable result (Snapshot) that the tick applies when it comes back. The runner does not import janelkit, so it is tested without a window.',
        language: 'python',
        code: `# core/runner.py: does not import janelkit, so it is tested without a window.
from typing import NamedTuple

class Options(NamedTuple):
    threshold: float
    cameras: tuple[int, ...]

class Snapshot(NamedTuple):
    frames: dict
    detections: tuple

def cycle(images, options: Options) -> Snapshot: ...

# pages/Live.janel, in the script:
@interval(15)
async def tick():
    options = runner.Options(threshold.value, tuple(cameras.value))     # read state here
    snapshot = await background(runner.cycle, hub.read_all(), options)  # the model, in a thread
    for index, image in snapshot.frames.items():
        previews[index].push(image)
    detections.value = snapshot.detections                               # one assignment`,
        explanation: [
          'The state is read on the interface thread, before the await, and frozen into Options.',
          'cycle runs in a worker. Reading or assigning state there raises WrongThreadError, with the right way in the message.',
          'An async interval skips ticks while the previous run has not finished: a 50 ms cycle with interval(15) runs about 17 times per second, without piling up.'
        ],
        expected: 'The window keeps responding while the model works. tick.skipped grows if the cycle does not fit in its period, and tick.last_duration tells you how long the last one took.'
      },
      {
        id: 'after-await',
        title: 'State after an await is not grouped',
        body: 'Inside a handler or a tick, everything you change goes in one batch: effects and the interface update once, at the end. After an await, that is no longer true: each assignment notifies on its own. An effect that reads count and label runs after the first assignment, sees the new count with the old label, and runs again after the second. Group the assignments with batch(), or assign a single value, such as a NamedTuple with everything.\n\nAssigning the whole state in every cycle costs nothing when it did not change: assigning a value equal to the current one notifies nobody (they are compared with ==).',
        language: 'python',
        code: `# Ordinary Python: what notifies, and when.
from typing import NamedTuple
from janelkit import batch, effect, state

class Status(NamedTuple):
    count: int
    label: str

items = state([1, 2])
status = state(Status(0, "idle"))
seen = []
effect(lambda: seen.append((len(items.value), status.value.label)))

items.value.append(3)                                  # a reactive list notifies
status.value = status.value._replace(label="busy")     # a tuple is replaced, not changed
status.value = Status(0, "busy")                       # equal to the current value: no one is notified
with batch():                                          # two writes, one notification
    items.value.append(4)
    status.value = Status(1, "done")
assert seen == [(2, "idle"), (3, "idle"), (3, "busy"), (4, "done")]

original = [1]
copy = state(original)                                 # state copies lists, dicts and sets
original.append(2)
assert copy.value == [1]`,
        explanation: [
          'Lists, dictionaries and sets inside a state become reactive collections: changing them in place notifies.',
          'Tuples, NamedTuples and frozen dataclasses cannot change in place; assign a new one.',
          'Your own objects and NumPy arrays do not notify when changed in place: call s.notify(), or assign a new value. A NumPy array always counts as a change, because its == does not return a bool.'
        ],
        pitfalls: [
          'Do not change the list you passed to state() and expect an update: state keeps a reactive copy. Change the one in s.value.'
        ]
      },
      {
        id: 'hidden-views',
        title: 'Views that are not seen keep working',
        body: 'A view that is kept but not shown, such as an inactive section of janelkit-router, a covered page or a {#hidden} block, stops updating its template, but its script keeps running, timers included. To avoid work nobody sees, make the timer depend on whether the component is seen. when= accepts any reactive condition: when=hub.ready, or when=lambda: visible.value and hub.ready.value. An effect can read visible too, for example to release a camera while the view is hidden.',
        language: 'python',
        code: `from janelkit import interval, is_visible

visible = is_visible()

@interval(15, when=visible)          # does not count while the component is not seen
async def tick():
    ...`,
        see: ['timers']
      },
      {
        id: 'heavy-libraries',
        title: 'Import heavy native libraries at startup',
        body: 'PyTorch, ultralytics, MediaPipe or TensorFlow load large native libraries when imported. Import them on the main thread and early, in main.py before run(); in background(), only create the models. A first import inside background(), while OpenCV reads cameras in other threads, has been seen to crash the process with a memory access violation on Windows.',
        language: 'python',
        code: `# main.py
import torch                    # noqa: F401 (loaded here, on the main thread)
from ultralytics import YOLO    # noqa: F401
from janelkit import run`
      },
      {
        id: 'measure',
        title: 'Measure a cycle',
        body: 'The timer already measures itself: tick.last_duration is the duration in seconds of the last complete run, async part included; tick.runs counts the runs and tick.skipped the ticks skipped because the previous run was still going. If skipped grows, the cycle does not fit in its period.\n\nTo measure by hand on Windows, use time.perf_counter(): time.monotonic() advances in steps of 15.6 ms there, too coarse for a 15 ms cycle. JanelKit’s timer uses a precise Qt timer below one second; with an idle window, interval(15) ticks about 67 times per second and interval(5) about 200.',
        table: { headers: ['Requested period', '1 ms', '5 ms', '10 ms', '15 ms', '33 ms', '100 ms'], rows: [
          ['Ticks per second', '971', '200', '100', '67', '30', '10']
        ] }
      }
    ],
    summary: [
      'Video latency is one monitor refresh plus a few milliseconds; it is not for hard deadlines or sub-refresh needs.',
      'Heavy work runs in background() with Options in and a Snapshot out; it never touches state.',
      'After an await, group assignments with batch() or assign one value.',
      'Pause hidden work with when=is_visible(), and measure with last_duration, runs and skipped.'
    ]
  }
];
