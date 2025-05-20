// Handle flavor selection
        document.addEventListener('click', function (e) {
            if (e.target.closest('.flavor-option')) {
                const flavorOption = e.target.closest('.flavor-option');
                const flavorOptionsContainer = flavorOption.parentElement;

                // Update active state
                flavorOptionsContainer.querySelectorAll('.flavor-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                flavorOption.classList.add('active');
            }
        });

        // Initialize cart on page load
        document.addEventListener('DOMContentLoaded', () => {
            updateCart(); // Render cart from localStorage on page load
        });

// Smooth scroll for About, Locations, Home, and Menu links in header/footer
document.addEventListener('DOMContentLoaded', function() {
    const smoothLinks = [
        { selector: 'a[href="#about"]', section: 'section.about' },
        { selector: 'a[href="#locations"]', section: 'section.locations' },
        { selector: 'a[href="#home"]', section: null },
        { selector: 'a[href="#menu"]', section: 'section.menu' },

    ];
    smoothLinks.forEach(linkObj => {
        // Select all matching links (header and footer)
        document.querySelectorAll(linkObj.selector).forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                if (linkObj.section) {
                    const section = document.querySelector(linkObj.section);
                    if (section) {
                        section.scrollIntoView({ behavior: 'smooth' });
                    }
                } else {
                    // Scroll to top for Home
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        });
    });
});

// Hide header on scroll down, show on scroll up (apply to all pages with header except checkout.html)
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        const header = document.querySelector('header');
        if (!header) return;
        let lastScrollY = window.scrollY;
        let ticking = false;

        function handleHeaderScroll() {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY && currentScrollY > 60) {
                header.classList.add('hide-on-scroll');
            } else {
                header.classList.remove('hide-on-scroll');
            }
            lastScrollY = currentScrollY;
            ticking = false;
        }

        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(handleHeaderScroll);
                ticking = true;
            }
        });
    });
})();

        document.querySelectorAll('footer .social-links a').forEach(link => {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        });

        // Open all social links in any footer in a new tab
        document.querySelectorAll('footer .social-links a').forEach(link => {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        });

    