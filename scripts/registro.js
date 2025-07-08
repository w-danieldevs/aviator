const nombre = document.getElementById('nameInput');
const correo = document.getElementById('correo');
const contra = document.getElementById('con'); 
const boton = document.getElementById('btnre');
const mensaje = document.getElementById('mensaje');


function mostarMensaje(msg, isError = false) {
    mensaje.textContent = msg;
    mensaje.style.color = isError ? 'red' : 'green';
    mensaje.style.display = 'block';
    setTimeout(() => {
        mensaje.style.display = 'none';
    }, 5000);
}


function saveData() {
    const name = nombre.value.trim();
    const corr = correo.value.trim();
    const password = contra.value.trim();

    if (name === '' || corr === '' || password === '') {
        mostarMensaje('Todos los campos son obligatorios.', true);
        return;
    }

    if (name.length < 3) {
        mostarMensaje('El nombre debe tener al menos 3 letras.', true);
        return;
    }

    if (password.length < 6) {
        mostarMensaje('La contraseña debe tener al menos 6 caracteres.', true);
        return;
    }

    localStorage.setItem('userName', name);
    localStorage.setItem('userCorr', corr);
    localStorage.setItem('userpass', password);

    mostarMensaje('Datos guardados con éxito.');

    nombre.value = '';
    correo.value = '';
    contra.value = '';
}



boton.addEventListener('click', saveData);
