// Handle scroll event for the homeContainer
const homeContainer = document.querySelector('.homeContainer');
const nav = document.querySelector('.homeNav');

homeContainer.addEventListener('scroll', function() {
    const scrollPosition = homeContainer.scrollTop;

    if (scrollPosition > 240) { // Adjust scroll threshold as needed
    nav.classList.add('scrolled');
    } else {
    nav.classList.remove('scrolled');
    }
});