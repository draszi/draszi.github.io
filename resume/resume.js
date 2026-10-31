import '../src/style.css'
import './resume.css'

document.querySelector('#print-resume').addEventListener('click', () => {
  document.querySelector('.save-menu').open = false
  window.print()
})
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') document.querySelector('.save-menu').open = false
})
document.addEventListener('click', event => {
  const menu = document.querySelector('.save-menu')
  if (!menu.contains(event.target)) menu.open = false
})
