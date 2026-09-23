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
  data.results.forEach(movie => {
    const movieCard = document.createElement("div")
    const movieTitle = document.createElement("h2");
    movieTitle.innerText = movie.title
    const movieDate = document.createElement("p");
    movieDate.innerText = movie.release_date.slice(0, 4)
    const movieRating = document.createElement("p");
    movieRating.innerText = movie.vote_average
    const moviePoster = document.createElement("img");
    moviePoster.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    
    movieCard.appendChild(moviePoster)
    movieCard.appendChild(movieRating)
    movieCard.appendChild(movieTitle);
    movieCard.appendChild(movieDate);
    movieResults.appendChild(movieCard)
  });
}

