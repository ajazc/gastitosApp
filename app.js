let db;
const request = indexedDB.open('gastosDB', 1);

request.onerror = function(event){
    console.log('Error al Abrir la Base de Datos')
};

request.onsuccess= function(event){
    db = event.target.result;
    
};

request.onupgradeneeded = function(event) {
    db = event.target.result;
    const objectStore = db.createObjectStore('gastos', { keyPath: 'id', autoIncrement: true });
    objectStore.createIndex('motivo', 'motivo', { unique: false });
    objectStore.createIndex('monto', 'monto', { unique: false });
    objectStore.createIndex('tipopago', 'tipopago', { unique: false });
    objectStore.createIndex('fecha', 'fecha', { unique: false });
};

function loadEntries() {
    const transaction = db.transaction(['gastos'], 'readonly');
    const objectStore = transaction.objectStore('gastos');
    const request = objectStore.openCursor();
    const entries = [];

    request.onsuccess = function(event) {
        const cursor = event.target.result;
        if(cursor) {
            entries.push(cursor.value);
            cursor.continue();
        } else {
            displayEntries(entries);
            sumaTodo(entries)
        }
    };

    request.onerror = function(event) {
        console.log('Error al cargar los gastos', event);
    };
}
function displayEntries(entries) {
    $('#resultados-db').empty();
    entries.forEach(entry => {
        $('#resultados-db').append(`<tr>
                    <td>${entry.id}</td>\
                    <td>${entry.motivo}</td>\
                    <td>${entry.monto}</td>\
                    <td>${entry.tipopago}</td>\
                    <td>${entry.fecha}</td>\
                    <td>
                    <button class='btn btn-danger' id='eliminar' data-id='${entry.id}'>Eliminar</button>
                    <td></tr>`);
    });
}
function sumaTodo(entries){
    $("#totales").empty();
    var total=parseFloat(0);
    console.log(entries);
    for (let i in entries){
        console.log();
        total += parseFloat(entries[i].monto);
    }
    $("#totales").html(`Total de Gatos $ ${total}`);
    
    

}