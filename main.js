var Roots = {
     // strona główna index.html
    main: {
        init: function() {
            const searchInput = document.getElementById("search-input");
            const searchMovieButton = document.getElementById("search-button");
            
            searchMovieButton.addEventListener('click', () => { 
                findObject(searchInput.value, ['tv', 'movie'], renderMovies) 
            });
            searchInput.addEventListener('keyup', function(event){
                event.preventDefault();
                if (event.keyCode === 13) {
                    findObject(searchInput.value, ['tv', 'movie'], renderMovies) 
                }
            });
            $(document).on("click", ".info-box", showDescription );
        }
    },
    // wyszukiwarka aktorów actors.html
    actors: {
        init: function() {
            const searchInput = document.getElementById("search-input");
            const searchActor = document.getElementById("search-actor");
            searchActor.addEventListener('click', () => { 
                findObject(searchInput.value, ['person'], renderActors) 
            });
        }
    }
};

const baseURL = 'https://api.themoviedb.org/3/';
const movieURL = 'http://image.tmdb.org/t/p/w300/';
const apiKey = '';

const genres = (function(){
    let genresArray = [];
    $.get(`${baseURL}genre/movie/list?language=pl&api_key=${apiKey}`)
    .then(
        data => {
            genresArray = data.genres;
        }
    );
    const getNames = (array) => {
        let list = [];
        array.forEach(element => {
            list.push(getName(element));
        });
        return list;
    };
    const getName = (id) => {
        let genre = genresArray.find((element) => {
            return element.id === id;
        });
        return (genre == undefined ) ? "Nieznany" : genre.name;
    };
    return {
        getName: getName,
        getNames: getNames
    };
 })();
const findObject = (name, types, renderFunction) => {
    let objects = [];
    $.get(`${baseURL}search/multi?include_adult=false&page=1&query=${name}&language=pl&api_key=${apiKey}`)
    .then(
        data => { 
            objects = data.results.filter((element) => {
                return types.indexOf(element.media_type) !== -1;
            });
            renderFunction(objects);
        }
    ); 
}
const renderMovies = (movies) => {
    document.getElementById("movies").innerHTML = "";
    if (movies.length > 0) {
        for(let i=0; i<movies.length; i++) {

            let div = document.createElement("div");
            div.classList.add('movie');
            
            let article = document.createElement("article");
            article.classList.add('box','info-box');
            
            let movieTitle = movies[i].title || movies[i].name;
            let overview = movies[i].overview.trim();
            
            let genre = genres.getNames(movies[i].genre_ids).join(", ");
            let date = movies[i].release_date || movies[i].first_air_date;
            let grade = movies[i].vote_average;
            
            let photoURL = movies[i].poster_path;
            (photoURL != undefined) ? photoURL = movieURL + photoURL : photoURL = "movie.png";
            
            let type = movies[i].media_type;
            (type === 'tv') ? type = 'serial' : type = 'film';
            
            article.innerHTML += `
                <img src="${photoURL}"> 
                <aside>
                    <h3>${movieTitle} (${date.substring(0,4)})</h3>
                    <h5>${type}</h5>
                    <p>gatunek: ${genre.toLowerCase()}</p>
                    <div class="grade"><i class="fas fa-star"></i> ${grade}</div>
                </aside>`;
            article.setAttribute('hasDescription', false);
            article.setAttribute('isClicked', false);

            let clear = document.createElement("div");
            clear.classList.add('clear');

            document.getElementById("movies").appendChild(div);
            document.getElementsByClassName("movie")[i].appendChild(article);
            
            if (overview !== "") {
                let description = document.createElement("article");
                description.classList.add('box','description-box');
                description.innerHTML += `<p>${overview}</p>`;
                document.getElementsByClassName("movie")[i].appendChild(description);
                article.setAttribute('hasDescription', true);
                article.style.cursor = 'pointer';
            }
            document.getElementsByClassName("movie")[i].appendChild(clear);
        }
    } else {
        let div = document.createElement("div");
        div.classList.add('error');
        div.innerHTML += `Brak wyników <i class="fas fa-sad-tear"></i>`;
        document.getElementById("movies").appendChild(div);
    }
}
const renderActors = (actors) => {
    document.getElementById("movies").innerHTML = "";
    if (actors.length > 0) {
        for(let i=0; i<actors.length; i++) {

            let div = document.createElement("div");
            div.classList.add('movie');
            
            let article = document.createElement("article");
            article.classList.add('box','actor-box');
            
            let actor = actors[i].name;
            
            let photoURL = actors[i].profile_path;
            (photoURL != undefined) ? photoURL = movieURL + photoURL : photoURL = "movie.png";
            
            let actorMovies = actors[i].known_for;
            let photos = [];
            actorMovies.forEach(element => photos += 
                `<img class="actor-movie" src="${movieURL+element.poster_path}"> `);
            
            article.innerHTML += `
                <img src="${photoURL}"> 
                <aside>
                    <h4>${actor}</h4>
                    <div class="actor-movies">${photos}<div>
                </aside>`; 
            
            document.getElementById("movies").appendChild(div);
            document.getElementsByClassName("movie")[i].appendChild(article);
        }
    } else {
        let div = document.createElement("div");
        div.classList.add('error');
        div.innerHTML += `Brak wyników <i class="fas fa-sad-tear"></i>`;
        document.getElementById("movies").appendChild(div);
    }
}
const showDescription = (event) => {
    const self = event.currentTarget;
    let hasDescription = $(self).attr('hasDescription');
    if (hasDescription === 'false') {
        return;
    }
    let isClicked = $(self).attr('isClicked');
    if (isClicked === 'false') {
        $(self).animate({
            opacity: '0.7',
            margin: '2% 2% 1% 10%'
        });
        $(self).siblings(".description-box").animate({
            width: '25%'
        });
        $(self).siblings(".description-box").css("visibility", "visible");
        $(self).attr('isClicked', true);
    } else {
        $(self).animate({
            opacity: '1',
            margin: '2% 20% 1% 25%'
        });
        $(self).siblings(".description-box").animate({
            width: '0%'
        });
        $(self).siblings(".description-box").css("visibility", "hidden");
        $(self).attr('isClicked', false);
    }
}
