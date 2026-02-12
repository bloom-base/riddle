/**
 * Literature Citation Matching Game
 * A puzzle game where players match famous quotes to their authors
 */

// Game data with famous citations from American literature
const citationData = [
    {
        id: 1,
        quote: "The secret to getting ahead is getting started.",
        author: "Mark Twain",
        work: "Unknown"
    },
    {
        id: 2,
        quote: "It was the best of times, it was the worst of times.",
        author: "Charles Dickens",
        work: "A Tale of Two Cities"
    },
    {
        id: 3,
        quote: "So we beat on, boats against the current, borne back ceaselessly into the past.",
        author: "F. Scott Fitzgerald",
        work: "The Great Gatsby"
    },
    {
        id: 4,
        quote: "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.",
        author: "Jane Austen",
        work: "Pride and Prejudice"
    },
    {
        id: 5,
        quote: "Call me Ishmael.",
        author: "Herman Melville",
        work: "Moby Dick"
    }
];

class CitationMatchingGame {
    constructor() {
        this.selectedQuote = null;
        this.selectedAuthor = null;
        this.matchedPairs = new Set();
        this.score = 0;
        this.startTime = null;
        this.timerInterval = null;
        this.hintsRemaining = 2;

        this.setupEventListeners();
        this.initializeGame();
    }

    /**
     * Initialize the game board with citations
     */
    initializeGame() {
        this.selectedQuote = null;
        this.selectedAuthor = null;
        this.matchedPairs = new Set();
        this.score = 0;
        this.hintsRemaining = 2;
        this.startTime = Date.now();

        this.clearBoard();
        this.renderQuotes();
        this.renderAuthors();
        this.startTimer();
        this.updateStats();
    }

    /**
     * Clear the game board
     */
    clearBoard() {
        document.getElementById('quotes-container').innerHTML = '';
        document.getElementById('authors-container').innerHTML = '';
        document.getElementById('feedback-message').textContent = '';
        document.getElementById('feedback-message').className = 'feedback-hidden';
    }

    /**
     * Render quotes in the left column
     */
    renderQuotes() {
        const container = document.getElementById('quotes-container');
        citationData.forEach(citation => {
            const item = document.createElement('div');
            item.className = 'item';
            item.dataset.id = citation.id;
            item.dataset.type = 'quote';
            item.innerHTML = `<div class="item-text">"${citation.quote}"</div>`;

            item.addEventListener('click', () => this.selectQuote(citation.id, item));
            container.appendChild(item);
        });
    }

    /**
     * Render authors in the right column
     */
    renderAuthors() {
        const container = document.getElementById('authors-container');
        const shuffledCitations = this.shuffleArray([...citationData]);

        shuffledCitations.forEach(citation => {
            const item = document.createElement('div');
            item.className = 'item';
            item.dataset.id = citation.id;
            item.dataset.type = 'author';
            item.innerHTML = `<div class="item-text"><strong>${citation.author}</strong><br><em>${citation.work}</em></div>`;

            item.addEventListener('click', () => this.selectAuthor(citation.id, item));
            container.appendChild(item);
        });
    }

    /**
     * Handle quote selection
     */
    selectQuote(id, element) {
        if (this.matchedPairs.has(id)) return;

        // Clear previous selection
        document.querySelectorAll('[data-type="quote"]').forEach(el => {
            el.classList.remove('selected');
        });

        element.classList.add('selected');
        this.selectedQuote = id;

        // Try to match if both are selected
        if (this.selectedAuthor !== null) {
            this.checkMatch();
        }
    }

    /**
     * Handle author selection
     */
    selectAuthor(id, element) {
        if (this.matchedPairs.has(id)) return;

        // Clear previous selection
        document.querySelectorAll('[data-type="author"]').forEach(el => {
            el.classList.remove('selected');
        });

        element.classList.add('selected');
        this.selectedAuthor = id;

        // Try to match if both are selected
        if (this.selectedQuote !== null) {
            this.checkMatch();
        }
    }

    /**
     * Check if the selected quote and author match
     */
    checkMatch() {
        const quoteMatch = this.selectedQuote === this.selectedAuthor;

        if (quoteMatch) {
            this.score += 10;
            this.matchedPairs.add(this.selectedQuote);
            this.showFeedback('✓ Correct match!', 'success');

            // Mark both items as matched
            document.querySelectorAll(`[data-id="${this.selectedQuote}"]`).forEach(el => {
                el.classList.add('item-matched');
                el.classList.remove('selected');
            });

            this.selectedQuote = null;
            this.selectedAuthor = null;

            this.updateStats();

            // Check if game is complete
            if (this.matchedPairs.size === citationData.length) {
                this.completeGame();
            }
        } else {
            this.score = Math.max(0, this.score - 2);
            this.showFeedback('✗ Try again!', 'error');

            // Clear selections after a short delay
            setTimeout(() => {
                document.querySelectorAll('.item.selected').forEach(el => {
                    el.classList.remove('selected');
                });
                this.selectedQuote = null;
                this.selectedAuthor = null;
            }, 800);

            this.updateStats();
        }
    }

    /**
     * Show feedback message
     */
    showFeedback(message, type) {
        const feedback = document.getElementById('feedback-message');
        feedback.textContent = message;
        feedback.className = `feedback-${type}`;

        // Auto-hide after 1.5 seconds
        setTimeout(() => {
            feedback.className = 'feedback-hidden';
        }, 1500);
    }

    /**
     * Update game statistics display
     */
    updateStats() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('matches').textContent = `${this.matchedPairs.size}/${citationData.length}`;
    }

    /**
     * Start the timer
     */
    startTimer() {
        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            document.getElementById('timer').textContent = 
                `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }, 1000);
    }

    /**
     * Stop the timer
     */
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }

    /**
     * Complete the game
     */
    completeGame() {
        this.stopTimer();

        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-time').textContent = timeString;

        const modal = document.getElementById('completion-modal');
        modal.classList.add('show');
    }

    /**
     * Reset the game
     */
    resetGame() {
        this.stopTimer();
        const modal = document.getElementById('completion-modal');
        modal.classList.remove('show');
        this.initializeGame();
    }

    /**
     * Provide a hint
     */
    giveHint() {
        if (this.hintsRemaining <= 0) {
            this.showFeedback('No hints remaining!', 'error');
            return;
        }

        if (this.matchedPairs.size >= citationData.length) {
            this.showFeedback('Game already complete!', 'info');
            return;
        }

        // Find an unmatched pair
        for (let citation of citationData) {
            if (!this.matchedPairs.has(citation.id)) {
                this.showFeedback(
                    `Hint: "${citation.quote.substring(0, 20)}..." is by ${citation.author}`,
                    'info'
                );
                break;
            }
        }

        this.hintsRemaining--;
        const hintBtn = document.getElementById('hint-btn');
        hintBtn.textContent = `💡 Hints (${this.hintsRemaining})`;

        if (this.hintsRemaining <= 0) {
            hintBtn.disabled = true;
        }
    }

    /**
     * Shuffle an array using Fisher-Yates algorithm
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    /**
     * Setup event listeners for buttons
     */
    setupEventListeners() {
        document.getElementById('reset-btn').addEventListener('click', () => this.resetGame());
        document.getElementById('hint-btn').addEventListener('click', () => this.giveHint());
        document.getElementById('play-again-btn').addEventListener('click', () => this.resetGame());
    }
}

// Initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new CitationMatchingGame();
});
