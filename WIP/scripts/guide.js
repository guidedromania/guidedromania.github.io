
// -------------------------------------------------- NAVIGATION

document.addEventListener("DOMContentLoaded", function() {
    const tabLinks = document.querySelectorAll('.tabs li');
    const tabs = document.querySelectorAll('.tabContent');

    tabLinks.forEach((tabLink) => {
        tabLink.addEventListener('click', function(e) {
            e.preventDefault();

            // Remove active class from all tabs and tab contents
            tabLinks.forEach(link => link.classList.remove('active'));
            tabs.forEach(tab => tab.classList.remove('active'));

            // Add active class to the clicked tab and the corresponding content
            const target = this.querySelector('a').getAttribute('href');
            this.classList.add('active');
            document.querySelector(target).classList.add('active');
        });
    });
});


// -------------------------------------------------- AUDIO PLAYER

// Retrieve DOM elements for the audio player, progress bar, and time display
const audio = document.getElementById('audio');
const chapterTitle = document.getElementById('chapterTitle');
const progressSlider = document.getElementById('progressSlider');
const currentTimeEl = document.getElementById('currentTimeEl');
const totalTimeEl = document.getElementById('totalTimeEl');

const chaptersList = document.getElementById('chaptersList');

// Retrieve DOM elements for playback controls
const prevChapterButton = document.getElementById('prevChapterButton');
const back10Button = document.getElementById('back10Button');
const playPauseButton = document.getElementById('playPauseButton');
const forward10Button = document.getElementById('forward10Button');
const nextChapterButton = document.getElementById('nextChapterButton');

// Access the <img> tag inside the play/pause button
const playPauseIcon = playPauseButton.querySelector('img');

// Paths to play and pause icons
const playIconSrc = 'assets/play_icon.svg';
const pauseIconSrc = 'assets/pause_icon.svg';

// Extract chapters data from HTML data attribute
const chapters = JSON.parse(chaptersList.dataset.chapters);

// Track the current chapter index
let currentChapter = 0;

// Get all chapter card elements
const chapterCards = document.querySelectorAll('.chaptersCard');

// Function to update chapter based on current audio time
function updateChapter(currentTime) {
    for (let i = 0; i < chapters.length; i++) {
        // Check if current time is within the range of a chapter
        if (currentTime >= chapters[i].start && (i === chapters.length - 1 || currentTime < chapters[i + 1].start)) {
            if (i !== currentChapter) {  // Only update if chapter changes
                currentChapter = i;
                chapterTitle.textContent = chapters[i].title;  // Update chapter title

                // Reset all chapter icons to inactive
                chapterCards.forEach((card) => {
                    const chapterIcon = card.querySelector('img');
                    chapterIcon.src = 'assets/chapter_inactive_icon.svg';  // Set to inactive icon
                });

                // Set the active icon for the current chapter
                const activeIcon = chapterCards[i].querySelector('img');
                activeIcon.src = 'assets/chapter_active_icon.svg';  // Set to active icon

                // Scroll the active chapter card into view
                chapterCards[i].scrollIntoView({ behavior: 'smooth', block: 'center' }); // Smooth scrolling
            }
            break;
        }
    }
}

// Function to format time as minutes:seconds
function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Function to load a chapter by index
function loadChapter(index) {
    // Reset all chapter icons to inactive
    chapterCards.forEach((card) => {
        const chapterIcon = card.querySelector('img');
        chapterIcon.src = 'assets/chapter_inactive_icon.svg';  // Set inactive icon
    });

    // Set active icon for the selected chapter
    const activeIcon = chapterCards[index].querySelector('img');
    activeIcon.src = 'assets/chapter_active_icon.svg';  // Set active icon

    // Set audio to start at the chapter's start time
    const chapter = chapters[index];
    audio.currentTime = chapter.start;
    chapterTitle.textContent = chapter.title;  // Update chapter title display
    currentChapter = index;  // Update current chapter index

    // Scroll the active chapter card into view
    chapterCards[index].scrollIntoView({ behavior: 'smooth', block: 'center' }); // Smooth scrolling
}

