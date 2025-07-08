const correoLogin = document.getElementById('correoLogin');
const passLogin = document.getElementById('passLogin');
const btnlogin = document.getElementById('btn')

function mostrarMensaje(msg, isError = false) {
    alert(msg); 
}

function validarLogin() {
    const userCorr = localStorage.getItem('userCorr');
    const userPass = localStorage.getItem('userpass');

    const correo = correoLogin.value.trim();
    const pass = passLogin.value.trim();

    if (correo === '' || pass === '') {
        mostrarMensaje('Todos los campos son obligatorios.', true);
        return;
    }

    if (correo === userCorr && pass === userPass) {
        localStorage.setItem('loggedIn', 'true');
        mostrarMensaje('Inicio de sesión exitoso.'); 
    } else {
        mostrarMensaje('Correo o contraseña incorrectos.', true);
    }
}

document.querySelector('.google-icon').addEventListener('click', () => {
    mostrarMensaje('Inicio con Google aún no está disponible.');
});

document.querySelector('.registro-link').addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = 'index.html';
});

btnlogin.addEventListener('click', validarLogin)
