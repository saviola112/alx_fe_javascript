// --- DATA & CONFIG ---
let quotes = [];
const MOCK_SERVER_URL = 'https://jsonplaceholder.typicode.com/posts'; // A mock API for server simulation

// --- DOM ELEMENT REFERENCES ---
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const syncButton = document.getElementById('syncQuotesBtn');
const serverStatus = document.getElementById('server-status');

// --- SERVER INTERACTION FUNCTIONS ---

/**
 * Fetches quotes from the mock server.
 */
async function fetchQuotesFromServer() {
    try {
        const response = await fetch(MOCK_SERVER_URL + '?_limit=5');
        const serverData = await response.json();
        return serverData.map(post => ({ text: post.title, category: 'Server' }));
    } catch (error) {
        console.error('Error fetching quotes from server:', error);
        showNotification('Could not connect to server.', 'error');
        return [];
    }
}

/**
 * Posts a new quote to the server (simulation).
 * This function contains the corrected 'Content-Type' header.
 */
async function postQuoteToServer(quote) {
    try {
        const response = await fetch(MOCK_SERVER_URL, {
            method: 'POST',
            body: JSON.stringify({
                title: quote.text,
                body: quote.category,
                userId: 1,
            }),
            headers: {
                'Content-Type': 'application/json; charset=UTF-8', // <-- THE FIX IS HERE (Capital 'T')
            },
        });
        const newPost = await response.json();
        console.log('Successfully posted to server:', newPost);
        return true;
    } catch (error) {
        console.error('Error posting quote to server:', error);
        return false;
    }
}


// --- SYNCHRONIZATION LOGIC ---

/**
 * Syncs local quotes with server data and resolves conflicts.
 */
async function syncQuotes() {
    showNotification('Syncing with server...');
    const serverQuotes = await fetchQuotesFromServer();
    
    const allQuotes = [...quotes, ...serverQuotes];
    const uniqueQuotes = allQuotes.filter((quote, index, self) => 
        index === self.findIndex((q) => q.text === quote.text)
    );
    
    quotes = uniqueQuotes;
    
    localStorage.setItem('quotes', JSON.stringify(quotes));
    showNotification('Sync complete!', 'success');
    showRandomQuote();
}

// --- CORE UI & HELPER FUNCTIONS ---

function showRandomQuote() {
    if (quotes.length === 0) {
        quoteDisplay.innerHTML = "<p>No quotes available. Sync with the server or add a new one!</p>";
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
        alert("Please provide both quote text and a category.");
        return;
    }

    const newQuote = { text, category };
    quotes.push(newQuote);
    localStorage.setItem('quotes', JSON.stringify(quotes));
    
    await postQuoteToServer(newQuote);
    
    textInput.value = '';
    categoryInput.value = '';
    showRandomQuote();
    showNotification('Quote added and sent to server!', 'success');
}

function createAddQuoteForm() {
    const formContainer = document.getElementById('addQuoteForm');
    formContainer.innerHTML = `
        <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
        <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
        <button id="addQuoteBtn">Add Quote</button>
    `;
    document.getElementById('addQuoteBtn').addEventListener('click', addQuote);
}

function showNotification(message, type = 'info') {
    serverStatus.textContent = message;
    serverStatus.style.backgroundColor = type === 'error' ? '#d9534f' : '#5cb85c';
    serverStatus.style.opacity = '1';
    setTimeout(() => {
        serverStatus.style.opacity = '0';
    }, 3000);
}


// --- INITIALIZATION ---

function initializeApp() {
    const localQuotes = localStorage.getItem('quotes');
    if (localQuotes) {
        quotes = JSON.parse(localQuotes);
    }

    createAddQuoteForm();
    showRandomQuote();
    
    newQuoteBtn.addEventListener('click', showRandomQuote);
    syncButton.addEventListener('click', syncQuotes);
    
    setInterval(syncQuotes, 60000);

    syncQuotes();
}

initializeApp();