// Add click event listeners to each chapter card
chapterCards.forEach((card, index) => {
    card.addEventListener('click', () => {
        loadChapter(index);  // Load the corresponding chapter on click
    });
});

// Toggle play/pause functionality and move time back 1 second on pause
playPauseButton.addEventListener('click', () => {
    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
        // Move current time back by 1 second on pause, but ensure it doesn't go below 0
        audio.currentTime = Math.max(0, audio.currentTime - 1);
    }
});

// Update audio progress and chapter as the audio plays
audio.addEventListener('timeupdate', () => {
    const currentTime = audio.currentTime;
    const duration = audio.duration;

    // Calculate and update the progress percentage
    const progressPercent = (currentTime / duration) * 100;
    progressSlider.style.setProperty('--progress', `${progressPercent}%`);
    progressSlider.value = progressPercent;

    // Update current time and total duration display
    currentTimeEl.textContent = formatTime(currentTime);
    totalTimeEl.textContent = formatTime(duration);

    // Update the active chapter
    updateChapter(currentTime);
});

// Ensure the total time and current time are displayed as soon as metadata is loaded
audio.addEventListener('loadedmetadata', () => {
    // Set the initial current time and total duration
    const duration = audio.duration;
    currentTimeEl.textContent = formatTime(0); // Set current time to 0:00
    totalTimeEl.textContent = formatTime(duration); // Set the total time
});

// Load the first chapter by default when the page loads
window.addEventListener('load', () => {
    loadChapter(0); // Load the first chapter
});

// Handle progress bar interaction (seeking)
progressSlider.addEventListener('input', () => {
    const duration = audio.duration;
    const seekTime = (progressSlider.value / 100) * duration;
    audio.currentTime = seekTime;  // Seek to new time

    // Update chapter based on seek time
    updateChapter(seekTime);
});

// Next Chapter Button functionality
nextChapterButton.addEventListener('click', () => {
    if (currentChapter < chapters.length - 1) {
        currentChapter++;
        loadChapter(currentChapter);
    }
});


// Previous Chapter Button functionality
prevChapterButton.addEventListener('click', () => {
    const currentTime = audio.currentTime;
    const currentChapterStart = chapters[currentChapter].start;

    // Check if the current time is less than 5 seconds into the chapter
    if (currentTime < currentChapterStart + 5) {
        // Jump to the previous chapter if possible
        if (currentChapter > 0) {
            currentChapter--;
            loadChapter(currentChapter);
        }
    } else {
        // Otherwise, jump to the start of the current chapter
        audio.currentTime = currentChapterStart; // Set audio time to chapter start
    }
});


// Skip Forward/Backward 10 Seconds functionality
forward10Button.addEventListener('click', () => {
    audio.currentTime += 10;  // Skip forward 10 seconds
});

back10Button.addEventListener('click', () => {
    audio.currentTime -= 10;  // Skip backward 10 seconds
});

// Event listener for when audio playback ends
audio.addEventListener('ended', () => {
    playPauseIcon.src = playIconSrc;  // Revert to play icon when audio finishes
});

// Listen for when the audio starts playing
audio.addEventListener('playing', () => {
    playPauseIcon.src = pauseIconSrc;  // Update icon to pause when audio plays
});

// Listen for when the audio is paused (including external pause actions)
audio.addEventListener('pause', () => {
    playPauseIcon.src = playIconSrc;  // Update icon to play when audio pauses
});


// -------------------------------------------------- MAP

// Initialize Panzoom on the image
const elem = document.getElementById('mapContent');
const panzoom = Panzoom(elem, {
    maxScale: 8, // Maximum zoom level
    minScale: 1,  // Minimum zoom level (to prevent zoom out beyond this)
    contain: 'outside', // Allow panning outside the initial container bounds
    step: 1,
});

