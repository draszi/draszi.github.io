document.addEventListener('DOMContentLoaded', () => {
    // --- HEADER TEXT ENTRY ANIMATION ---
    // Add 'animate-in' class to trigger CSS slide-in and fade-in effects.
    const firstName = document.getElementById('first-name');
    const lastName = document.getElementById('last-name');
    const jobTitle = document.getElementById('job-title');

    // Stagger the animations for a more dynamic entry.
    if (firstName) setTimeout(() => firstName.classList.add('animate-in'), 200);
    if (lastName) setTimeout(() => lastName.classList.add('animate-in'), 400);
    if (jobTitle) setTimeout(() => jobTitle.classList.add('animate-in'), 600);

    // --- THEME MANAGEMENT ---
    const themeToggleButton = document.getElementById('theme-toggle');
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon'); // The <img> inside the button
    const socialLinksContainer = document.querySelector('.social-links'); // The div containing social SVGs

    // Function to apply the visual state of the theme
    const applyThemeVisuals = (theme) => {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            if (themeIcon) themeIcon.classList.add('invert'); // Invert the sun/moon icon
            if (socialLinksContainer) socialLinksContainer.classList.add('invert'); // Invert social icons
        } else {
            body.classList.remove('dark-mode');
            if (themeIcon) themeIcon.classList.remove('invert');
            if (socialLinksContainer) socialLinksContainer.classList.remove('invert');
        }
    };

    // Initialize theme on page load
    const initializeTheme = () => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            // User has a saved preference
            applyThemeVisuals(savedTheme);
        } else {
            // No saved theme, check system preference
            // Applies visuals but doesn't store it, allowing system changes to reflect live
            // until the user makes an explicit choice via the toggle.
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                applyThemeVisuals('dark');
            } else {
                applyThemeVisuals('light'); // Default to light
            }
        }
    };

    initializeTheme();

    // Event listener for the theme toggle button
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            const isCurrentlyDark = body.classList.contains('dark-mode');
            const newTheme = isCurrentlyDark ? 'light' : 'dark';
            
            applyThemeVisuals(newTheme);
            localStorage.setItem('theme', newTheme); // Save the user's explicit choice
        });
    }

    // Listen for changes in system theme preference
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            // If the user hasn't manually set a theme (i.e., no 'theme' in localStorage),
            // then allow the site's theme to adapt to system changes.
            if (!localStorage.getItem('theme')) {
                const newSystemTheme = e.matches ? 'dark' : 'light';
                applyThemeVisuals(newSystemTheme);
            }
        });
    }
});