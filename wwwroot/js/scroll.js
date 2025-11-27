window.scrollToResults = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
        // Scroll with some offset from top for better visibility
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - 20;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
};

window.isElementInViewport = (elementId) => {
    const element = document.getElementById(elementId);
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    
    // Consider element in viewport if it's visible (even partially) in the viewport
    return (
        rect.top < windowHeight &&
        rect.bottom > 0 &&
        rect.left >= 0 &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
};

window.getScrollPosition = () => {
    return window.pageYOffset || document.documentElement.scrollTop;
};

