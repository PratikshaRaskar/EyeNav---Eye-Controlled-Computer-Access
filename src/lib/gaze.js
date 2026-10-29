// Gaze features from MediaPipe FaceLandmarker (478 landmarks incl. iris).
// [iris-x ratio, iris-y ratio, nose-x, nose-y] — nose terms let the regression absorb head movement.
export function gazeFeatures(L) {
  const lx = (L[468].x - L[33].x) / (L[133].x - L[33].x)
  const rx = (L[473].x - L[362].x) / (L[263].x - L[362].x)
  const ly = (L[468].y - L[159].y) / (L[145].y - L[159].y)
  const ry = (L[473].y - L[386].y) / (L[374].y - L[386].y)
  return [(lx + rx) / 2, (ly + ry) / 2, L[1].x, L[1].y]
}

function solve(A, b) {
  const n = b.length
  const M = A.map((r, i) => [...r, b[i]])
  for (let i = 0; i < n; i++) {
    let p = i
    for (let r = i + 1; r < n; r++) if (Math.abs(M[r][i]) > Math.abs(M[p][i])) p = r
    ;[M[i], M[p]] = [M[p], M[i]]
    for (let r = i + 1; r < n; r++) {
      const f = M[r][i] / M[i][i]
      for (let c = i; c <= n; c++) M[r][c] -= f * M[i][c]
    }
  }
  const x = Array(n).fill(0)
  for (let i = n - 1; i >= 0; i--) {
    let s = M[i][n]
    for (let c = i + 1; c < n; c++) s -= M[i][c] * x[c]
    x[i] = s / M[i][i]
  }
  return x
}

export const predictGaze = (m, f) => ({
  x: m.wx[0] + f.reduce((a, v, i) => a + v * m.wx[i + 1], 0),
  y: m.wy[0] + f.reduce((a, v, i) => a + v * m.wy[i + 1], 0),
})

// Ridge-regularised least squares: features -> normalised screen position (0..1).
export function fitGaze(samples) {
  const X = samples.map((s) => [1, ...s.f])
  const k = X[0].length
  const ata = Array.from({ length: k }, (_, i) =>
    Array.from({ length: k }, (_, j) => X.reduce((a, r) => a + r[i] * r[j], 0) + (i === j && i > 0 ? 1e-3 : 0)))
  const axis = (key) => solve(ata, Array.from({ length: k }, (_, i) => X.reduce((a, r, n) => a + r[i] * samples[n][key], 0)))
  const wx = axis('x'), wy = axis('y')
  const m = { wx, wy }
  if (![...wx, ...wy].every(Number.isFinite)) throw new Error('Calibration failed: unstable fit')
  m.err = samples.reduce((a, s) => { const p = predictGaze(m, s.f); return a + Math.hypot(p.x - s.x, p.y - s.y) }, 0) / samples.length
  return m
}
