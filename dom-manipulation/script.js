// --- DATA ---
// Default quotes, used only if local storage is empty
let quotes = [
    { text: "The only way to do great work is to love what you do.", category: "Motivation" },
    { text: "Your time is limited, don't waste it living someone else's life.", category: "Life" },
];

// --- DOM ELEMENT REFERENCES ---
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const exportButton = document.getElementById('exportQuotesBtn');
const importFileInput = document.getElementById('importFile');

// --- STORAGE FUNCTIONS ---

/**
 * STEP 1: Using Local Storage
 * Saves the current `quotes` array to local storage.
 */
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

/**
 * STEP 1: Using Local Storage
 * Loads quotes from local storage when the page starts.
 */
function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    }
}

// --- CORE FUNCTIONS ---

/**
 * Displays a random quote and saves it to session storage.
 */
function showRandomQuote() {
    if (quotes.length === 0) {
        quoteDisplay.innerHTML = "<p>No quotes available. Add one below!</p>";
        return;
    }
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];
    
    quoteDisplay.innerHTML = `<p>"${randomQuote.text}"</p><p><em>- ${randomQuote.category}</em></p>`;
    
    /**
     * STEP 1: Using Session Storage (Optional)
     * Saves the last viewed quote for the current session.
     */
    sessionStorage.setItem('lastViewedQuote', JSON.stringify(randomQuote));
}

/**
 * Handles the logic for adding a new quote from the form.
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
    saveQuotes(); // This saves to local storage after adding

    newQuoteTextInput.value = '';
    newQuoteCategoryInput.value = '';
    alert("Quote added successfully!");
    showRandomQuote();
}

/**
 * Creates and appends the "Add Quote" form to the DOM.
 */
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

/**
 * STEP 2: Implement JSON Export
 * Exports the current quotes array to a quotes.json file.
 */
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

/**
 * STEP 2: Implement JSON Import
 * Imports quotes from a user-selected JSON file.
 */
function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedQuotes = JSON.parse(e.target.result);
            if (Array.isArray(importedQuotes)) {
                quotes.push(...importedQuotes); // Adds imported quotes to the existing ones
                saveQuotes(); // Saves the newly merged list
                alert('Quotes imported successfully!');
                showRandomQuote(); // Refresh the display
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

// First, load existing quotes from local storage
loadQuotes();

// Then, set up the page with the loaded data
showRandomQuote();
createAddQuoteForm();

// Finally, attach event listeners to the buttons
newQuoteBtn.addEventListener('click', showRandomQuote);
exportButton.addEventListener('click', exportToJsonFile);
importFileInput.addEventListener('change', importFromJsonFile);