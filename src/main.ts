const FOREGROUND: string = "#61e552ff"
const BACKGROUND: string = "#101010"
const WIDTH: number = 800
const HEIGHT: number = 800

interface Vertex {
  x: number,
  y: number,
  z?: number
}

const game: HTMLCanvasElement | null = (document.getElementById("game") as HTMLCanvasElement)
game.width = WIDTH
game.height = HEIGHT

const ctx = game?.getContext("2d")

function clear() {
  if (!ctx || !game) {
    return
  }

  ctx.fillStyle = BACKGROUND
  ctx.fillRect(0, 0, WIDTH, HEIGHT)
}

/**
 * Draws a point onto the screen
 * @param p Point in screen coordinates
 */
function drawPoint(p: Vertex) {
  if (!ctx) {
    return
  }

  const size: number = 10;

  ctx.fillStyle = FOREGROUND
  ctx.fillRect(p.x - size/2, p.y - size/2, size, size)
}

function drawLine(p1: Vertex, p2: Vertex) {
  if (!ctx) {
    return
  }

  ctx.strokeStyle = FOREGROUND
  ctx.beginPath()
  ctx.moveTo(p1.x, p1.y)
  ctx.lineTo(p2.x, p2.y)
  ctx.stroke()
}

/**
 * Projects point in NDC (-1..1) to screen space (0..W or 0..H)
 * @param p Point in NDC
 * @returns Point in screen coordinates 
 */
function toScreen(p: Vertex) : Vertex {
  return {
    x: (p.x + 1) / 2 * WIDTH,
    y: (1 - (p.y + 1) / 2) * HEIGHT
  }
}

/**
 * Projects a point in world space coordinate onto the NDC. 
 * @param p Point in world space
 * @returns Point in NDC
 */
function toNDC(p: Vertex) : Vertex {
  if (!p.z) {
    return { x: 0, y: 0 }
  }

  return {
    x: p.x / p.z,
    y: p.y / p.z
  }
}

function translateZ(p: Vertex, dz: number): Vertex {
  return { x: p.x, y: p.y, z: p.z ? p.z + dz : undefined }
}

function rotateXZ(p: Vertex, angle: number): Vertex {
  if (!p.z) {
    return p
  }

  const c: number = Math.cos(angle)
  const s: number = Math.sin(angle)
  
  return {
    x: p.x * c - p.z * s,
    y: p.y,
    z: p.x * s + p.z * c,
  }
}

const FPS: number = 60
let dz: number = 2
let angle: number = 0

const vs: Vertex[] = [
  {x: 0.5, y: 0.5, z: 0.5},
  {x: -0.5, y: 0.5, z: 0.5},
  {x: -0.5, y: -0.5, z: 0.5},
  {x: 0.5, y: -0.5, z: 0.5},

  {x: 0.5, y: 0.5, z: -0.5},
  {x: -0.5, y: 0.5, z: -0.5},
  {x: -0.5, y: -0.5, z: -0.5},
  {x: 0.5, y: -0.5, z: -0.5},

  {x: 0.25, y: 0.75, z: 0.5},
  {x: -0.25, y: 0.75, z: 0.5},
  {x: -0.25, y: 0.5, z: 0.5},
  {x: 0.25, y: 0.5, z: 0.5},

  {x: 0.25, y: 0.75, z: 0.25},
  {x: -0.25, y: 0.75, z: 0.25},
  {x: -0.25, y: 0.5, z: 0.25},
  {x: 0.25, y: 0.5, z: 0.25},
]

const fs: number[][] = [
  [0,1,2,3],
  [4,5,6,7],
  [0,4],
  [1,5],
  [2,6],
  [3,7],

  [8,9,10,11],
  [12,13,14,15],
  [8,12],
  [9,13],
  [10,14],
  [11,15],
]

function frame() {
  clear()
  
  const delta: number = 1/FPS
  angle += 2*Math.PI*delta * 0.5
  // dz += 1*delta

  // Draw point
  // for (const vert of vs) {
  //   drawPoint(
  //     toScreen(
  //       toNDC(translateZ(rotateXZ(vert, angle), dz))
  //     )
  //   )
  // }

  // Draw line
  for (const f of fs) {
    for (let i: number = 0; i < f.length; ++i) {
      const a = vs[f[i]]
      const b = vs[f[(i+1) % f.length]]
      drawLine(
        toScreen(
          toNDC(translateZ(rotateXZ(a, angle), dz))
        ),
        toScreen(
          toNDC(translateZ(rotateXZ(b, angle), dz))
        )
      )
    }
  }
  
  setTimeout(frame, 1000/FPS)
}
setTimeout(frame, 1000/FPS)
