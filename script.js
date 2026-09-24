const searchForm = document.getElementById("search-form")
const searchInput = document.getElementById("search-input")
const movieResults = document.getElementById("movie-results")

searchForm.addEventListener("submit", (event) => {
  event.preventDefault()
  const query = searchInput.value
console.log(query)
searchMovies(query)
})

const searchMovies = async (query)=>{
  const response = await fetch(`https://api.themoviedb.org/3/search/movie?query=${query}`,{
    method: "GET",
    headers: {
      Authorization: `Bearer ${API_TOKEN}`
    }
  })


  const data = await response.json()
  movieResults.innerHTML = "";

  if (data.results.length === 0) {
    movieResults.innerText = "No movies found.";
  } else {
    data.results.forEach(movie => {
      const movieCard = document.createElement("div")
      const movieTitle = document.createElement("h2");
      movieTitle.innerText = movie.title
      const movieDate = document.createElement("p");
      if (movie.release_date !== "") {
        movieDate.innerText = movie.release_date.slice(0, 4);
      } else {
        movieDate.innerText = "Release date unknown";
      }

      const movieRating = document.createElement("p");
      movieRating.innerText = `⭐ ${movie.vote_average.toFixed(1)}`
      
      const moviePoster = document.createElement("img");
      if (movie.poster_path !== null) {
        moviePoster.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;  
      }else{
        moviePoster.src = ".//images/img placeholder.png"
      }
      
      movieCard.appendChild(moviePoster)
      movieCard.appendChild(movieRating)
      movieCard.appendChild(movieTitle);
      movieCard.appendChild(movieDate);
      movieResults.appendChild(movieCard)
    });
  }
  
}

