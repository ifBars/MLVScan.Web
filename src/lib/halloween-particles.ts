/** Small vector sprites drawn locally into the existing background canvas. */
/** `flap` squashes bat wings vertically (1 = open) so bats read as flying rather than drifting. */
export function drawHalloweenParticle(ctx: CanvasRenderingContext2D, kind: number, flap = 1) {
  // All sprites use a 24 x 24 coordinate space centred on the particle.
  ctx.translate(-12, -12)
  if (kind === 0) {
    ctx.strokeStyle = '#6c9c74'
    ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(12, 6); ctx.quadraticCurveTo(11, 2, 15, 1); ctx.stroke()
    ctx.fillStyle = '#d9823d'
    ctx.beginPath(); ctx.ellipse(8, 14, 6, 8, -.12, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.ellipse(16, 14, 6, 8, .12, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#efa04d'
    ctx.beginPath(); ctx.ellipse(12, 14, 5, 8, 0, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#162127'
    ctx.beginPath(); ctx.moveTo(6, 12); ctx.lineTo(10, 9); ctx.lineTo(10, 13); ctx.closePath(); ctx.fill()
    ctx.beginPath(); ctx.moveTo(18, 12); ctx.lineTo(14, 9); ctx.lineTo(14, 13); ctx.closePath(); ctx.fill()
    ctx.beginPath(); ctx.moveTo(7, 16); ctx.lineTo(11, 17); ctx.lineTo(12, 15); ctx.lineTo(14, 17); ctx.lineTo(17, 16); ctx.lineTo(15, 20); ctx.lineTo(9, 20); ctx.closePath(); ctx.fill()
  } else if (kind === 1) {
    ctx.fillStyle = '#b9ced0'
    ctx.beginPath(); ctx.moveTo(5, 21); ctx.lineTo(5, 10); ctx.bezierCurveTo(5, 0, 19, 0, 19, 10)
    ctx.lineTo(19, 21); ctx.lineTo(15.5, 18); ctx.lineTo(12, 21); ctx.lineTo(8.5, 18); ctx.closePath(); ctx.fill()
    ctx.fillStyle = '#18282c'
    for (const x of [9, 15]) { ctx.beginPath(); ctx.ellipse(x, 11, 1.3, 2, 0, 0, Math.PI * 2); ctx.fill() }
  } else {
    ctx.translate(12, 12); ctx.scale(1, flap); ctx.translate(-12, -12)
    ctx.fillStyle = '#8d88ad'
    ctx.beginPath(); ctx.moveTo(12, 11); ctx.lineTo(10, 7); ctx.lineTo(9, 11)
    ctx.quadraticCurveTo(4, 10, 1, 5); ctx.quadraticCurveTo(0, 13, 4, 17)
    ctx.quadraticCurveTo(6, 13, 9, 17); ctx.lineTo(12, 20); ctx.lineTo(15, 17)
    ctx.quadraticCurveTo(18, 13, 20, 17); ctx.quadraticCurveTo(24, 13, 23, 5)
    ctx.quadraticCurveTo(20, 10, 15, 11); ctx.lineTo(14, 7); ctx.closePath(); ctx.fill()
  }
}
