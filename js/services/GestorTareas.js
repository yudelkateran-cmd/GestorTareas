import { Tarea } from "../models/tarea.js";

export class GestorTareas {
    constructor() {
        //Reciclo base de datos... 
        this.apiUrl = "https://699701ab7d17864365760706.mockapi.io/habitos";
    }

    async obtenerTareas() {
        try {
            const respuesta = await fetch(this.apiUrl);
            const data = await respuesta.json();
            console.log("Tareas obtenidas con éxito");
            // Convierte los datos de la API en objetos de tipo Tarea
            return data.map(t => new Tarea(t));
        } catch (error) {
            console.error(`Error al obtener tareas: ${error}`);
            return [];
        }
    }

async crearTarea(descripcion, estado) {
        // 1. Creamos un objeto con los datos básicos
        const datosBase = { descripcion, estado };
        
        // 2. Usamos el operador SPREAD (...) para fusionar los datos base con la fecha
        const nuevaTarea = { 
            ...datosBase, 
            fechaCreacion: new Date().toLocaleDateString() 
        };

        await fetch(this.apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevaTarea)
        });
    }

    async actualizarEstado(id, nuevoEstado) {
        // Cambiamos el estado (de 'Pendiente' a 'Completada')
        await fetch(`${this.apiUrl}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado })
        });
    }

    async eliminarTarea(id) {
        // Elimina la tarea por su ID
        await fetch(`${this.apiUrl}/${id}`, {
            method: 'DELETE'
        });
    }
    async actualizarTarea(id, nuevaDescripcion, nuevoEstado) {
        // Le enviamos a MockAPI los nuevos datos usando el método PUT
        await fetch(`${this.apiUrl}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                descripcion: nuevaDescripcion, 
                estado: nuevoEstado 
            })
        });
    }
}