// Enable mousewheel zoom
elem.parentElement.addEventListener('wheel', panzoom.zoomWithWheel);

let lastTap = 0;
let isPinching = false; // Track if we are currently pinching

elem.addEventListener('touchstart', function (event) {
    // If there are two or more touches, set isPinching to true
    if (event.touches.length > 1) {
        isPinching = true; // We're in a pinch gesture
    }
});

elem.addEventListener('touchend', function (event) {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;

    // If we are pinching, prevent double-tap detection
    if (isPinching) {
        isPinching = false; // Reset the pinch state after the gesture ends
        return; // Exit to prevent double-tap logic from executing
    }

    // Detect double-tap (time between taps < 300ms)
    if (tapLength < 300 && tapLength > 0) {
        const touch = event.changedTouches[0];

        // Get the current scale and calculate the new zoom level
        const currentScale = panzoom.getScale();
        const newScale = currentScale * 2;

        // Perform zoom on double-tap, zooming in around the touch point
        panzoom.zoom(newScale, {
            focal: touch.touch,
            animate: true
        });
    }

    lastTap = currentTime; // Update lastTap time
});

// -------------------------------------------------- SCRIPT 

// Load DOCX ----------
 function loadDocx() {
    const docxContent = document.getElementById('docxContent');
    
    if (docxContent && docxContent.dataset.docx) {
        const docxFile = docxContent.dataset.docx;
        fetch(docxFile)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => {
                // Convert the DOCX to HTML using Mammoth
                mammoth.convertToHtml({ arrayBuffer: arrayBuffer })
                    .then(result => {
                        let html = result.value;
                        
                        // Add a <br> after each <p> tag to ensure a break after each paragraph
                        html = addLineBreakAfterParagraphs(html);
                        
                        // Set the processed HTML into the content element
                        docxContent.innerHTML = html;
                    })
                    .catch(err => console.error("Error during docx conversion:", err));
            })
            .catch(err => console.error("Error fetching docx file:", err));
    }
}

// Function to add a <br> after each <p> tag
function addLineBreakAfterParagraphs(html) {
    // Use a regular expression to match closing </p> tags and append a <br> after each
    return html.replace(/<\/p>/g, '</p><br>');
}

// Load the DOCX file when the page loads
window.onload = loadDocx;


// -------------------------------------------------- DOWNLOAD


document.addEventListener('DOMContentLoaded', function() {
    const download = document.getElementById('download');
    const downloadMenu = document.querySelector('.downloadMenu');
    const downloadButton = document.getElementById('downloadButton');
    const downloadMenuItems = document.querySelectorAll('.downloadMenuItem'); // Select all buttons in the menu

    // Show the download menu when the download button is clicked
    downloadButton.addEventListener('click', function(event) {
        event.stopPropagation(); // Prevent click from propagating to the document
        download.classList.remove('hidden'); // Show the download menu
    });

    // Hide the download menu when the user clicks outside the menu
    document.addEventListener('click', function(event) {
        if (!downloadMenu.contains(event.target) && event.target !== downloadButton) {
            download.classList.add('hidden'); // Hide the download menu
        }
    });

    // Prevent clicks inside the download menu from closing it
    downloadMenu.addEventListener('click', function(event) {
        event.stopPropagation(); // Stop clicks inside the menu from closing it
    });

    // Add event listeners to each menu item
    downloadMenuItems.forEach(function(item) {
        item.addEventListener('click', function() {
            const fileUrl = item.getAttribute('data-file'); // Get the file URL from the data attribute
            if (fileUrl) {
                // Create a temporary <a> element
                const link = document.createElement('a');
                link.href = fileUrl;
                link.download = ''; // Set the 'download' attribute to trigger download

                // Append the link to the document and click it programmatically
                document.body.appendChild(link);
                link.click();

                // Remove the link from the document after triggering the download
                document.body.removeChild(link);
            }

            // Hide the download menu after clicking an item
            download.classList.add('hidden');
        });
    });
});