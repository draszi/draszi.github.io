const root = document.documentElement
const toggle = document.querySelector('.theme-toggle')
const orbit = document.querySelector('.theme-orbit')
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
let explicitTheme = false
try {
  explicitTheme = ['light', 'dark'].includes(localStorage.getItem('theme'))
} catch { /* Theme controls still work when storage is unavailable. */ }

function applyTheme(theme) {
  root.dataset.theme = theme
  toggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`)
  toggle.title = toggle.getAttribute('aria-label')
}
applyTheme(root.dataset.theme || (systemTheme.matches ? 'dark' : 'light'))

toggle.addEventListener('click', () => {
  const theme = root.dataset.theme === 'dark' ? 'light' : 'dark'
  explicitTheme = true
  applyTheme(theme)
  try { localStorage.setItem('theme', theme) } catch { /* Keep the session choice. */ }
})
systemTheme.addEventListener('change', (event) => {
  if (!explicitTheme) applyTheme(event.matches ? 'dark' : 'light')
})

orbit.addEventListener('animationend', (event) => {
  if (event.animationName === 'arrive') orbit.classList.remove('is-arriving')
  if (event.animationName === 'wiggle') orbit.classList.remove('is-wiggling')
})
window.setInterval(() => {
  if (!reducedMotion.matches && !document.hidden && !orbit.classList.contains('is-arriving')) orbit.classList.add('is-wiggling')
}, 10000)
