class Movie {
  constructor(id, title, releaseDate, rating, posterPath) {
    this.id = id;
    this.title = title;
    this.releaseDate = releaseDate;
    this.rating = rating;
    this.posterPath = posterPath;
  }
  getYear(){
    if (this.releaseDate !== "") {
      return this.releaseDate.slice(0, 4);
    } else {
      return "Release date unknown";
    }
  }
  getPosterUrl(){
    if (this.posterPath !== null) {
      return `https://image.tmdb.org/t/p/w500${this.posterPath}`;  
    }else{
      return ".//images/img placeholder.png"
    }
  }
  getRating() {
    return `⭐ ${this.rating.toFixed(1)}`
  }
  static fromApiData(data){
    return new Movie(
      data.id,
      data.title,
      data.release_date,
      data.vote_average,
      data.poster_path
    )
  }
}


const searchForm = document.getElementById("search-form")
const searchInput = document.getElementById("search-input")
const movieResults = document.getElementById("movie-results")
const movieDetails = document.getElementById("movie-details")
const favouritesButton = document.getElementById("favourites-button")
const sortMovies = document.getElementById("sort-movies");
const loadMoreButton = document.getElementById("load-more");

let favourites = [];
let showingFavourites = false;
let currentMovies = [];
let originalMovies = [];
let currentPage = 1;
let currentQuery = "";

const savedFavourites = localStorage.getItem("favourites");
if (savedFavourites !== null) {
  const parsedFavourites = JSON.parse(savedFavourites);
  favourites = parsedFavourites.map(movie => {
    return new Movie(
      movie.id,
      movie.title,
      movie.releaseDate,
      movie.rating,
      movie.posterPath
    );
  });

}

favouritesButton.addEventListener("click", () => {
  if(showingFavourites){
    showingFavourites = false;
    sortMovies.value = "default";
    getTopRatedMovies()
  }else{
    showingFavourites = true;
    loadMoreButton.style.display = "none";
    sortMovies.value = "default";
    movieDetails.style.display = "none";
    movieResults.style.display = "grid";
    movieResults.innerHTML = "";
    if (favourites.length === 0) {
      movieResults.innerText = "No favourite movies yet.";
      return;
    }
  
    favourites.forEach((movie) => {
      renderMovieCard(movie, true);
    });
  }

});


searchForm.addEventListener("submit", (event) => {
  event.preventDefault()
  const query = searchInput.value.trim()
  if(query === ""){
    movieResults.innerText = "Please enter a movie title."
    return
  }
  currentQuery = query;
  currentPage = 1;
  showingFavourites = false;
  movieDetails.style.display = "none";
  movieResults.style.display = "grid";
  movieResults.innerText = "Searching...";
  searchMovies(query)
})

sortMovies.addEventListener("change", () => {
  const sortValue = sortMovies.value;
  let moviesToSort;

  if (showingFavourites) {
    moviesToSort = [...favourites];
  } else {
    moviesToSort = currentMovies;
  }

  if (sortValue === "default") {
    if (showingFavourites) {
      moviesToSort = [...favourites];
    } else {
      currentMovies = [...originalMovies];
      moviesToSort = currentMovies;
    }
  
  }else if (sortValue === "rating-high") {
    moviesToSort.sort((a, b) => b.rating - a.rating);
  }else if(sortValue === "rating-low"){
    moviesToSort.sort((a, b)=> a.rating - b.rating);
  }else if(sortValue === "newest"){
    moviesToSort.sort((a, b) => {
      if (a.releaseDate === "") return 1;
      if (b.releaseDate === "") return -1;
      const dateA = new Date(a.releaseDate);
      const dateB = new Date(b.releaseDate);
      return dateB - dateA;
    });
  }else if(sortValue === "oldest"){
    moviesToSort.sort((a, b) => {
      if (a.releaseDate === "") return 1;
      if (b.releaseDate === "") return -1;
      const dateA = new Date(a.releaseDate);
      const dateB = new Date(b.releaseDate);
      return dateA - dateB;
    });
  }
  movieResults.innerHTML = "";
  if (moviesToSort.length === 0) {
    if (showingFavourites) {
      movieResults.innerText = "No favourite movies yet.";
    } else {
      movieResults.innerText = "No movies found.";
    }
    return;
  }
  if (showingFavourites) {
    moviesToSort.forEach(movie => {
      renderMovieCard(movie, true);
    });
  } else {
    renderMovies();
  }
});

loadMoreButton.addEventListener("click", () => {
  currentPage++;
  searchMovies(currentQuery);
});

const searchMovies = async (query)=>{
  try{
    const response = await fetch(`https://api.themoviedb.org/3/search/movie?query=${query}&page=${currentPage}`,{
    method: "GET",
    headers: {
      Authorization: `Bearer ${API_TOKEN}`
    }
  })
  if(!response.ok){
    movieResults.innerText = "Something went wrong."
    return
  }


  const data = await response.json()
  if (currentPage >= data.total_pages) {
    loadMoreButton.style.display = "none";
  } else {
    loadMoreButton.style.display = "block";
  }
  if (currentPage === 1) {
    movieResults.innerHTML = "";
  }

  if (currentPage === 1) {
    sortMovies.value = "default";
  }

  if (data.results.length === 0) {
    currentMovies = [];
    originalMovies = [];
    movieResults.innerText = "No movies found.";
  } else {
    const newMovies = data.results.map(movie => {
      return Movie.fromApiData(movie);
    });
    if (currentPage === 1) {
      currentMovies = [...newMovies];
    } else {
      currentMovies.push(...newMovies);
    }

    originalMovies = [...currentMovies];
    if (currentPage === 1) {
      renderMovies();
    } else {
      sortMovies.dispatchEvent(new Event("change"));
    }
  }
  }catch(error){
    console.error(error);
    movieResults.innerText = "Something went wrong.";
  }  
}

