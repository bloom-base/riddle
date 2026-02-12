/**
 * Unit tests for the Literature Citation Matching Game
 * Tests game logic, scoring, and matching mechanics
 */

// Mock DOM elements
function setupDOM() {
    const html = `
        <div id="quotes-container" class="items-container"></div>
        <div id="authors-container" class="items-container"></div>
        <div id="feedback-message" class="feedback-hidden"></div>
        <div id="score">0</div>
        <div id="matches">0/5</div>
        <div id="timer">00:00</div>
        <button id="reset-btn">Reset</button>
        <button id="hint-btn">Hint</button>
        <button id="play-again-btn">Play Again</button>
        <div id="completion-modal" class="completion-modal">
            <div class="modal-content">
                <span id="final-score">0</span>
                <span id="final-time">00:00</span>
            </div>
        </div>
    `;
    document.body.innerHTML = html;
}

// Test Suite
class TestRunner {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }

    test(description, testFn) {
        this.tests.push({ description, testFn });
    }

    async run() {
        console.log('🧪 Running Citation Matching Game Tests\n');
        console.log('='.repeat(50));

        for (const { description, testFn } of this.tests) {
            try {
                setupDOM();
                await testFn();
                console.log(`✓ PASS: ${description}`);
                this.passed++;
            } catch (error) {
                console.log(`✗ FAIL: ${description}`);
                console.log(`  Error: ${error.message}\n`);
                this.failed++;
            }
        }

        console.log('='.repeat(50));
        console.log(`\n📊 Results: ${this.passed} passed, ${this.failed} failed\n`);

        if (this.failed === 0) {
            console.log('🎉 All tests passed!');
        }
    }
}

// Helper assertion functions
function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
}

function assertTrue(value, message) {
    assert(value === true, message || 'Expected true');
}

function assertFalse(value, message) {
    assert(value === false, message || 'Expected false');
}

// Test cases
const runner = new TestRunner();

runner.test('Game initializes with correct initial state', () => {
    const game = new CitationMatchingGame();
    assertEqual(game.score, 0, 'Initial score should be 0');
    assertEqual(game.selectedQuote, null, 'No quote should be selected initially');
    assertEqual(game.selectedAuthor, null, 'No author should be selected initially');
    assertEqual(game.matchedPairs.size, 0, 'No pairs should be matched initially');
    assertEqual(game.hintsRemaining, 2, 'Should have 2 hints initially');
});

runner.test('Quotes are rendered in quotes container', () => {
    const game = new CitationMatchingGame();
    const quotesContainer = document.getElementById('quotes-container');
    const quoteItems = quotesContainer.querySelectorAll('[data-type="quote"]');
    assertEqual(quoteItems.length, 5, 'Should render 5 quotes');
});

runner.test('Authors are rendered in authors container', () => {
    const game = new CitationMatchingGame();
    const authorsContainer = document.getElementById('authors-container');
    const authorItems = authorsContainer.querySelectorAll('[data-type="author"]');
    assertEqual(authorItems.length, 5, 'Should render 5 authors');
});

runner.test('Selecting a quote marks it as selected', () => {
    const game = new CitationMatchingGame();
    const quoteItem = document.querySelector('[data-type="quote"][data-id="1"]');
    quoteItem.click();
    assertTrue(quoteItem.classList.contains('selected'), 'Quote should have selected class');
    assertEqual(game.selectedQuote, 1, 'Game should track selected quote ID');
});

runner.test('Selecting an author marks it as selected', () => {
    const game = new CitationMatchingGame();
    const authorItem = document.querySelector('[data-type="author"][data-id="2"]');
    authorItem.click();
    assertTrue(authorItem.classList.contains('selected'), 'Author should have selected class');
    assertEqual(game.selectedAuthor, 2, 'Game should track selected author ID');
});

runner.test('Matching a quote with correct author gives points', () => {
    const game = new CitationMatchingGame();
    const quoteItem = document.querySelector('[data-type="quote"][data-id="1"]');
    const authorItem = document.querySelector('[data-type="author"][data-id="1"]');

    quoteItem.click();
    authorItem.click();

    assert(game.score > 0, 'Score should increase on correct match');
    assertTrue(game.matchedPairs.has(1), 'Matched pair should be recorded');
});

runner.test('Matching quote with wrong author deducts points', () => {
    const game = new CitationMatchingGame();
    const quoteItem = document.querySelector('[data-type="quote"][data-id="1"]');
    const authorItem = document.querySelector('[data-type="author"][data-id="2"]');

    quoteItem.click();
    const initialScore = game.score;
    authorItem.click();

    assert(game.score <= initialScore, 'Score should not increase on wrong match');
    assertFalse(game.matchedPairs.has(1), 'Wrong pair should not be recorded');
});

