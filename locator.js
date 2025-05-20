// If coming from another page with #locations or #about in URL, scroll to section after load
    document.addEventListener('DOMContentLoaded', function() {
        if (window.location.hash === "#locations") {
            const section = document.querySelector('section.locations');
            if (section) {
                setTimeout(() => {
                    section.scrollIntoView({ behavior: 'smooth' });
                }, 300);
            }
        }
        if (window.location.hash === "#about") {
            const section = document.querySelector('section.about');
            if (section) {
                setTimeout(() => {
                    section.scrollIntoView({ behavior: 'smooth' });
                }, 300);
            }
        }
    });

    // Intercept Locations and About header/footer links to go to home and scroll to section
    document.addEventListener('DOMContentLoaded', function() {
        // Header
        const locationsLink = document.querySelector('nav a[href="#locations"]');
        if (locationsLink) {
            locationsLink.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = "index.html#locations";
            });
        }
        const aboutLink = document.querySelector('nav a[href="#about"]');
        if (aboutLink) {
            aboutLink.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = "index.html#about";
            });
        }
        // Footer
        const footerLocationsLink = document.querySelector('footer a[href="#locations"]');
        if (footerLocationsLink) {
            footerLocationsLink.addEventListener('click', function(e) {
                e.preventDefault();
                window.open("https://maps.app.goo.gl/gsa89sw4dSF2Xkr69", "_blank", "noopener,noreferrer");
            });
        }
        const footerAboutLink = document.querySelector('footer a[href="#about"]');
        if (footerAboutLink) {
            footerAboutLink.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = "aboutus.html";
            });
        }

        // Open social links in new tab
        document.querySelectorAll('footer .social-links a').forEach(link => {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        });

        // Open all social links in any footer in a new tab
        document.querySelectorAll('footer .social-links a').forEach(link => {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        });
    });