const renderMovies = () => {
  currentMovies.forEach(movie => {
    renderMovieCard(movie);
  });
};

const getTopRatedMovies = async () => {
  try{
    const response = await fetch('https://api.themoviedb.org/3/movie/top_rated', {
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`
      }
    })
    if(!response.ok){
      movieResults.innerText = "Something went wrong."
      return
    }
    const data = await response.json()
    movieResults.innerHTML = "";
    sortMovies.value = "default";
    currentMovies = data.results.map(movie => {
      return Movie.fromApiData(movie); 
    }); 
    originalMovies = [...currentMovies];
  }catch(error){
    console.error(error);
    movieResults.innerText = "Something went wrong.";
  }
  loadMoreButton.style.display = "none";
  renderMovies();
}

const renderMovieCard =(myMovie, isFavouritesView = false)=>{
  const movieCard = document.createElement("div");
  movieCard.addEventListener("click", () => {
    getMovieDetails(myMovie.id)
  })
  const movieTitle = document.createElement("h2");
      movieTitle.innerText = myMovie.title
      const movieDate = document.createElement("p");
      movieDate.innerText = myMovie.getYear()
      

      const movieRating = document.createElement("p");
      movieRating.innerText = myMovie.getRating()

      const moviePoster = document.createElement("img");
      moviePoster.src = myMovie.getPosterUrl();
      
      const favouriteButton = document.createElement("button");

      const existingFavourite = favourites.find(
        movie => movie.id === myMovie.id
      );
    
      if (existingFavourite) {
        favouriteButton.innerText = "♥";
      } else {
        favouriteButton.innerText = "♡";
      }
      favouriteButton.addEventListener("click", (event) => {
        event.stopPropagation();
        const existingMovie = favourites.find(movie => movie.id === myMovie.id);
        if(!existingMovie){
          favourites.push(myMovie);
          favouriteButton.innerText = "♥"
        }else{
          favourites = favourites.filter(movie => movie.id !== myMovie.id);
          favouriteButton.innerText = "♡"
          if(isFavouritesView){
            movieCard.remove();
            if (favourites.length === 0) {
              movieResults.innerText = "No favourite movies yet.";
            }
          }
        }
        localStorage.setItem("favourites", JSON.stringify(favourites));
        
    });

      movieCard.appendChild(moviePoster)
      movieCard.appendChild(movieRating)
      movieCard.appendChild(movieTitle);
      movieCard.appendChild(movieDate);
      movieCard.appendChild(favouriteButton);
      movieResults.appendChild(movieCard)
}

const getMovieDetails = async (movieId)=>{
  try{
    const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}`,{
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`
      }
    })
    if (!response.ok) {
      movieResults.style.display = "none";
      movieDetails.style.display = "block";
      movieDetails.innerText = "Something went wrong.";
      return;
    }
    const data = await response.json()
    const myMovie = Movie.fromApiData(data);
    movieResults.style.display = "none";
    movieDetails.style.display = "block";

    movieDetails.innerHTML = "";

    const detailsContent = document.createElement("div");
    detailsContent.id = "details-content";
    const detailsInfo = document.createElement("div");
    detailsInfo.id = "details-info";

    const backButton = document.createElement("button")
    backButton.innerText = "<-Back"
    backButton.addEventListener("click", ()=>{
      movieDetails.style.display = "none";
      movieResults.style.display = "grid";
    })

    const detailsTitle = document.createElement("h2");
    detailsTitle.innerText = data.title

    const detailsOverview = document.createElement("p");
    
    detailsOverview.innerText = !data.overview
    ? "No overview available."
    : data.overview;

    const detailsRuntime = document.createElement("p")
    detailsRuntime.innerText = !data.runtime
    ? "No runtime available."
    : `Runtime: ${data.runtime} minutes`

    const detailsGenres = document.createElement("p")
    detailsGenres.innerText = data.genres.length === 0
    ?"No genres available."
    :`Genres: ${data.genres.map(genre => genre.name).join(", ")}`

    const detailsRating = document.createElement("p")
    detailsRating.innerText = `Rating: ${myMovie.getRating()}/10`

    const detailsLanguage = document.createElement("p")
    detailsLanguage.innerText = `Language: ${data.original_language}`

    const detailsYear = document.createElement("p")
    detailsYear.innerText = `Year: ${myMovie.getYear()}`

    const detailsPoster = document.createElement("img");
    detailsPoster.src = myMovie.getPosterUrl();
    
    movieDetails.appendChild(backButton)
    movieDetails.appendChild(detailsContent)
    detailsContent.appendChild(detailsPoster)
    detailsContent.appendChild(detailsInfo)
    detailsInfo.appendChild(detailsTitle)
    detailsInfo.appendChild(detailsOverview)
    detailsInfo.appendChild(detailsRuntime)
    detailsInfo.appendChild(detailsGenres)
    detailsInfo.appendChild(detailsRating)
    detailsInfo.appendChild(detailsLanguage)
    detailsInfo.appendChild(detailsYear)
  }catch(error){
    console.error(error)
    movieResults.style.display = "none";
    movieDetails.style.display = "block";
    movieDetails.innerText = "Something went wrong.";
  }
  loadMoreButton.style.display = "none";
}

getTopRatedMovies();