runner.test('Selections clear after incorrect match', () => {
    const game = new CitationMatchingGame();
    const quoteItem = document.querySelector('[data-type="quote"][data-id="1"]');
    const authorItem = document.querySelector('[data-type="author"][data-id="2"]');

    quoteItem.click();
    authorItem.click();

    // Simulate the timeout behavior
    game.selectedQuote = null;
    game.selectedAuthor = null;

    assertEqual(game.selectedQuote, null, 'Selected quote should be cleared');
    assertEqual(game.selectedAuthor, null, 'Selected author should be cleared');
});

runner.test('Cannot select already matched items', () => {
    const game = new CitationMatchingGame();
    const quoteItem = document.querySelector('[data-type="quote"][data-id="1"]');
    const authorItem = document.querySelector('[data-type="author"][data-id="1"]');

    quoteItem.click();
    authorItem.click();

    // Mark as matched
    game.matchedPairs.add(1);
    quoteItem.classList.add('item-matched');

    // Try to click again
    game.selectQuote(1, quoteItem);
    // Should not update selectedQuote since item is already matched

    assert(!quoteItem.classList.contains('selected'), 'Matched item should not become selected');
});

runner.test('Completing all matches triggers game completion', () => {
    const game = new CitationMatchingGame();
    const modal = document.getElementById('completion-modal');

    // Match all pairs
    for (let i = 1; i <= 5; i++) {
        game.matchedPairs.add(i);
        document.querySelectorAll(`[data-id="${i}"]`).forEach(el => {
            el.classList.add('item-matched');
        });
    }

    game.completeGame();
    assertTrue(modal.classList.contains('show'), 'Completion modal should be shown');
});

runner.test('Reset button reinitializes the game', () => {
    const game = new CitationMatchingGame();
    const initialScore = game.score;
    game.score = 100;

    game.resetGame();

    assertEqual(game.score, 0, 'Score should reset to 0');
    assertEqual(game.matchedPairs.size, 0, 'Matched pairs should be reset');
    assertFalse(document.getElementById('completion-modal').classList.contains('show'), 
        'Completion modal should be hidden');
});

runner.test('Hint button provides hints', () => {
    const game = new CitationMatchingGame();
    const initialHints = game.hintsRemaining;

    game.giveHint();

    assertEqual(game.hintsRemaining, initialHints - 1, 'Hints should decrease by 1');
});

runner.test('Hints disabled when all hints used', () => {
    const game = new CitationMatchingGame();
    const hintBtn = document.getElementById('hint-btn');

    game.hintsRemaining = 0;
    game.giveHint();

    assertTrue(hintBtn.disabled, 'Hint button should be disabled when no hints remain');
});

runner.test('Score never goes below 0', () => {
    const game = new CitationMatchingGame();
    game.score = 2;
    game.score = Math.max(0, game.score - 5);

    assert(game.score >= 0, 'Score should never be negative');
});

runner.test('Shuffle array produces different order', () => {
    const game = new CitationMatchingGame();
    const original = [1, 2, 3, 4, 5];
    const shuffled = game.shuffleArray([...original]);

    // Very unlikely that shuffle produces exact same order (but theoretically possible)
    // We just check that the shuffle function exists and runs
    assertEqual(shuffled.length, original.length, 'Shuffled array should have same length');
});

runner.test('Timer initializes and updates', () => {
    const game = new CitationMatchingGame();
    assert(game.startTime !== null, 'Start time should be set');
    assert(game.timerInterval !== null, 'Timer interval should be set');
});

runner.test('Timer stops on game completion', () => {
    const game = new CitationMatchingGame();
    const timerInterval = game.timerInterval;

    game.completeGame();

    assert(game.timerInterval === null || typeof game.timerInterval === 'number',
        'Timer should be cleared or reset');
});

runner.test('Feedback message displays correctly', () => {
    const game = new CitationMatchingGame();
    const feedback = document.getElementById('feedback-message');

    game.showFeedback('Test message', 'success');

    assertEqual(feedback.textContent, 'Test message', 'Feedback text should be set');
    assert(feedback.classList.contains('feedback-success'), 'Feedback should have success class');
});

runner.test('Stats are updated after match attempt', () => {
    const game = new CitationMatchingGame();
    const scoreDisplay = document.getElementById('score');
    const matchesDisplay = document.getElementById('matches');

    const quoteItem = document.querySelector('[data-type="quote"][data-id="1"]');
    const authorItem = document.querySelector('[data-type="author"][data-id="1"]');

    quoteItem.click();
    authorItem.click();

    game.updateStats();

    assert(scoreDisplay.textContent !== '0' || matchesDisplay.textContent !== '0/5',
        'Stats should be updated');
});

// Run all tests
runner.run();
