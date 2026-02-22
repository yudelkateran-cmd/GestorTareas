export class Tarea {
    constructor({ id, descripcion, estado, fechaCreacion }) {
        this.id = id;
        this.descripcion = descripcion;
        // Si no le pasamos estado, por defecto será 'Pendiente'
        this.estado = estado || 'Pendiente'; 
        // Si no tiene fecha de creación, le asignamos la fecha de hoy
        this.fechaCreacion = fechaCreacion || new Date().toLocaleDateString();
    }
}