  // Find all accordion details
  const accordions = document.querySelectorAll('details.accordion');

  // Listen for the toggle event on each one
  accordions.forEach((el) => {
    el.addEventListener('toggle', (e) => {
      // Only act when an item is being opened
      if (el.open) {
        // Close all other items
        accordions.forEach((otherEl) => {
          if (otherEl !== el) {
            otherEl.open = false;
          }
        });
      }
    });
  });