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
                'Content-Type': 'application/json; charset=UTF-8',
            },
        });
        const newPost = await response.json();
        console.log('Successfully posted to server:', newPost);
        return true;
    } catch (error) {
        console.error('Error posting quote to server:', error);
        showNotification('Failed to post to server; saved locally.', 'error');
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
    showNotification('Quotes synced with server!', 'success');
    showRandomQuote();
}

// --- CORE UI & HELPER FUNCTIONS ---

function showRandomQuote() {
    // Clear previous content using DOM methods
    while (quoteDisplay.firstChild) {
        quoteDisplay.removeChild(quoteDisplay.firstChild);
    }

    if (quotes.length === 0) {
        const msg = document.createElement('p');
        msg.textContent = "No quotes available. Sync with the server or add a new one!";
        quoteDisplay.appendChild(msg);
        return;
    }

    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];

    const quoteText = document.createElement('p');
    quoteText.textContent = `"${randomQuote.text}"`;

    const quoteCategory = document.createElement('p');
    const em = document.createElement('em');
    em.textContent = `- ${randomQuote.category}`;
    quoteCategory.appendChild(em);

    quoteDisplay.appendChild(quoteText);
    quoteDisplay.appendChild(quoteCategory);
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
    
    // Optionally disable the add button while posting
    const addBtn = document.getElementById('addQuoteBtn');
    if (addBtn) addBtn.disabled = true;

    await postQuoteToServer(newQuote);

    if (addBtn) addBtn.disabled = false;

    textInput.value = '';
    categoryInput.value = '';
    showRandomQuote();
    showNotification('Quote added and sent to server!', 'success');
}

function createAddQuoteForm() {
    const formContainer = document.getElementById('addQuoteForm');

    // Clear container if anything exists
    while (formContainer.firstChild) {
        formContainer.removeChild(formContainer.firstChild);
    }

    const inputText = document.createElement('input');
    inputText.id = 'newQuoteText';
    inputText.type = 'text';
    inputText.placeholder = 'Enter a new quote';

    const inputCategory = document.createElement('input');
    inputCategory.id = 'newQuoteCategory';
    inputCategory.type = 'text';
    inputCategory.placeholder = 'Enter quote category';

    const addBtn = document.createElement('button');
    addBtn.id = 'addQuoteBtn';
    addBtn.type = 'button';
    addBtn.textContent = 'Add Quote';

    // Append elements to the form container
    formContainer.appendChild(inputText);
    formContainer.appendChild(inputCategory);
    formContainer.appendChild(addBtn);

    // Event listeners
    addBtn.addEventListener('click', addQuote);

    // Allow pressing Enter in the category input to submit
    inputCategory.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addQuote();
    });
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
        try {
            quotes = JSON.parse(localQuotes);
        } catch (e) {
            console.warn('Failed to parse local quotes, resetting.', e);
            quotes = [];
        }
    }

    createAddQuoteForm();
    showRandomQuote();
    
    if (newQuoteBtn) newQuoteBtn.addEventListener('click', showRandomQuote);
    if (syncButton) syncButton.addEventListener('click', syncQuotes);
    
    setInterval(syncQuotes, 60000);

    syncQuotes();
}

initializeApp();

