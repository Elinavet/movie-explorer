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
let favourites = [];
let showingFavourites = false;

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
    getTopRatedMovies()
  }else{
    showingFavourites = true;
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
  showingFavourites = false;
  movieDetails.style.display = "none";
  movieResults.style.display = "grid";
  movieResults.innerText = "Searching...";
  searchMovies(query)
})

const searchMovies = async (query)=>{
  try{
    const response = await fetch(`https://api.themoviedb.org/3/search/movie?query=${query}`,{
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

  if (data.results.length === 0) {
    movieResults.innerText = "No movies found.";
  } else {
    data.results.forEach(movie => {
      const myMovie = Movie.fromApiData(movie);
    renderMovieCard(myMovie)  
    });  
  }
  }catch(error){
    console.error(error);
    movieResults.innerText = "Something went wrong.";
  }  
}

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
    data.results.forEach(movie => {
      const myMovie = Movie.fromApiData(movie);
      renderMovieCard(myMovie)  
    }); 
  }catch(error){
    console.error(error);
    movieResults.innerText = "Something went wrong.";
  }
}

const renderMovieCard =(myMovie, isFavouritesView = false)=>{
  const movieCard = document.createElement("div");
  movieCard.addEventListener("click", () => {
    showingFavourites = false;
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
}

getTopRatedMovies();

