document.addEventListener("DOMContentLoaded", () => {
  // --- DATA ---
  // Initial array of quote objects
  let quotes = [
    {
      text: "The only way to do great work is to love what you do.",
      category: "Motivation",
    },
    {
      text: "Innovation distinguishes between a leader and a follower.",
      category: "Technology",
    },
    {
      text: "Your time is limited, don't waste it living someone else's life.",
      category: "Life",
    },
    {
      text: "The future belongs to those who believe in the beauty of their dreams.",
      category: "Inspiration",
    },
    { text: "Stay hungry, stay foolish.", category: "Motivation" },
    { text: "The purpose of our lives is to be happy.", category: "Life" },
  ];

  // --- DOM ELEMENT REFERENCES ---
  const quoteDisplay = document.getElementById("quoteDisplay");
  const newQuoteBtn = document.getElementById("newQuote");
  const addQuoteBtn = document.getElementById("addQuoteBtn");
  const newQuoteTextInput = document.getElementById("newQuoteText");
  const newQuoteCategoryInput = document.getElementById("newQuoteCategory");
  const categoryFilterContainer = document.getElementById("categoryFilter");
  const feedbackMessage = document.getElementById("feedbackMessage");

  let lastQuoteIndex = -1; // To avoid showing the same quote twice in a row
  let currentCategory = "all"; // Default filter

  // --- FUNCTIONS ---

  /**
   * Displays a random quote in the quoteDisplay element.
   * Filters by currentCategory if it's not 'all'.
   */
  function showRandomQuote() {
    // Filter quotes based on the current category
    const filteredQuotes =
      currentCategory === "all"
        ? quotes
        : quotes.filter(
            (quote) =>
              quote.category.toLowerCase() === currentCategory.toLowerCase()
          );

    if (filteredQuotes.length === 0) {
      quoteDisplay.innerHTML = `<p class="text-gray-600">No quotes available for this category.</p>`;
      return;
    }

    // Find a new random index that is different from the last one
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    } while (filteredQuotes.length > 1 && randomIndex === lastQuoteIndex);

    lastQuoteIndex = randomIndex;
    const randomQuote = filteredQuotes[randomIndex];

    // Apply a fade-out effect, change content, then fade back in
    quoteDisplay.classList.add("fade-out");

    setTimeout(() => {
      // Create new elements for the quote
      const quoteTextElement = document.createElement("p");
      quoteTextElement.className = "text-lg italic text-gray-800";
      quoteTextElement.textContent = `"${randomQuote.text}"`;

      const quoteCategoryElement = document.createElement("p");
      quoteCategoryElement.className = "text-sm text-gray-500 mt-2 text-right";
      quoteCategoryElement.textContent = `- ${randomQuote.category}`;

      // Clear previous content and append new elements
      quoteDisplay.innerHTML = "";
      quoteDisplay.appendChild(quoteTextElement);
      quoteDisplay.appendChild(quoteCategoryElement);

      // Fade back in
      quoteDisplay.classList.remove("fade-out");
    }, 500); // Matches the CSS transition duration
  }

  /**
   * Handles the logic for adding a new quote from the form inputs.
   */
  function addQuote() {
    const quoteText = newQuoteTextInput.value.trim();
    const quoteCategory = newQuoteCategoryInput.value.trim();

    // Basic validation
    if (quoteText === "" || quoteCategory === "") {
      showFeedback("Please fill out both fields.", "error");
      return;
    }

    // Create the new quote object
    const newQuote = {
      text: quoteText,
      category: quoteCategory,
    };

    // Add the new quote to the array
    quotes.push(newQuote);

    // Clear the input fields
    newQuoteTextInput.value = "";
    newQuoteCategoryInput.value = "";

    showFeedback("Quote added successfully!", "success");

    // Refresh the category filters to include the new one if it's unique
    populateCategoryFilters();
  }

  /**
   * Creates and populates the category filter buttons based on unique categories in the quotes array.
   */
  function populateCategoryFilters() {
    // Get unique categories
    const categories = [
      "all",
      ...new Set(quotes.map((quote) => quote.category)),
    ];

    // Clear existing buttons
    categoryFilterContainer.innerHTML = "";

    // Create a button for each category
    categories.forEach((category) => {
      const button = document.createElement("button");
      button.textContent = category;
      button.dataset.category = category; // Use data-attribute for filtering

      // Base classes
      const baseClasses =
        "py-1 px-3 rounded-full text-sm font-semibold transition duration-300";

      // Apply active styles if it's the current category
      if (category.toLowerCase() === currentCategory.toLowerCase()) {
        button.className = `${baseClasses} bg-blue-600 text-white`;
      } else {
        button.className = `${baseClasses} bg-gray-200 text-gray-700 hover:bg-gray-300`;
      }

      button.addEventListener("click", () => {
        currentCategory = category;
        // Update styles on all buttons
        document.querySelectorAll("#categoryFilter button").forEach((btn) => {
          if (
            btn.dataset.category.toLowerCase() === currentCategory.toLowerCase()
          ) {
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

  /**
   * Displays a temporary feedback message to the user.
   * @param {string} message - The message to display.
   * @param {string} type - 'success' or 'error' for styling.
   */
  function showFeedback(message, type) {
    feedbackMessage.textContent = message;
    feedbackMessage.className =
      type === "success"
        ? "text-center text-sm text-green-600 mt-2 h-4"
        : "text-center text-sm text-red-500 mt-2 h-4";

    // Clear the message after 3 seconds
    setTimeout(() => {
      feedbackMessage.textContent = "";
    }, 3000);
  }

  // --- EVENT LISTENERS ---
  newQuoteBtn.addEventListener("click", showRandomQuote);
  addQuoteBtn.addEventListener("click", addQuote);

  // --- INITIALIZATION ---
  // Populate filters and show the first quote when the page loads
  populateCategoryFilters();
  showRandomQuote();
});
