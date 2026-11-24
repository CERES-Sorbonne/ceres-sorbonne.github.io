/** Rotation aléatoire du fond des pages article et outil (variable CSS --random-rotate). */
export function randomRotate(min = 20, max = 340) {
  const deg = Math.floor(Math.random() * (max - min + 1)) + min
  document.body.style.setProperty('--random-rotate', `${deg}deg`)
}
