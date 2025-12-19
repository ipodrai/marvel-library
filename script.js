
const moviesGrid = document.getElementById('moviesGrid');
const searchInput = document.getElementById('searchInput');
const timelineToggle = document.getElementById('timelineToggle');
const timelineContainer = document.getElementById('timelineContainer');
const movieModal = document.getElementById('movieModal');
const closeModal = document.getElementById('closeModal');
const modalMovieTitle = document.getElementById('modalMovieTitle');
const modalBody = document.getElementById('modalBody');
const backToTop = document.getElementById('backToTop');
const phaseBtns = document.querySelectorAll('.phase-btn');


document.addEventListener('DOMContentLoaded', () => {

    setTimeout(() => renderMovies(marvelMovies), 100);
    

    setupEventListeners();
    

    setTimeout(renderTimeline, 200);
});


function renderMovies(movies) {
    const fragment = document.createDocumentFragment();
    
    movies.forEach(movie => {
        const movieCard = document.createElement('article');
        movieCard.className = 'movie-card';
        movieCard.setAttribute('role', 'listitem');
        movieCard.innerHTML = `
            <div class="movie-poster-container">
                <img src="${movie.poster}" 
                     alt="${movie.alt || movie.title}" 
                     class="movie-poster" 
                     loading="lazy"
                     width="240"
                     height="360">
                <div class="movie-year" aria-label="Год выпуска: ${movie.year}">${movie.year}</div>
            </div>
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <div class="movie-phase" aria-label="${movie.phase}">${movie.phase}</div>
                <button class="view-details" data-id="${movie.id}" aria-label="Подробнее о фильме ${movie.title}">
                    🎬 Подробнее
                </button>
            </div>
        `;
        fragment.appendChild(movieCard);
    });
    
    moviesGrid.innerHTML = '';
    moviesGrid.appendChild(fragment);
    
    document.querySelectorAll('.view-details').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const movieId = button.getAttribute('data-id');
            showMovieDetails(movieId);
        });
    });
}


function renderTimeline() {
    const timeline = document.querySelector('.timeline');
    timeline.innerHTML = '';
    
    marvelMovies.forEach((movie, index) => {
        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';
        timelineItem.setAttribute('role', 'listitem');
        timelineItem.innerHTML = `
            <div class="timeline-content">
                <div class="timeline-year" aria-label="Год выхода">${movie.year}</div>
                <h3>${movie.title}</h3>
                <p>${movie.phase}</p>
            </div>
        `;
        timeline.appendChild(timelineItem);
    });
}


function showMovieDetails(movieId) {
    const movie = marvelMovies.find(m => m.id === movieId);
    
    if (!movie) {
        showError('Фильм не найден');
        return;
    }
    
    modalMovieTitle.textContent = `${movie.title} (${movie.year})`;
    modalMovieTitle.id = 'modalTitle';
    
    modalBody.innerHTML = `
        <img src="${movie.poster}" 
             alt="${movie.alt || movie.title}" 
             class="modal-poster"
             width="250"
             height="375">
        <div>
            <div class="movie-meta">
                <h3>${movie.phase}</h3>
                <p><strong>Год выпуска:</strong> ${movie.year}</p>
                <p><strong>Хронологический порядок:</strong> ${marvelMovies.findIndex(m => m.id === movieId) + 1} из ${marvelMovies.length}</p>
            </div>
            <p class="modal-description">${movie.description}</p>
            <div class="movie-actions">
                <a href="${movie.watchUrl}" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   class="watch-button"
                   aria-label="Смотреть ${movie.title} на Кинопоиске">
                    🎥 Смотреть на Кинопоиске
                </a>
                <button class="view-details" onclick="shareMovie('${movie.id}')" aria-label="Поделиться информацией о фильме">
                    📤 Поделиться
                </button>
            </div>
        </div>
    `;
    

    movieModal.removeAttribute('hidden');
    movieModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    document.body.setAttribute('aria-hidden', 'true');
    

    trapFocus(movieModal);
}


function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    element.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        }
        if (e.key === 'Escape') {
            closeMovieModal();
        }
    });

    firstFocusable.focus();
}


function closeMovieModal() {
    movieModal.style.display = 'none';
    movieModal.setAttribute('hidden', '');
    document.body.style.overflow = 'auto';
    document.body.removeAttribute('aria-hidden');
    timelineToggle.focus();
}


function showError(message) {
    moviesGrid.innerHTML = `<div class="error" role="alert">${message}</div>`;
}


window.shareMovie = function(movieId) {
    const movie = marvelMovies.find(m => m.id === movieId);
    if (navigator.share && movie) {
        navigator.share({
            title: movie.title,
            text: `Посмотри ${movie.title} (${movie.year}) - ${movie.phase}`,
            url: window.location.href + '#' + movie.id
        });
    } else {

        navigator.clipboard.writeText(window.location.href + '#' + movie.id)
            .then(() => alert('Ссылка скопирована в буфер обмена'));
    }
};


function setupEventListeners() {
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const searchTerm = e.target.value.toLowerCase().trim();
            const filteredMovies = marvelMovies.filter(movie => 
                movie.title.toLowerCase().includes(searchTerm) || 
                movie.year.includes(searchTerm) ||
                movie.phase.toLowerCase().includes(searchTerm) ||
                movie.description.toLowerCase().includes(searchTerm)
            );
            renderMovies(filteredMovies.length ? filteredMovies : marvelMovies);
            

            const url = new URL(window.location);
            if (searchTerm) {
                url.searchParams.set('q', searchTerm);
            } else {
                url.searchParams.delete('q');
            }
            window.history.replaceState({}, '', url);
        }, 300);
    });


    timelineToggle.addEventListener('click', () => {
        const isExpanded = timelineContainer.getAttribute('hidden') === null;
        if (isExpanded) {
            timelineContainer.setAttribute('hidden', '');
            timelineToggle.setAttribute('aria-expanded', 'false');
            timelineToggle.textContent = '📅 Показать хронологию';
        } else {
            timelineContainer.removeAttribute('hidden');
            timelineToggle.setAttribute('aria-expanded', 'true');
            timelineToggle.textContent = '📅 Скрыть хронологию';
            timelineContainer.scrollIntoView({ behavior: 'smooth' });
        }
    });


    phaseBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            phaseBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const phase = btn.dataset.phase;
            if (phase === 'all') {
                renderMovies(marvelMovies);
            } else {
                const filteredMovies = marvelMovies.filter(movie => 
                    movie.phaseNumber === parseInt(phase)
                );
                renderMovies(filteredMovies);
            }
        });
    });


    closeModal.addEventListener('click', closeMovieModal);


    movieModal.addEventListener('click', (e) => {
        if (e.target === movieModal) {
            closeMovieModal();
        }
    });


    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && movieModal.style.display === 'block') {
            closeMovieModal();
        }
    });


    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTop.classList.add('show');
        } else {
            backToTop.classList.remove('show');
        }
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        timelineToggle.focus();
    });


    const urlParams = new URLSearchParams(window.location.search);
    const initialSearch = urlParams.get('q');
    if (initialSearch) {
        searchInput.value = initialSearch;
        searchInput.dispatchEvent(new Event('input'));
    }

    if (window.location.hash) {
        const movieId = window.location.hash.substring(1);
        setTimeout(() => showMovieDetails(movieId), 500);
    }
}