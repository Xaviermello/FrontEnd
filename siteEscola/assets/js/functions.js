var app = new Vue({
    el: '#app',
    data: {
       user: null,
    },
    mounted() {
        // Carregar dados do usuário do localStorage ao iniciar
        if(localStorage.user) {
            this.user = JSON.parse(localStorage.user);
        }
    },
})

var app2 = new Vue({
    el: '#app2',
    data: {
       user2: null,
    },
    mounted() {
        // Carregar dados do usuário do localStorage ao iniciar
        if(localStorage.user) {
            this.user2 = JSON.parse(localStorage.user);
        }
    },
})

function login() {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
        "email":  document.getElementById('email').value,
        "password":  document.getElementById('pass').value
    });

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw
    };

    fetch("http://localhost:8080/api/v1/auth/login", requestOptions)
    .then((response) => response.json())
    .then((result) => this.app.user = result, setTimeout(() => {localStorage.user = JSON.stringify(this.app.user)}, 200))
    .catch((error) => console.error(error));

}

function printar() {
    app.getUsuario()
    // console.log(this.app.user)
}

//
// setCookie("user", {
//     "id": 1,
//     "name": "teste",
//     "email": "email@teste",
//     "token": "2654654165d1sf65s1df6s5d1f6s51f6s5d1fs65df1s65d1fs65f1s6"
// }, 3)

// function isLogged() {
//     const user = getCookie("user")
//     console.log(user)
//     if (user != null) {

//         document.getElementById('bemvindo').innerHTML = "Bem vindo " + user.name // adiciona um texto
//         document.getElementsByClassName('searchbar-part')[0].remove() // remove o deslogar, uma forma mas da para fazer de diferentes
//     }

// }

// isLogged()

// function login() {
//     const myHeaders = new Headers();
//     myHeaders.append("Content-Type", "application/json");

//     const raw = JSON.stringify({
//         "email":  document.getElementById('email').value,
//         "password":  document.getElementById('pass').value
//     });

//     const requestOptions = {
//         method: "POST",
//         headers: myHeaders,
//         body: raw
//     };

//     fetch("http://localhost:8080/api/v1/auth/login", requestOptions)
//     .then((response) => response.json())
//     .then((result) => setCookie("user", result, 3))
//     .catch((error) => console.error(error));
// }

// function setCookie(name, value, days) {
//     var expires = "";
    
//     if (days) {
//         var date = new Date();
//         date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
//         expires = "; expires=" + date.toUTCString();
//     }
    
//     document.cookie = name + "=" + encodeURIComponent(JSON.stringify(value)) + expires + "; path=/";
// }

// function getCookie(name) {
//     var nameEQ = name + "=";
//     var ca = document.cookie.split(';');
    
//     for(var i = 0; i < ca.length; i++) {
//         var c = ca[i];
//         while (c.charAt(0) === ' ') c = c.substring(1, c.length);
//         if (c.indexOf(nameEQ) === 0) {
//             var decodedCookie = decodeURIComponent(c.substring(nameEQ.length, c.length));
//             return JSON.parse(decodedCookie);
//         }
//     }
    
//     return null;
// }