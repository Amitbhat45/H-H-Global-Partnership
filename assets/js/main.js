// Main JavaScript for H&H Global Partnerships
(function() {
    'use strict';

    // DOM Elements
    const header = document.getElementById('header');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const dropdownTrigger = document.querySelector('.dropdown-trigger');
    const navDropdown = document.querySelector('.nav-dropdown');
    const enquiryForm = document.getElementById('enquiry-form');
    const captchaLabel = document.getElementById('captcha-label');
    const toastContainer = document.getElementById('toast-container');

    // State
    let currentSlide = 0;
    let slideInterval;
    let captchaAnswer = 0;
    let isScrolling = false;

    // Initialize everything when DOM is ready
    document.addEventListener('DOMContentLoaded', init);

    function init() {
        setupHeader();
        setupMobileMenu();
        setupDropdown();
        setupCarousel();
        setupScrollReveal();
        setupSmoothScroll();
        setupStats();
        setupForm();
        setupKeyboardNavigation();
    }

    // Header shrink on scroll
    function setupHeader() {
        let lastScrollY = window.scrollY;
        
        function updateHeader() {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > 50) {
                header.classList.add('shrunk');
            } else {
                header.classList.remove('shrunk');
            }
            
            lastScrollY = currentScrollY;
        }
        
        window.addEventListener('scroll', throttle(updateHeader, 10));
    }

    // Mobile menu functionality
    function setupMobileMenu() {
        if (!mobileMenuToggle || !navLinks) return;

        mobileMenuToggle.addEventListener('click', () => {
            const isActive = navLinks.classList.contains('active');
            
            navLinks.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
            mobileMenuToggle.setAttribute('aria-expanded', !isActive);
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = isActive ? '' : 'hidden';
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.main-nav') && navLinks.classList.contains('active')) {
                closeMobileMenu();
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                closeMobileMenu();
            }
        });
    }

    function closeMobileMenu() {
        navLinks.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    // Dropdown menu functionality
    function setupDropdown() {
        if (!dropdownTrigger || !navDropdown) return;

        // Mobile accordion behavior
        if (window.innerWidth <= 768) {
            dropdownTrigger.addEventListener('click', (e) => {
                e.preventDefault();
                navDropdown.classList.toggle('open');
            });
        }

        // Handle window resize
        window.addEventListener('resize', debounce(() => {
            if (window.innerWidth > 768) {
                navDropdown.classList.remove('open');
            }
        }, 250));
    }

    // Carousel functionality
    function setupCarousel() {
        const slides = document.querySelectorAll('.carousel-slide');
        const indicators = document.querySelectorAll('.indicator');
        const prevBtn = document.querySelector('.carousel-btn.prev');
        const nextBtn = document.querySelector('.carousel-btn.next');
        const carousel = document.querySelector('.hero-carousel');

        if (!slides.length) return;

        function showSlide(index) {
            // Remove active class from all slides and indicators
            slides.forEach(slide => slide.classList.remove('active'));
            indicators.forEach(indicator => indicator.classList.remove('active'));

            // Add active class to current slide and indicator
            slides[index].classList.add('active');
            indicators[index].classList.add('active');

            currentSlide = index;
        }

        function nextSlide() {
            const nextIndex = (currentSlide + 1) % slides.length;
            showSlide(nextIndex);
        }

        function prevSlide() {
            const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(prevIndex);
        }

        function startAutoplay() {
            slideInterval = setInterval(nextSlide, 5000);
        }

        function stopAutoplay() {
            clearInterval(slideInterval);
        }

        // Button event listeners
        if (nextBtn) nextBtn.addEventListener('click', () => {
            nextSlide();
            stopAutoplay();
            startAutoplay();
        });

        if (prevBtn) prevBtn.addEventListener('click', () => {
            prevSlide();
            stopAutoplay();
            startAutoplay();
        });

        // Indicator event listeners
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                showSlide(index);
                stopAutoplay();
                startAutoplay();
            });
        });

        // Pause on hover
        if (carousel) {
            carousel.addEventListener('mouseenter', stopAutoplay);
            carousel.addEventListener('mouseleave', startAutoplay);
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.target.closest('.hero-carousel')) {
                if (e.key === 'ArrowLeft') {
                    prevSlide();
                    stopAutoplay();
                    startAutoplay();
                } else if (e.key === 'ArrowRight') {
                    nextSlide();
                    stopAutoplay();
                    startAutoplay();
                }
            }
        });

        // Start autoplay
        startAutoplay();
    }

    // Scroll reveal animation
    function setupScrollReveal() {
        const revealElements = document.querySelectorAll('.section-reveal');
        
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(element => {
            revealObserver.observe(element);
        });
    }

    // Smooth scroll for anchor links
    function setupSmoothScroll() {
        document.addEventListener('click', (e) => {
            const anchor = e.target.closest('a[href^="#"]');
            if (!anchor) return;

            e.preventDefault();
            const targetId = anchor.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // Close mobile menu if open
                if (navLinks.classList.contains('active')) {
                    closeMobileMenu();
                }

                const headerOffset = header.offsetHeight + 20;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    }

    // Animated statistics counter
    function setupStats() {
        const statNumbers = document.querySelectorAll('.stat-number');
        let hasAnimated = false;

        function animateStats() {
            if (hasAnimated) return;
            hasAnimated = true;

            statNumbers.forEach(stat => {
                const target = parseInt(stat.dataset.target);
                const duration = 2000;
                const increment = target / (duration / 16);
                let current = 0;

                function updateCount() {
                    current += increment;
                    if (current < target) {
                        stat.textContent = Math.floor(current);
                        requestAnimationFrame(updateCount);
                    } else {
                        stat.textContent = target;
                    }
                }

                updateCount();
            });
        }

        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateStats();
                    statsObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.5
        });

        const statsSection = document.querySelector('.stats-row');
        if (statsSection) {
            statsObserver.observe(statsSection);
        }
    }

    // Form handling and validation
    function setupForm() {
        if (!enquiryForm) return;

        generateCaptcha();
        setupFormValidation();
        setupFormSubmission();
    }

    function generateCaptcha() {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        captchaAnswer = num1 + num2;
        captchaLabel.textContent = `What is ${num1} + ${num2}?`;
    }

    function setupFormValidation() {
        const inputs = enquiryForm.querySelectorAll('input, textarea');
        const submitBtn = enquiryForm.querySelector('button[type="submit"]');

        function validateField(field) {
            const errorMsg = field.parentNode.querySelector('.error-message');
            let isValid = true;
            let message = '';

            // Check required fields
            if (field.hasAttribute('required') && !field.value.trim()) {
                isValid = false;
                message = 'This field is required';
            }

            // Email validation
            if (field.type === 'email' && field.value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(field.value)) {
                    isValid = false;
                    message = 'Please enter a valid email address';
                }
            }

            // Mobile validation
            if (field.name === 'mobile' && field.value) {
                const mobileRegex = /^[0-9]{10,15}$/;
                if (!mobileRegex.test(field.value.replace(/\s/g, ''))) {
                    isValid = false;
                    message = 'Please enter a valid mobile number (10-15 digits)';
                }
            }

            // Captcha validation
            if (field.name === 'captcha' && field.value) {
                if (parseInt(field.value) !== captchaAnswer) {
                    isValid = false;
                    message = 'Incorrect answer';
                }
            }

            // Minimum length validation
            if (field.hasAttribute('minlength') && field.value.length > 0) {
                const minLength = parseInt(field.getAttribute('minlength'));
                if (field.value.length < minLength) {
                    isValid = false;
                    message = `Minimum ${minLength} characters required`;
                }
            }

            // Update field appearance
            field.classList.toggle('invalid', !isValid);
            
            // Update error message
            if (errorMsg) {
                errorMsg.textContent = message;
            }

            return isValid;
        }

        function validateForm() {
            let formValid = true;
            inputs.forEach(input => {
                if (!validateField(input)) {
                    formValid = false;
                }
            });

            submitBtn.disabled = !formValid;
            return formValid;
        }

        // Real-time validation
        inputs.forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', debounce(validateForm, 300));
        });

        // Initial validation
        validateForm();
    }

    function setupFormSubmission() {
        enquiryForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = new FormData(enquiryForm);
            const data = Object.fromEntries(formData.entries());

            // Log form data (replace with actual API call)
            console.log('Form submitted:', data);

            // Show success message
            showToast('Enquiry submitted successfully! We will get back to you soon.', 'success');

            // Reset form
            enquiryForm.reset();
            generateCaptcha();
            
            // Re-enable submit button
            const submitBtn = enquiryForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;

            // Clear validation states
            const inputs = enquiryForm.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.classList.remove('invalid');
                const errorMsg = input.parentNode.querySelector('.error-message');
                if (errorMsg) errorMsg.textContent = '';
            });
        });
    }

    // Keyboard navigation support
    function setupKeyboardNavigation() {
        // Focus management for dropdown menu
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Close any open dropdowns
                document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
                    dropdown.classList.remove('open');
                });
                
                // Close mobile menu
                if (navLinks && navLinks.classList.contains('active')) {
                    closeMobileMenu();
                }
            }
        });

        // Improve focus visibility
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }

    // Toast notification system
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        toastContainer.appendChild(toast);

        // Remove toast after 5 seconds
        setTimeout(() => {
            toast.classList.add('removing');
            setTimeout(() => {
                if (toast.parentNode) {
                    toastContainer.removeChild(toast);
                }
            }, 300);
        }, 5000);
    }

    // Utility functions
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    function debounce(func, wait, immediate) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

    // Error handling
    window.addEventListener('error', (e) => {
        console.error('JavaScript error:', e.error);
        // Could show user-friendly error message in production
    });

    // Performance monitoring (optional)
    if ('PerformanceObserver' in window) {
        try {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'largest-contentful-paint') {
                        console.log('LCP:', entry.startTime);
                    }
                }
            });
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
            // Ignore if not supported
        }
    }

})();
