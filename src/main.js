import './style.css'
import resumePDF from './assets/ArbiDaciResume.pdf'
import { initLogoOrb } from './logoOrb.js'

document.getElementById('resume-link').href = resumePDF
initLogoOrb()
