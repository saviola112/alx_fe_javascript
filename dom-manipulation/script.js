// --- DATA & CONFIG ---
let quotes = [
    { text: "The only way to do great work is to love what you do.", category: "Motivation" }
];
const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts';

// --- DOM ELEMENT REFERENCES ---
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const exportButton = document.getElementById('exportQuotesBtn');
const importFileInput = document.getElementById('importFile');
const categoryFilter = document.getElementById('categoryFilter');
const notificationArea = document.getElementById('notification');
const syncServerBtn = document.getElementById('syncServerBtn');

// --- NOTIFICATION FUNCTION ---
function showNotification(message, duration = 3000) {
    notificationArea.textContent = message;
    notificationArea.style.display = 'block';
    setTimeout(() => {
        notificationArea.style.display = 'none';
    }, duration);
}

// --- SERVER & SYNCING FUNCTIONS ---

/**
 * Step 1 & 2: Fetches data from the server and syncs it.
 * Conflict Resolution: Server data takes precedence. New quotes from the
 * server are added if they don't already exist locally.
 */
async function syncWithServer() {
    try {
        const response = await fetch(SERVER_URL);
        const serverPosts = await response.json();
        
        // Map server data to our quote format
        const serverQuotes = serverPosts.map(post => ({
            text: post.body,
            category: post.title.split(' ')[0] // Use first word of title as category
        }));

        let newQuotesCount = 0;
        serverQuotes.forEach(serverQuote => {
            // Check if the quote text already exists in our local array
            const isDuplicate = quotes.some(localQuote => localQuote.text === serverQuote.text);
            if (!isDuplicate) {
                quotes.push(serverQuote);
                newQuotesCount++;
            }
        });

        if (newQuotesCount > 0) {
            saveQuotes();
            populateCategories();
            showRandomQuote();
            // Step 3: Inform user about the update
            showNotification(`Synced with server. ${newQuotesCount} new quotes added.`);
        } else {
            showNotification('Local quotes are already up-to-date with the server.');
        }

    } catch (error) {
        console.error("Error syncing with server:", error);
        showNotification('Failed to sync with server. Please check your connection.');
    }
}

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
function populateCategories() {
    const categories = ['all', ...new Set(quotes.map(quote => quote.category))];
    categoryFilter.innerHTML = '';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categoryFilter.appendChild(option);
    });
    const lastFilter = localStorage.getItem('lastFilterCategory') || 'all';
    categoryFilter.value = lastFilter;
}

function filterQuotes() {
    const selectedCategory = categoryFilter.value;
    localStorage.setItem('lastFilterCategory', selectedCategory);
    showRandomQuote();
}

function showRandomQuote() {
    const selectedCategory = categoryFilter.value;
    const filteredQuotes = selectedCategory === 'all' 
        ? quotes 
        : quotes.filter(quote => quote.category === selectedCategory);
    if (filteredQuotes.length === 0) {
        quoteDisplay.innerHTML = `<p>No quotes available. Try syncing with the server!</p>`;
        return;
    }
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const randomQuote = filteredQuotes[randomIndex];
    quoteDisplay.innerHTML = `<p>"${randomQuote.text}"</p><p><em>- ${randomQuote.category}</em></p>`;
    sessionStorage.setItem('lastViewedQuote', JSON.stringify(randomQuote));
}

function addQuote() {
    const newQuoteTextInput = document.getElementById('newQuoteText');
    const newQuoteCategoryInput = document.getElementById('newQuoteCategory');
    const quoteText = newQuoteTextInput.value.trim();
    const quoteCategory = newQuoteCategoryInput.value.trim();
    if (quoteText === "" || quoteCategory === "") {
        alert("Please fill out both fields.");
        return;
    }
    quotes.push({ text: quoteText, category: quoteCategory });
    saveQuotes();
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
    a.click();
    URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedQuotes = JSON.parse(e.target.result);
            quotes.push(...importedQuotes);
            saveQuotes();
            populateCategories();
            alert('Quotes imported successfully!');
            showRandomQuote();
        } catch (error) {
            alert('Error reading file.');
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
    syncServerBtn.addEventListener('click', syncWithServer);

    // Step 1: Periodically sync data with the server every 30 seconds
    setInterval(syncWithServer, 30000);
    
    // Initial sync on page load
    syncWithServer();
}

initializeApp();

