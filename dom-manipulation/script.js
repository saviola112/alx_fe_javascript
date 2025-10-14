// --- DATA ---
// Initial array of quote objects, now in the global scope
let quotes = [
    { text: "The only way to do great work is to love what you do.", category: "Motivation" },
    { text: "Innovation distinguishes between a leader and a follower.", category: "Technology" },
    { text: "Your time is limited, don't waste it living someone else's life.", category: "Life" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Inspiration" },
    { text: "Stay hungry, stay foolish.", category: "Motivation" },
    { text: "The purpose of our lives is to be happy.", category: "Life" }
];

// --- DOM ELEMENT REFERENCES ---
// These are now global so all functions can access them
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const newQuoteTextInput = document.getElementById('newQuoteText');
const newQuoteCategoryInput = document.getElementById('newQuoteCategory');
const categoryFilterContainer = document.getElementById('categoryFilter');
const feedbackMessage = document.getElementById('feedbackMessage');

let lastQuoteIndex = -1; // To avoid showing the same quote twice in a row
let currentCategory = 'all'; // Default filter

// --- FUNCTIONS ---

/**
 * Displays a random quote in the quoteDisplay element.
 * Filters by currentCategory if it's not 'all'.
 */
function showRandomQuote() {
    const filteredQuotes = currentCategory === 'all'
        ? quotes
        : quotes.filter(quote => quote.category.toLowerCase() === currentCategory.toLowerCase());

    if (filteredQuotes.length === 0) {
        quoteDisplay.innerHTML = `<p class="text-gray-600">No quotes available for this category.</p>`;
        return;
    }

    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    } while (filteredQuotes.length > 1 && randomIndex === lastQuoteIndex);
    
    lastQuoteIndex = randomIndex;
    const randomQuote = filteredQuotes[randomIndex];

    quoteDisplay.classList.add('fade-out');

    setTimeout(() => {
        const quoteTextElement = document.createElement('p');
        quoteTextElement.className = 'text-lg italic text-gray-800';
        quoteTextElement.textContent = `"${randomQuote.text}"`;

        const quoteCategoryElement = document.createElement('p');
        quoteCategoryElement.className = 'text-sm text-gray-500 mt-2 text-right';
        quoteCategoryElement.textContent = `- ${randomQuote.category}`;

        quoteDisplay.innerHTML = '';
        quoteDisplay.appendChild(quoteTextElement);
        quoteDisplay.appendChild(quoteCategoryElement);
        
        quoteDisplay.classList.remove('fade-out');
    }, 500);
}

/**
 * Handles the logic for adding a new quote from the form inputs.
 * This is now a global function to be used by onclick in the HTML.
 */
function addQuote() {
    const quoteText = newQuoteTextInput.value.trim();
    const quoteCategory = newQuoteCategoryInput.value.trim();

    if (quoteText === '' || quoteCategory === '') {
        showFeedback("Please fill out both fields.", "error");
        return;
    }

    const newQuote = { text: quoteText, category: quoteCategory };
    quotes.push(newQuote); // Adds to the array
    populateCategoryFilters(); // Updates the DOM

    newQuoteTextInput.value = '';
    newQuoteCategoryInput.value = '';
    showFeedback("Quote added successfully!", "success");
}

function populateCategoryFilters() {
    const categories = ['all', ...new Set(quotes.map(quote => quote.category))];
    categoryFilterContainer.innerHTML = '';

    categories.forEach(category => {
        const button = document.createElement('button');
        button.textContent = category;
        button.dataset.category = category;
        
        const baseClasses = 'py-1 px-3 rounded-full text-sm font-semibold transition duration-300';
        
        if (category.toLowerCase() === currentCategory.toLowerCase()){
             button.className = `${baseClasses} bg-blue-600 text-white`;
        } else {
             button.className = `${baseClasses} bg-gray-200 text-gray-700 hover:bg-gray-300`;
        }

        button.addEventListener('click', () => {
            currentCategory = category;
            document.querySelectorAll('#categoryFilter button').forEach(btn => {
                if(btn.dataset.category.toLowerCase() === currentCategory.toLowerCase()){
                    btn.className = `${baseClasses} bg-blue-600 text-white`;
                } else {
                    btn.className = `${baseClasses} bg-gray-200 text-gray-700 hover:bg-gray-300`;
                }
            });
            showRandomQuote();
        });
        categoryFilterContainer.appendChild(button);
    });
}

function showFeedback(message, type) {
    feedbackMessage.textContent = message;
    feedbackMessage.className = type === 'success' 
        ? 'text-center text-sm text-green-600 mt-2 h-4' 
        : 'text-center text-sm text-red-500 mt-2 h-4';
    
    setTimeout(() => {
        feedbackMessage.textContent = '';
    }, 3000);
}

// --- EVENT LISTENERS ---
// This listener handles the 'Show New Quote' button
newQuoteBtn.addEventListener('click', showRandomQuote);
// The 'Add Quote' button is now handled by onclick in the HTML file.

// --- INITIALIZATION ---
// These run once the script loads at the end of the body.
populateCategoryFilters();
showRandomQuote();
