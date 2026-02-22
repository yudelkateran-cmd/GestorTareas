import { GestorTareas } from "../js/services/GestorTareas.js";

const gestor = new GestorTareas();

const formulario = document.getElementById('form-tarea');
const inputTarea = document.getElementById('nueva-tarea');
const selectEstado = document.getElementById('estado-tarea');
const listaTareas = document.getElementById('lista-tareas');
const botonSubmit = document.querySelector('#form-tarea button');

// Variable clave: nos dirá si estamos creando una tarea nueva (null) o editando una existente
let idTareaEnEdicion = null; 

async function mostrarTareas() {
    listaTareas.innerHTML = "Cargando tus tareas..."; 
    
    const tareas = await gestor.obtenerTareas();
    listaTareas.innerHTML = "";

    if(tareas.length === 0) {
        listaTareas.innerHTML = "<li>No hay tareas pendientes. ¡Buen trabajo!</li>";
        return;
    }

   tareas.forEach(tarea => {
        const li = document.createElement('li');
        
        // Evaluamos el estado para el estilo general de la tarjeta
        if (tarea.estado === 'Completada') {
            li.classList.add('tarea-completada');
        }

        //  Elegimos un color de texto según el estado 
        let colorEstado = "";
        if (tarea.estado === 'Pendiente') {
            colorEstado = "#ef210a"; 
        } else if (tarea.estado === 'En progreso') {
            colorEstado = "#e8f006"; 
        } else if (tarea.estado === 'Completada') {
            colorEstado = "#155724"; 
        }
        
        li.innerHTML = `
            <strong>${tarea.descripcion}</strong> <br>
            Estado: <span style="color: ${colorEstado}; font-weight: bold;">${tarea.estado}</span> <br> 
            <small style="color: #666;">Creada: ${tarea.fechaCreacion}</small> <br>
            <div style="margin-top: 10px;">
                <button class="btn-editar" data-id="${tarea.id}" data-desc="${tarea.descripcion}" data-estado="${tarea.estado}" style="background: #f39c12; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 3px; margin-right: 5px;">
                    Editar
                </button>
                <button class="btn-eliminar" data-id="${tarea.id}" style="background: #e74c3c; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 3px;">
                    Eliminar
                </button>
            </div>`;
        // 3. ASINCRONÍA: Contador regresivo con setInterval (Solo si no está completada)
        if (tarea.estado !== 'Completada') {
            const contadorDiv = document.createElement('div');
            contadorDiv.style.cssText = "font-size: 12px; color: #e67e22; margin-top: 5px; font-weight: bold;";
            li.appendChild(contadorDiv);

            // Simulamos que faltan 2 horas (7200 segundos) para la fecha límite
            let tiempoRestante = 7200; 

            // setInterval ejecuta esta función cada 1000 milisegundos (1 segundo)
            const intervalo = setInterval(() => {
                tiempoRestante--;
                
                // Calculamos horas, minutos y segundos
                const horas = Math.floor(tiempoRestante / 3600);
                const minutos = Math.floor((tiempoRestante % 3600) / 60);
                const segundos = tiempoRestante % 60;

                contadorDiv.innerText = `⏳ Tiempo límite: ${horas}h ${minutos}m ${segundos}s`;

                // Si llega a cero, detenemos el contador
                if (tiempoRestante <= 0 || tarea.estado === 'Completada') {
                    clearInterval(intervalo);
                    contadorDiv.innerText = "¡Tiempo agotado!";
                    contadorDiv.style.color = "red";
                }
            }, 1000);
        }    
        listaTareas.appendChild(li);
        // EVENTOS MOUSEOVER Y MOUSEOUT: Efecto de acercamiento en la tarjeta
        li.addEventListener('mouseover', () => {
            li.style.transform = "scale(1.05)"; // Se agranda un 5%
            li.style.transition = "transform 0.2s ease"; // Animación suave
        });
        
        li.addEventListener('mouseout', () => {
            li.style.transform = "scale(1)"; // Vuelve a su tamaño original
        });
    });
    // Evento para los botones ELIMINAR
    const botonesEliminar = document.querySelectorAll('.btn-eliminar');
    botonesEliminar.forEach(boton => {
        boton.addEventListener('click', async (e) => {
            const idTarea = e.target.getAttribute('data-id');
            await gestor.eliminarTarea(idTarea);
            mostrarTareas(); 
        });
    });

    // Evento para los botones EDITAR
    const botonesEditar = document.querySelectorAll('.btn-editar');
    botonesEditar.forEach(boton => {
        boton.addEventListener('click', (e) => {
            // 1. Extraemos los datos del botón que clickeamos
            const id = e.target.getAttribute('data-id');
            const desc = e.target.getAttribute('data-desc');
            const estado = e.target.getAttribute('data-estado');

            // 2. Subimos los datos al formulario de arriba
            inputTarea.value = desc;
            selectEstado.value = estado;
            idTareaEnEdicion = id; // Guardamos el ID para saber cuál estamos editando

            // 3. Cambiamos el estilo del botón principal
            botonSubmit.innerText = 'Guardar Cambios';
            botonSubmit.style.background = '#f39c12';
        });
    });
}

formulario.addEventListener('submit', async (e) => {
    e.preventDefault(); 

    const descripcion = inputTarea.value;
    const estado = selectEstado.value;

    // 1. ASINCRONÍA: Simulamos un retardo de 1 segundo al guardar
    botonSubmit.innerText = 'Guardando...';
    botonSubmit.style.opacity = '0.7';

    // Usamos setTimeout dentro de una Promesa para pausar la ejecución 1 segundo
    await new Promise(resolve => setTimeout(resolve, 1000)); 

    if (idTareaEnEdicion) {
        await gestor.actualizarTarea(idTareaEnEdicion, descripcion, estado);
        idTareaEnEdicion = null; 
    } else {
        await gestor.crearTarea(descripcion, estado);
    }

    // Restauramos el botón
    botonSubmit.innerText = 'Añadir Tarea'; 
    botonSubmit.style.opacity = '1';
    botonSubmit.style.background = '#3d6f0f';

    formulario.reset();
    mostrarTareas();

    // 2. ASINCRONÍA: Mostrar notificación y borrarla tras 2 segundos
    mostrarNotificacion("¡Tarea guardada con éxito!");
});

// Función auxiliar para la notificación flotante
function mostrarNotificacion(mensaje) {
    const noti = document.createElement('div');
    noti.innerText = mensaje;
    noti.style.cssText = "position: fixed; top: 20px; right: 20px; background: #27ae60; color: white; padding: 15px; border-radius: 5px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: opacity 0.5s;";
    
    document.body.appendChild(noti);

    // Aquí está el setTimeout exigido por la rúbrica (2000 milisegundos = 2 segundos)
    setTimeout(() => {
        noti.style.opacity = '0'; // Se desvanece
        setTimeout(() => noti.remove(), 500); // Se borra del HTML
    }, 2000);
}
// EVENTO KEYUP: Validar el texto en tiempo real
inputTarea.addEventListener('keyup', (e) => {
    // Si la tarea tiene menos de 4 letras, el borde se pone rojo, si no, verde
    if (inputTarea.value.length < 4) {
        inputTarea.style.outline = "2px solid #e74c3c"; 
    } else {
        inputTarea.style.outline = "2px solid #3d6f0f";
    }
});

mostrarTareas();