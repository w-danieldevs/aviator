/*
API UNO: AIzaSyDy9JFq7l3Svutzf2vdM7-JW5XnrRVFgM4
API UNO: AIzaSyDHJZ7iK63WPNysUPuWsj3ThSjtCgRNmKk
API TRES: AIzaSyCtn6Qf8Tjl03-BwQPKLxNWz1aVzVMytBw
AIzaSyDXv6009Gr2NBtfjlayR89i-8f6ETSLFRo
*/
class AsistenteViajes {
  constructor() {
    this.apiGemini = 'AIzaSyCtn6Qf8Tjl03-BwQPKLxNWz1aVzVMytBw';
    this.apiRapidKey = '4976b6fdf8mshf98b3443116cb1bp108265jsn03c48a73d93b';
    this.apiRapidHost = 'travel-advisor.p.rapidapi.com';

    this.input = document.getElementById('inputDestino');
    this.boton = document.getElementById('botonBuscar');
    this.descripcion = document.getElementById('descripcion');
    this.contenedorImagenes = document.getElementById('contenedorImagenes');

    this.offset = 0; // Cuántas imágenes ya se han cargado
    this.destinoActual = ""; // Guarda el destino actual

    this.offset = 0;
    this.destinoActual = "";
    this.pagActual = 1;
    this.limite = 9;

    this.iniciarEventos();
  }

  iniciarEventos() {
    this.boton.addEventListener('click', () => this.buscar());
    this.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.buscar();
    });
  }

  async buscar() {
    const destino = this.input.value.trim();
    if (!destino) {
      this.descripcion.innerHTML = '⚠️ Ingresa un destino válido.';
      return;
    }

    this.descripcion.innerHTML = `📝 Generando descripción de <strong>${destino}</strong>...`;
    this.contenedorImagenes.innerHTML = '🖼️ Buscando imágenes...';

    try {
      const [descripcion, imagenes] = await Promise.all([
        this.generarDescripcion(destino),
        this.obtenerImagenes(destino)
      ]); this.descripcion.innerHTML = descripcion.replace(/\n/g, "<br>");
      this.offset = 0; // Reinicia el offset
      this.destinoActual = destino; // Guarda el destino buscado
      this.mostrarImagenes(imagenes, true); // true = primera vez

    } catch (err) {
      this.descripcion.innerHTML = `❌ Error: ${err.message}`;
      this.contenedorImagenes.innerHTML = '';
    }
  }

  async generarDescripcion(destino) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiGemini}`;
    const body = {
      contents: [{ role: "user", parts: [{ text: `Escribe una breve descripción en español del destino "${destino}". que toda la informacion sea en español porfavor` }] }]
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("No se pudo obtener la descripción.");
    }

    return data.candidates[0].content.parts[0].text;
  }

  async generarDescripcionLugar(nombre) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiGemini}`;
    const body = {
      contents: [{
        role: "user",
        parts: [{
          text: `Escribe una breve descripción en español "${nombre}".`
        }]
      }]
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    const texto = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return texto || 'Lugar turístico.';
  }



  async obtenerImagenes(destino) {
    const buscarUrl = `https://${this.apiRapidHost}/locations/search?query=${encodeURIComponent(destino)}`;
    const buscarRes = await fetch(buscarUrl, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': this.apiRapidKey,
        'X-RapidAPI-Host': this.apiRapidHost
      }
    });

    const buscarData = await buscarRes.json();
    const destinoId = buscarData?.data?.[0]?.result_object?.location_id;
    if (!destinoId) throw new Error("Destino no encontrado.");

    const lugaresUrl = `https://${this.apiRapidHost}/attractions/list?location_id=${destinoId}&limit=${this.limite}&offset=${this.offset}`;
    const lugaresRes = await fetch(lugaresUrl, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': this.apiRapidKey,
        'X-RapidAPI-Host': this.apiRapidHost
      }
    });

    const lugaresData = await lugaresRes.json();
    return (lugaresData.data || [])
      .filter(item => item?.photo?.images?.large?.url)
      .map(item => ({
        nombre: item.name,
        descripcion: item.description || '',
        categoria: item.category?.name || 'General',
        imagen: item.photo.images.large.url
      }));
  }

  async mostrarImagenes(lugares, primeraCarga = false) {
    if (primeraCarga) {
      this.contenedorImagenes.innerHTML = '';
      const paginadorExistente = document.getElementById("paginacion");
      if (paginadorExistente) paginadorExistente.remove();
    }

    if (!lugares.length) {
      if (primeraCarga) {
        this.contenedorImagenes.innerHTML = 'No se encontraron imágenes.';
      }
      return;
    }

    for (const lugar of lugares) {
      // Si no hay descripción, pedir una a Gemini
      if (!lugar.descripcion || lugar.descripcion.trim() === '') {
        lugar.descripcion = await this.generarDescripcionLugar(lugar.nombre);
      }

      const tarjeta = document.createElement('div');
      tarjeta.className = 'tarjeta';

      tarjeta.innerHTML = `
    <img src="${lugar.imagen}" alt="${lugar.nombre}" onerror="this.src='https://placehold.co/300x200?text=No+Disponible'"/>
    <div class="nombre">${lugar.nombre}</div>
    <div class="detalle">${lugar.descripcion}</div>
    <div class="categoria">${this.traducirCategoria(lugar.categoria)}</div>
  `;

      this.contenedorImagenes.appendChild(tarjeta);
    }


    // Crear barra de paginación si es la primera carga
    if (primeraCarga) {
      const paginacion = document.createElement('div');
      paginacion.id = "paginacion";
      paginacion.className = "paginacion";

      // Botón anterior
      const prevBtn = document.createElement('button');
      prevBtn.textContent = '<';
      prevBtn.disabled = this.pagActual === 1;
      prevBtn.onclick = () => this.cambiarPagina(this.pagActual - 1);
      paginacion.appendChild(prevBtn);

      // Botones de página (puedes mostrar más si quieres)
      for (let i = 1; i <= 5; i++) {
        const pagBtn = document.createElement('button');
        pagBtn.textContent = i;
        if (i === this.pagActual) pagBtn.classList.add("activo");
        pagBtn.onclick = () => this.cambiarPagina(i);
        paginacion.appendChild(pagBtn);
      }

      // Botón siguiente
      const nextBtn = document.createElement('button');
      nextBtn.textContent = '>';
      nextBtn.onclick = () => this.cambiarPagina(this.pagActual + 1);
      paginacion.appendChild(nextBtn);

      this.contenedorImagenes.parentElement.appendChild(paginacion);
    }
  }

  async cambiarPagina(nuevaPagina) {
    this.pagActual = nuevaPagina;
    this.offset = (nuevaPagina - 1) * this.limite;

    const nuevasImagenes = await this.obtenerImagenes(this.destinoActual);
    this.mostrarImagenes(nuevasImagenes, true);

    const seccionImagenes = document.getElementById('contenedorImagenes');
    if (seccionImagenes) {
      seccionImagenes.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

  }




  traducirCategoria(categoria) {
    const map = {
      Hotel: "Hotel",
      Restaurant: "Restaurante",
      Geographic: "Lugar geográfico",
      Attraction: "Atracción",
      General: "General"
    };
    return map[categoria] || categoria;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new AsistenteViajes();
});


