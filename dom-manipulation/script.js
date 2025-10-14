// --- DATA ---
let quotes = [
    { text: "The only way to do great work is to love what you do.", category: "Motivation" },
    { text: "Your time is limited, don't waste it living someone else's life.", category: "Life" },
    { text: "Strive not to be a success, but rather to be of value.", category: "Wisdom" },
];

// --- DOM ELEMENT REFERENCES ---
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const exportButton = document.getElementById('exportQuotesBtn');
const importFileInput = document.getElementById('importFile');
const categoryFilter = document.getElementById('categoryFilter');

// --- STORAGE FUNCTIONS ---
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    }
}

// --- CORE & FILTERING FUNCTIONS ---

/**
 * Step 2: Populate Categories Dynamically
 * Extracts unique categories and populates the filter dropdown.
 */
function populateCategories() {
    const categories = ['all', ...new Set(quotes.map(quote => quote.category))];
    
    // Clear existing options
    categoryFilter.innerHTML = '';

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categoryFilter.appendChild(option);
    });

    // Restore last selected filter from local storage
    const lastFilter = localStorage.getItem('lastFilterCategory') || 'all';
    categoryFilter.value = lastFilter;
}

/**
 * Step 2: Filter Quotes Based on Selected Category
 * Updates the display based on the selected category and saves the choice.
 */
function filterQuotes() {
    const selectedCategory = categoryFilter.value;
    // Remember the last selected filter
    localStorage.setItem('lastFilterCategory', selectedCategory);
    showRandomQuote();
}

/**
 * Displays a random quote based on the current filter.
 */
function showRandomQuote() {
    const selectedCategory = categoryFilter.value;
    
    const filteredQuotes = selectedCategory === 'all' 
        ? quotes 
        : quotes.filter(quote => quote.category === selectedCategory);

    if (filteredQuotes.length === 0) {
        quoteDisplay.innerHTML = `<p>No quotes available for the "${selectedCategory}" category.</p>`;
        return;
    }

    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const randomQuote = filteredQuotes[randomIndex];
    
    quoteDisplay.innerHTML = `<p>"${randomQuote.text}"</p><p><em>- ${randomQuote.category}</em></p>`;
    sessionStorage.setItem('lastViewedQuote', JSON.stringify(randomQuote));
}

/**
 * Handles adding a new quote and updating the category list.
 */
function addQuote() {
    const newQuoteTextInput = document.getElementById('newQuoteText');
    const newQuoteCategoryInput = document.getElementById('newQuoteCategory');

    const quoteText = newQuoteTextInput.value.trim();
    const quoteCategory = newQuoteCategoryInput.value.trim();

    if (quoteText === "" || quoteCategory === "") {
        alert("Please fill out both fields.");
        return;
    }

    const newQuote = { text: quoteText, category: quoteCategory };
    quotes.push(newQuote);
    saveQuotes();
    
    // Step 3: Update categories dropdown if a new category is added
    populateCategories();

    newQuoteTextInput.value = '';
    newQuoteCategoryInput.value = '';
    alert("Quote added successfully!");
    showRandomQuote();
}

function createAddQuoteForm() {
    const formContainer = document.getElementById('addQuoteForm');
    
    const quoteTextInput = document.createElement('input');
    quoteTextInput.id = 'newQuoteText';
    quoteTextInput.type = 'text';
    quoteTextInput.placeholder = 'Enter a new quote';
    
    const categoryInput = document.createElement('input');
    categoryInput.id = 'newQuoteCategory';
    categoryInput.type = 'text';
    categoryInput.placeholder = 'Enter quote category';

    const addButton = document.createElement('button');
    addButton.textContent = 'Add Quote';
    addButton.onclick = addQuote;

    formContainer.appendChild(quoteTextInput);
    formContainer.appendChild(categoryInput);
    formContainer.appendChild(addButton);
}

// --- IMPORT/EXPORT FUNCTIONS ---
function exportToJsonFile() {
    const jsonString = JSON.stringify(quotes, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedQuotes = JSON.parse(e.target.result);
            if (Array.isArray(importedQuotes)) {
                quotes.push(...importedQuotes);
                saveQuotes();
                populateCategories(); // Update categories after import
                alert('Quotes imported successfully!');
                showRandomQuote();
            } else {
                alert('Invalid JSON file format.');
            }
        } catch (error) {
            alert('Error reading or parsing the file.');
        }
    };
    reader.readAsText(file);
}

// --- INITIALIZATION & EVENT LISTENERS ---
function initializeApp() {
    loadQuotes();
    populateCategories();
    showRandomQuote();
    createAddQuoteForm();

    newQuoteBtn.addEventListener('click', showRandomQuote);
    exportButton.addEventListener('click', exportToJsonFile);
    importFileInput.addEventListener('change', importFromJsonFile);
}

initializeApp();