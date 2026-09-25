const searchForm = document.getElementById("search-form")
const searchInput = document.getElementById("search-input")
const movieResults = document.getElementById("movie-results")
const movieDetails = document.getElementById("movie-details")


searchForm.addEventListener("submit", (event) => {
  event.preventDefault()
  const query = searchInput.value.trim()
  if(query === ""){
    movieResults.innerText = "Please enter a movie title."
    return
  }
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
      const movieCard = document.createElement("div");
      movieCard.addEventListener("click", () => {
        getMovieDetails(movie.id)
      })
      
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
  }catch(error){
    console.error(error);
    movieResults.innerText = "Something went wrong.";
  }  
}

const getMovieDetails = async (movieId)=>{
  try{
    const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}`,{
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`
      }
    })
    const data = await response.json()
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
    detailsOverview.innerText = data.overview
    if(data.overview === ""){
      detailsOverview.innerText = "No overview available."
    }else{
      detailsOverview.innerText = data.overview
    }

    const detailsRuntime = document.createElement("p")
    detailsRuntime.innerText = `Runtime: ${data.runtime} minutes`

    const detailsGenres = document.createElement("p")
    detailsGenres.innerText = `Genres: ${data.genres.map(genre => genre.name).join(", ")}`

    const detailsRating = document.createElement("p")
    detailsRating.innerText = `⭐${data.vote_average.toFixed(1)}/10`

    const detailsLanguage = document.createElement("p")
    detailsLanguage.innerText = `Language: ${data.original_language}`

    const detailsPoster = document.createElement("img");
    if (data.poster_path !== null) {
      detailsPoster.src = `https://image.tmdb.org/t/p/w500${data.poster_path}`;  
    }else{
      detailsPoster.src = ".//images/img placeholder.png"
    }
    
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
  }catch(error){
    console.log(error)
  }
}

