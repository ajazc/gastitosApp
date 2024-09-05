let db;
const request = indexedDB.open('gastosDB', 3);

request.onerror = function (event) {
    console.log('Error al Abrir la Base de Datos')
};

request.onsuccess = function (event) {
    db = event.target.result;
    var dbVersion = request.result;
    console.log('Conectado a Version DB ' + dbVersion.version)
    $("#db-version").html(dbVersion.version)
};

request.onupgradeneeded = function (event) {
    db = event.target.result;
    if (!db.objectStoreNames.contains('gastos') || !db.objectStoreNames.contains('categorias')) {
        const objectStore = db.createObjectStore('gastos', { keyPath: 'id', autoIncrement: true });
        objectStore.createIndex('categoria','categoria', {unique:false});
        objectStore.createIndex('motivo', 'motivo', { unique: false });
        objectStore.createIndex('monto', 'monto', { unique: false });
        objectStore.createIndex('tipopago', 'tipopago', { unique: false });
        objectStore.createIndex('fecha', 'fecha', { unique: false });
        const objectStoreCat = db.createObjectStore('categorias', { keyPath: 'id', autoIncrement: true });
        objectStoreCat.createIndex('descripcion', 'descripcion', { unique: false });

    }
};
function agregaCategorias() {
    const entrada = [];
    entrada.push({ id: 1, descripcion: 'COMBUSTIBLE' });
    entrada.push({ id: 2, descripcion: 'COMIDA' });
    entrada.push({ id: 3, descripcion: 'SALIDAS' });
    entrada.push({ id: 4, descripcion: 'GASTOS AUTO' });
    entrada.push({ id: 5, descripcion: 'ROPA' });
    const transaction = db.transaction(['categorias'], 'readwrite');
    const objectStore = transaction.objectStore('categorias');
    const countRequest = objectStore.count();
    countRequest.onsuccess = function () {
        const cantidad = countRequest.result;
        if (cantidad==0) {
            const request = objectStore.add(entrada);
            request.onsuccess = function () {
                console.log('Categoria Añadida');
                DisplayCategorias(entrada)
            };
            request.onerror = function (event) {
                console.error('Error al añadir Categoria');
            };
        }
        else {
            DisplayCategorias(entrada);
        }
    }
}


function DisplayCategorias(entries) {
    $('#categorias').empty();
    entries.forEach(entry => {
        $("#categorias").append('<option value="' + entry.descripcion + '">' + entry.id +' - '+ entry.descripcion + '</option>');
    });
}
function loadEntries() {
    const transaction = db.transaction(['gastos'], 'readonly');
    const objectStore = transaction.objectStore('gastos');
    const request = objectStore.openCursor();
    const entries = [];

    request.onsuccess = function (event) {
        const cursor = event.target.result;
        if (cursor) {
            entries.push(cursor.value);
            cursor.continue();
        } else {
            displayEntries(entries);
            sumaTodo(entries)
            promedioDia(entries)

        }
    };
    request.onerror = function (event) {
        console.log('Error al cargar los gastos', event);
    };

};

function displayEntries(entries) {
    $('#resultados-db').empty();
    /*entries.sort(function(a, b){return b - a });*/
    entries.reverse();
    entries.forEach(entry => {
        var fecha = convertirFecha(entry.fecha);
        
        $('#resultados-db').append(`<tr>
                    <td>${entry.id}</td>\
                    <td>${entry.categoria}</td>\
                    <td>${entry.motivo}</td>\
                    <td>${entry.monto}</td>\
                    <td>${entry.tipopago}</td>\
                    <td>${fecha}</td>\
                    <td>
                    <button class='btn btn-danger' id='eliminar' data-id='${entry.id}'>Eliminar</button>
                    <td></tr>`);
    });
}

function sumaTodo(entries) {
    $("#totales").empty();
    var total = parseFloat(0);
    for (let i in entries) {       
        total += parseFloat(entries[i].monto);
    }
    $("#totales").html(`Total de Gatos $ ${total}`);

}
function promedioDia(entries) {
    $("#promedioDia").empty();
    var diaDelMes = new Date().getUTCDate();
    var total = parseFloat(0);
    for (let i in entries) {       
        total += parseFloat(entries[i].monto);
    }
    $("#promedioDia").html(`Promedio de Gastos diarios $ ${parseFloat(total / diaDelMes)}`);


}
function convertirFecha(fecha) {
    // Asegúrate de que la fecha esté en formato yyyy-mm-dd
    const [ano, mes, dia] = fecha.split('-');

    // Formatea la fecha en dd-mm-yyyy
    const fechaConvertida = `${dia}-${mes}-${ano}`;

    return fechaConvertida;
}