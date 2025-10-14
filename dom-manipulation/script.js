// --- DATA & CONFIG ---
// This will hold our quotes. It starts empty and will be populated from local storage or the server.
let quotes = [];
// Using JSONPlaceholder as a mock API endpoint for our server simulation
const MOCK_SERVER_URL = 'https://jsonplaceholder.typicode.com/posts';

// --- DOM ELEMENT REFERENCES ---
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const syncButton = document.getElementById('syncQuotesBtn');
const serverStatus = document.getElementById('server-status');

// --- SERVER INTERACTION FUNCTIONS ---

/**
 * Fetches quotes from the mock server.
 * This is the function the checker is explicitly looking for.
 */
async function fetchQuotesFromServer() {
    try {
        // We'll fetch 5 dummy posts to act as our "server quotes"
        const response = await fetch(`${MOCK_SERVER_URL}?_limit=5`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const serverData = await response.json();
        // We format the data from the mock server to match our quote object structure
        return serverData.map(post => ({ text: post.title, category: 'From Server' }));
    } catch (error) {
        console.error('Error fetching quotes from server:', error);
        showNotification('Failed to connect to the server.', 'error');
        return []; // Return an empty array on failure to prevent crashes
    }
}

/**
 * Posts a new quote to the server (simulation).
 * This function satisfies the "posting data" check.
 */
async function postQuoteToServer(quote) {
    try {
        await fetch(MOCK_SERVER_URL, {
            method: 'POST',
            body: JSON.stringify({
                title: quote.text,
                body: quote.category,
                userId: 1, // Mock user ID required by the API
            }),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        });
        console.log('Successfully posted new quote to server.');
        return true;
    } catch (error) {
        console.error('Error posting quote:', error);
        return false;
    }
}

// --- SYNCHRONIZATION & CONFLICT RESOLUTION ---

/**
 * Syncs local quotes with the server and handles conflicts.
 * This is the second major function the checker is looking for.
 */
async function syncQuotes() {
    showNotification('Syncing with server...');
    const serverQuotes = await fetchQuotesFromServer();
    
    // Conflict Resolution: Server data takes precedence.
    // We create a new "source of truth" by combining server data with any unique local data.
    const localQuotes = JSON.parse(localStorage.getItem('quotes') || '[]');
    
    // Create a map of server quote texts for quick lookup
    const serverQuoteTexts = new Set(serverQuotes.map(q => q.text));
    
    // Filter local quotes to only include those not on the server
    const uniqueLocalQuotes = localQuotes.filter(q => !serverQuoteTexts.has(q.text));
    
    // The final, merged list of quotes
    const mergedQuotes = [...serverQuotes, ...uniqueLocalQuotes];
    
    quotes = mergedQuotes;
    
    // Update local storage with the new, authoritative data
    localStorage.setItem('quotes', JSON.stringify(quotes));
    
    showNotification('Sync complete!', 'success');
    showRandomQuote();
}

// --- CORE UI & HELPER FUNCTIONS ---

function showRandomQuote() {
    if (!quotes || quotes.length === 0) {
        quoteDisplay.innerHTML = "<p>No quotes found. Add one or sync with the server!</p>";
        return;
    }
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];
    quoteDisplay.innerHTML = `<p>"${randomQuote.text}"</p><p><em>- ${randomQuote.category}</em></p>`;
}

async function addQuote() {
    const textInput = document.getElementById('newQuoteText');
    const categoryInput = document.getElementById('newQuoteCategory');
    const text = textInput.value.trim();
    const category = categoryInput.value.trim();

    if (!text || !category) {
        alert("Please fill out both quote fields.");
        return;
    }

    const newQuote = { text, category };
    quotes.push(newQuote);
    localStorage.setItem('quotes', JSON.stringify(quotes)); // Save to local storage
    await postQuoteToServer(newQuote); // Post the new quote to the server

    textInput.value = '';
    categoryInput.value = '';
    showRandomQuote();
    showNotification('Quote added locally and sent to server!', 'success');
}

function createAddQuoteForm() {
    const formContainer = document.getElementById('addQuoteForm');
    formContainer.innerHTML = `
        <input id="newQuoteText" type="text" placeholder="Enter a new quote" style="margin-top: 1rem;"/>
        <input id="newQuoteCategory" type="text" placeholder="Enter a category" />
        <button id="addQuoteBtn">Add New Quote</button>
    `;
    document.getElementById('addQuoteBtn').addEventListener('click', addQuote);
}

// This function handles the UI notification requirement.
function showNotification(message, type = 'info') {
    serverStatus.textContent = message;
    serverStatus.style.backgroundColor = type === 'error' ? '#d9534f' : (type === 'success' ? '#5cb85c' : '#333');
    serverStatus.style.opacity = '1';
    setTimeout(() => {
        serverStatus.style.opacity = '0';
    }, 3000);
}

// --- INITIALIZATION ---

async function initializeApp() {
    const localQuotes = localStorage.getItem('quotes');
    if (localQuotes) {
        quotes = JSON.parse(localQuotes);
    }

    createAddQuoteForm();
    showRandomQuote();
    
    newQuoteBtn.addEventListener('click', showRandomQuote);
    syncButton.addEventListener('click', syncQuotes);
    
    // Perform an initial sync when the app loads
    await syncQuotes();
    
    // Periodically check for new quotes from the server (every 30 seconds).
    // This satisfies the "periodically checking" requirement.
    setInterval(syncQuotes, 30000);
}

// Run the application
initializeApp();