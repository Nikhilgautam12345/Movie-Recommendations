// Variables Declaration
let isLoading = false;
const loader = document.querySelector('.loader');
const openpanel = document.querySelector('.open-panel');
const mainPanel = document.getElementById('container');
const upperpanel = document.querySelector('.upperpanel');
const change = document.querySelector('.change');
const secondarypanel = document.querySelector('.secondary');
const loadingcontainer = document.querySelector('.loading-container');

// API URL and default movie IDs
const apiUrl = "https://www.omdbapi.com/?apikey=f5e3635"; 
const movieIds = ['tt2015381', 'tt7286456', 'tt6723592', 'tt6473300', 'tt0371746', 'tt2705436', 'tt0372784', 'tt3679040'];

// Initial display of movie data
displaymoviedata(movieIds);

// Hide open panel and remove class on body
openpanel.style.display = 'none';
document.body.classList.remove('stop-toggling');

// Handlebars Template Compilation
const moviestemplate = document.getElementById('movies-template').innerHTML;
const Genratedtemplate = Handlebars.compile(moviestemplate);

// Display movie data function
async function displaymoviedata(movieIds) {
    // Display loader
    loader.style.display = 'block';
    loadingcontainer.classList.add('active');
    isLoading = true;

    // Array to store movies data
    const moviesdata = [];

    // Loop through movie IDs to fetch data
    for (let i = 0; i < movieIds.length; i++) {
        try {
            const response = await fetch(`${apiUrl}&i=${movieIds[i]}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            moviesdata.push(data);
        } catch (error) {
            console.error('Error fetching movie data:', error.message);
        }
    }

    // Generate HTML from Handlebars template
    const CompiledData = Genratedtemplate({ data: moviesdata });
    const container = document.getElementById('container');
    container.innerHTML = CompiledData;

    // Add event listeners to movie cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            loadingcontainer.classList.add('active');
            setTimeout(() => {
                openpanel.style.display = 'flex';
                secondarypanel.classList.add('active');
                mainPanel.classList.add("active");
                upperpanel.classList.add('active');
                document.body.classList.add('stop-toggling');
            }, 300);

            // Show popup for clicked movie card
            popcard(e.currentTarget.id);
        });
    });

    // Hide loader after displaying data
    setTimeout(() => {
        loadingcontainer.classList.remove('active');
        loader.style.display = 'none';
        isLoading = false;
    }, 300);
}

// Function to display popup card for movie
async function popcard(cardId) {
    loader.style.zIndex = '9999';
    loader.style.display = 'block';
    isLoading = true;

    const response = await fetch(`${apiUrl}&i=${cardId}`);
    const data = await response.json();

    // Handlebars template for popup card
    const popuptemplate = document.getElementById('popup-template').innerHTML;
    const Genratedtemplate = Handlebars.compile(popuptemplate);
    const CompiledData = Genratedtemplate({ data: data });
    const targetcard = document.getElementById('targetcard');
    targetcard.innerHTML = CompiledData;

    // Add close icon to popup card
    const closeIcon = document.createElement('i');
    closeIcon.classList.add('fa-solid', 'fa-xmark');
    closeIcon.id = 'icon';
    targetcard.appendChild(closeIcon);

    // Event listener for close icon
    document.getElementById('icon').addEventListener('click', () => {
        secondarypanel.classList.remove('active');
        openpanel.style.display = 'none';
        mainPanel.classList.remove("active");
        document.body.classList.remove('stop-toggling');
        upperpanel.classList.remove('active');
    });

    // Hide loader after displaying popup card
    setTimeout(() => {
        loadingcontainer.classList.remove('active');
        loader.style.display = 'none';
        isLoading = false;
    }, 200);
}

// Function to fetch data based on search query
async function fetchData(searchValue) {
    try {
        // Display loader
        loader.style.zIndex = '9999';
        loader.style.display = 'block';
        isLoading = true;

        // Fetch data from API
        const responsevalue = await fetch(`${apiUrl}&s=${searchValue}`);

        if (!responsevalue.ok) {
            throw new Error('Network response was not ok');
        }

        const items = await responsevalue.json();
        const products = items.Search;

        // Generate HTML from Handlebars template
        const CompiledData = Genratedtemplate({ data: products });
        const container = document.getElementById('container');
        container.innerHTML = CompiledData;

        // Add event listeners to movie cards
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.addEventListener('click', (e) => {
                loadingcontainer.classList.add('active');
                setTimeout(() => {
                    openpanel.style.display = 'flex';
                    secondarypanel.classList.add('active');
                    mainPanel.classList.add("active");
                    document.body.classList.add('stop-toggling');
                    upperpanel.classList.add('active');
                }, 300);

                // Show popup for clicked movie card
                popcard(e.currentTarget.id);
            });
        });

        // Update label for search results
        change.innerHTML = `<h5>Search Results are found for "${searchValue}"</h5>`;

        // Hide loader after displaying search results
        setTimeout(() => {
            loader.style.display = 'none';
            loader.style.zIndex = 'initial';
            loadingcontainer.classList.remove('active');
            mainPanel.classList.remove("active");
            isLoading = false;
        }, 300);
    } catch (error) {
        console.log('Error fetching data:', Error);
    }
}

// Debounce function to limit API requests while typing
function debounce(func, delay) {
    let timer;
    return function () {
        const context = this;
        const args = arguments;
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(context, args);
        }, delay);
    };
}

// Event listener for search input
const searchMovie = document.getElementById('search-movie');
const debouncedSearch = debounce((value) => fetchData(value), 300);

searchMovie.addEventListener('input', (e) => {
    if (e.target.value.length >= 2) {
        if (!isLoading) {
            loader.style.display = 'block';
            loadingcontainer.classList.add('active');
            mainPanel.classList.add("active");
            isLoading = true;
        }
        debouncedSearch(e.target.value);
    } else {
        // Display default movie data if search query is empty
        displaymoviedata(movieIds);
        change.innerHTML = `<h5>Search Results are</h5>`;
    }
});
