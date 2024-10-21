// Importaciones de módulos de terceros		
import express, { Router } from 'express';		
import session from 'express-session';		
import mysql from 'mysql2/promise'; // Cambiado para usar mysql2 con promesas		
import multer from 'multer';		
import bodyParser from 'body-parser';		
import fastcsv from 'fast-csv';
import csv from 'csv-parser'; // CARGAR		
import bcryptjs from 'bcryptjs';		
import Swal from 'sweetalert2';		
import fs from 'fs';		
import { readFile } from 'fs/promises';		
		
// Importaciones de archivos locales		
import { pool } from './db.js';		
import { PORT } from './config.js';		
import path from 'path';		
import { fileURLToPath } from 'url';		
//console.log('Hello, world!');

// menus 
 
// src/app.js
import { toggleSubmenu } from './menu.js';

// Configuración de rutas y variables		
const __filename = fileURLToPath(import.meta.url);		
const __dirname = path.dirname(__filename);		
const app = express();		
const upload = multer({ dest: 'uploads/' });		
		
// Configuración de sesiones		
app.use(session({		
    secret: 'tu_secreto_aqui', // Cambia esto por una cadena secreta		
    resave: false, // No volver a guardar la sesión si no ha habido cambios		
    saveUninitialized: true, // Guarda una sesión incluso si no ha sido inicializada		
    cookie: { secure: false } // Cambia a true si usas HTTPS		
}));		
		
app.use((req, res, next) => {		
    if (!req.session.loggedin) {		
        req.session.loggedin = false;		
    }		
    next();		
});		
		
// Middleware		
app.use(express.static(path.join(__dirname, '../public')));		

app.use(express.json());		
app.use(express.urlencoded({ extended: true }));		
		
// Configuración de vistas		
app.set('view engine', 'ejs');		
app.set('views', path.join(__dirname, '../views'));		
app.use(express.static(path.join(__dirname, 'src')));		
		
// Función de alerta		
function showAlert() {		
    Swal.fire({		
        title: 'Conexión Exitosa',		
        text: '!LOGIN Correcto',		
        icon: 'success',		
        showConfirmButton: false,		
        timer: 1500 // Duración en milisegundos (1500 ms = 1.5 segundos)		
    });		
}		


// Rutas		

app.get('/', async (req, res) => {		
    try {		
        res.render('inicio');		
    } catch (error) {		
        console.error('Error al renderizar la plantilla:', error);		
        res.status(500).json({ error: 'Error interno del servidor' });		
    }		
});		

// Rutas de autenticación y registro
app.get('/login', (req, res) => res.render('login'));
app.get('/menuprc', (req, res) => {
    if (req.session.loggedin) {
        const { user, name, rol } = req.session;
        res.render('menuprc', { user, name, rol });
    } else {
        res.send('Por favor, inicia sesión primero.');
    }
});

app.get('/register', (req, res) => {
    if (req.session.loggedin) {
        const { user, name } = req.session;
        res.render('register', { user, name });
    } else {
        res.send('Por favor, inicia sesión primero.');
    }
});

app.get('/menuDropdown', (req, res) => {
    if (req.session.loggedin) {
        const { user, name } = req.session;
        res.render('menuDropdown', { user, name });
    } else {
        res.send('Por favor, inicia sesión primero.');
    }
});



// ajuste const

app.get('/preguntas', (req, res)=>{
    if (req.session.loggedin) {
        const userUser = req.session.user;
        const userName = req.session.name;
        res.render('preguntas', { user: userUser, name: userName });
    } else {
        res.send('Por favor, inicia sesión primero.');
    }
})

app.get('/cargas', (req, res)=>{
    if (req.session.loggedin) {
        const userUser = req.session.user;
        const userName = req.session.name;
        res.render('cargas', { user: userUser, name: userName });
    } else {
        res.send('Por favor, inicia sesión primero.');
    }
})

app.get('/cargascol', (req, res)=>{
    if (req.session.loggedin) {
        const userUser = req.session.user;
        const userName = req.session.name;
        res.render('cargascol', { user: userUser, name: userName });
    } else {
        res.send('Por favor, inicia sesión primero.');
    }
})

app.get('/modificar', (req, res) => {
    const id = req.query.id;
    const texto = req.query.texto;
    res.render('modificar', { id, texto });
});

app.get('/eliminar', (req, res) => {
    const id = req.query.id;
    const texto = req.query.texto;
    res.render('eliminar', { id, texto });
});

app.get('/moduser', (req, res) => {
    const user = req.query.user;
    const name = req.query.name;
    const rol = req.query.rol;
    const estado = req.query.estado;
    res.render('moduser', { user, name, rol, estado });
});

app.get('/eliuser', (req, res) => {
    const user = req.query.user;
    const name = req.query.name;
    res.render('eliuser', { user, name });
});

app.get('/preguntasopc', (req, res) => {
    if (req.session.loggedin) {
        const userUser = req.session.user;
        const userName = req.session.name;
        const id = req.query.id; // Obtén el id
        const respuesta = req.query.respuesta; // Obtén la respuesta
        res.render('preguntasopc', { id:id, respuesta:respuesta,user: userUser, name: userName });
    } else {
        res.send('Por favor, inicia sesión primero.');
    }
});

app.get('/modopc', (req, res) => {
    const idvlrprg = req.query.idvlrprg; // variable ej> idvlrprg, que se debe usar en modopc idprg
    const respuesta = req.query.respuesta;
    res.render('modopc', { idvlrprg, respuesta});

});

app.get('/eliopc', (req, res) => {
    const idvlrprg = req.query.idvlrprg; // variable ej> idvlrprg, que se debe usar en modopc idprg
    const respuesta = req.query.respuesta;
    res.render('eliopc', { idvlrprg, respuesta});
});

// Rutas para selección y opciones

app.get('/seleccion', async (req, res) => {
    try {
        const [rows] = await pool.execute("SELECT * FROM preguntas");
        res.render('opc1', { data: rows });
    } catch (error) {
        res.status(500).send('Error conectando a la base de datos.');
    }
});

app.get('/opcbtn', async (req, res) => {
    try {
        const [rows] = await pool.execute("select * from preguntas");
        // Verifica si se están obteniendo los datos correctamente
        res.render('opcbtn', { data: rows });
    } catch (error) {
        console.error('Error conectando a la base de datos:', error);
        res.status(500).send('Error conectando a la base de datos.');
    }
});

app.get('/opc1', async (req, res) => {
    try {
        if (req.session.loggedin) {
            const userUser = req.session.user;
            const userName = req.session.name;
            const [rows] = await pool.execute("select a.id as idp,a.texto,a.estado,a.activo as prgact,b.id,b.respuesta,b.estado from preguntas a inner join pgtaresp b on a.id=b.idprg where a.estado=1");
            res.render('opc1', { preguntas: rows, user: userUser, name: userName });
        } else {
            res.send('Por favor, inicia sesión primero.');
        }
    } catch (error) {
        res.status(500).send('Error conectando a la base de datos.');
    }
});

app.get('/opc2', async (req, res) => {
    try {
        const [rows] = await pool.execute("select * from preguntas");
        res.render('opc2', { data: rows });
    } catch (error) {
        res.status(500).send('Error conectando a la base de datos.');
    }
});

app.get('/ingpreguntas', async (req, res) => {
    try {
        const tableName = "preguntas";
        const [rows] = await pool.execute(`select * from ${tableName}`);
        if (req.session.loggedin) {
            const userUser = req.session.user;
            const userName = req.session.name;
            res.render('ingpreguntas', { data: rows, user: userUser, name: userName });

        } else {
            res.send('Por favor, inicia sesión primero.');
        }
    } catch (error) {
                console.error('Error conectando a la base de datos....????:', error);
                res.status(500).send('Error conectando a la base de datos.?????');
            }
    });

// Usuarios

app.get('/usuarios', async (req, res) => {
    try {
        const tableName = "users";
        const [rows] = await pool.execute(`select * from ${tableName}`);
        if (req.session.loggedin) {
            const userUser = req.session.user;
            const userName = req.session.name;
            res.render('usuarios', { data: rows, user: userUser, name: userName });

        } else {
            res.send('Por favor, inicia sesión primero.');
        }
    } catch (error) {
                console.error('Error conectando a la base de datos....????:', error);
                res.status(500).send('Error conectando a la base de datos.?????');
            }
    });

// Graficos

app.get('/bar', async (req, res) => {
    try {
        if (req.session.loggedin) {
            // Ejecuta la consulta SQL
            const [datos] = await pool.execute("SELECT respuesta, COUNT(*) AS total FROM respusers GROUP BY respuesta order by total desc");

            // Procesa los resultados para obtener las etiquetas y valores
            const labels = [];
            const dataValues = [];

            // Cambié 'results' por 'datos' porque 'datos' es el resultado de la consulta
            datos.forEach(row => {
                labels.push(row.respuesta);  // Añade la respuesta como una etiqueta
                dataValues.push(row.total);  // Añade el conteo de respuestas como un valor
            });

            // Pasa estos datos a la vista
            res.render('bar', {
                labels: labels, // No es necesario usar JSON.stringify aquí
                dataValues: dataValues, // No es necesario usar JSON.stringify aquí
            });
        } else {
            res.send('Por favor, inicia sesión primero.');
        }
    } catch (error) {
        console.error('Error al ejecutar la consulta:', error);  // Imprime el error en la consola
        res.status(500).send('Error conectando a la base de datos.');
    }
});


app.get('/pie', async (req, res)=>{
    try {
        if (req.session.loggedin) {
            // Ejecuta la consulta SQL
            const [datos] = await pool.execute("SELECT respuesta, COUNT(*) AS total FROM respusers GROUP BY respuesta order by total desc");

            // Procesa los resultados para obtener las etiquetas y valores
            const labels = [];
            const dataValues = [];

            // Cambié 'results' por 'datos' porque 'datos' es el resultado de la consulta
            datos.forEach(row => {
                labels.push(row.respuesta);  // Añade la respuesta como una etiqueta
                dataValues.push(row.total);  // Añade el conteo de respuestas como un valor
            });

            // Pasa estos datos a la vista
            res.render('pie', {
                labels: labels, // No es necesario usar JSON.stringify aquí
                dataValues: dataValues, // No es necesario usar JSON.stringify aquí
            });
        } else {
            res.send('Por favor, inicia sesión primero.');
        }
    } catch (error) {
        console.error('Error al ejecutar la consulta:', error);  // Imprime el error en la consola
        res.status(500).send('Error conectando a la base de datos.');
    }
})

// Opciones
    
app.get('/opciones', async(req, res) => {
    try {
        if (req.session.loggedin) {
            const userUser = req.session.user;
            const userName = req.session.name;
            const id = req.query.id;
            const texto = req.query.texto;
            const [rows] = await pool.execute("select * from pgtaresp where idprg = ?", [id]);
            res.render('opciones', { id, texto, data: rows, user: userUser, name: userName });
        } else {
            res.send('Por favor, inicia sesión primero.');
        }
    } catch (error) {
        console.error('Error conectando a la base de datos....????:', error);
        res.status(500).send('Error conectando a la base de datos.?????');
        }
    });

// crgas CSV

app.get('/cargascsv', (req, res) => {
    const id = req.query.id;
    const texto = req.query.texto;
    res.render('cargascsv', { id, texto });
});

// 11. Autenticacion 

app.post('/auth', async (req, res) => {
    const { user, pass } = req.body;
    const tableName = 'users';
    const [rows] = await pool.execute(`SELECT * FROM ${tableName} WHERE user = ?`, [user]);
    
    if (rows.length === 0) {
        return res.json({ status: 'error', message: 'Usuario no encontrado' });
    }

    const userRecord = rows[0];
    const passwordMatch = await bcryptjs.compare(pass, userRecord.pass);
    
    if (!passwordMatch) {
        return res.json({ status: 'error', message: 'Contraseña incorrecta' });
    }

    req.session.loggedin = true;
    req.session.user = userRecord.user;
    req.session.name = userRecord.name;
    req.session.rol = userRecord.rol;

    return res.json({ status: 'success', message: '!LOGIN Correcto!' });
});

// preguntas - post

app.post('/preguntasreg', async (req, res) => {
    try {
        const { pgtas } = req.body;
        const tableName = "preguntas";
        const [rows] = await pool.execute(`SELECT * FROM ${tableName} WHERE texto = ?`, [pgtas]);
        if (rows.length > 0) {
            return res.json({ status: 'error', message: 'Pregunta ya Existe' });
        }
        const date = new Date();
        await pool.execute(`INSERT INTO ${tableName} (texto, estado, activo, fechacreacion) VALUES (?, ?, ?, ?)`, [pgtas, 0, 0, date]);
        res.json({ status: 'success', message: '¡Registrado correctamente!' });
    } catch (error) {
        res.json({ status: 'success', message: '¡Registro de Preguta NO Exitoso!' });
    }
});

// preguntas - post

app.post('/preguntasregopc', async (req, res) => {
    try {
        const user = req.body.user;
        const name = req.body.name;        
        const pgtas = req.body.pgtas;
        // Log para depuración
        const tableName = "pgtaresp";
        const [rows] = await pool.execute(`select * FROM ${tableName} WHERE texto = ?`, [pgtas]);
        if (rows.length > 0) {
            return res.json({
                status: 'error',
                title: 'Error',
                message: 'Pregunta ya Existe'
            });
        }

        const date = new Date();
        const estado = 0; // Ejemplo de estado
        await pool.execute(`INSERT INTO ${tableName} (texto, estado, fechacreacion) VALUES (?, ?, ?)`, [pgtas, estado, date]);
        res.json({
            status: 'success',
            title: 'Registro Exitoso',
            message: '¡Registrado correctamente!'

        });
    } catch (error) {
        res.json({
            status: 'success',
            title: 'Registro de Preguta NO Exitoso',
            message: '¡Error en el servidor! BD'
        });

    }
});

// modifica preguntas - post
app.post('/preguntasmod', async (req, res) => {
    try {
        const ids = req.body.ids;
        const pgtas = req.body.pgtas;
        const tableName = "preguntas";
        // validar si existe
        const [rows] = await pool.execute(`SELECT * FROM ${tableName} WHERE texto = ? `, [pgtas]);
        if (rows.length > 0) {
            return res.json({
                status: 'error',
                message: 'Opción ya existe'
            });
        }

        // Insertar nuevo usuario
        await pool.execute(`UPDATE ${tableName} SET texto = ? WHERE id = ?`, [pgtas, ids]);

        res.json({
            status: 'success',
            title: 'Actualizacion Exitosa',
            message: '¡Registrado correctamente!'
        });
    } catch (error) {
        res.json({
            status: 'success',
            title: 'Registro de Preguta NO Exitoso',
            message: '¡Error en el servidor! BD'
        });
    }
});

// modificacion opciones - post
app.post('/preguntasmodopc', async (req, res) => {
    try {
        const idp = req.body.idp;
        const id = req.body.id;
        const pgtas = req.body.pgtas;
        const tableName = "pgtaresp";
        //
        const [rows] = await pool.execute(`SELECT * FROM ${tableName} WHERE respuesta = ? AND idprg = ?`, [pgtas, idp]);
        if (rows.length > 0) {
            return res.json({
                status: 'error',
                message: 'Opción ya existe'
            });
        }
        
        // Insertar nuevo registro
        await pool.execute(`UPDATE ${tableName} SET respuesta = ? WHERE id = ?`, [pgtas, id]);
        res.json({
            status: 'success',
            title: 'Actualizacion Exitosa',
            message: '¡Registrado correctamente!'
        });
    } catch (error) {
        res.json({
            status: 'success',
            title: 'Registro de Preguta NO Exitoso',
            message: '¡Error en el servidor! BD'
        });
    }
});

/* Eliminar opciones pregunta */

app.post('/preguntaseliopc', async (req, res) => {
    try {
        const id = req.body.idvlrprg;
        const pgtas = req.body.pgtas;
        // Log para depuración

        const [rows] =  await pool.execute('delete from pgtaresp WHERE id = ?', [id]);
        return res.json({
            status: 'success',
            title: 'Borrado Exitoso.',
            message: '¡Registro Exitoso! BD'
        });
    } catch (error) {
        res.json({
            status: 'error',
            title: 'Borrado de Preguta NO Exitoso',
            message: `Error: ${error.message}`
        });
    }
});

// register - post
app.post('/register', async (req, res) => {
    try {
        const rz = '1';
        const id_rz = 'qwe';

        const { user, name, rol, pass } = req.body;

        if (!user || !name || !rol || !pass) {
            return res.status(400).json({ status: 'error', message: 'Todos los campos son obligatorios' });
        }

        const [rows] = await pool.execute('SELECT * FROM users WHERE user = ?', [user]);
        if (rows.length > 0) {
            return res.status(400).json({ status: 'error', message: 'Usuario ya Existe' });
        }

        // Insertar nuevo usuario
        const passwordHash = await bcryptjs.hash(pass, 8);
        await pool.execute('INSERT INTO users (rz, id_rz, user, name, rol, pass, estado) VALUES (?, ?, ?, ?, ?, ?, ?)', [rz, id_rz, user, name, rol, passwordHash, null]);
        res.json({ status: 'success', message: '¡Usuario registrado correctamente!' });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ status: 'error', message: 'Error en el servidor' });
    }
});

/* Eliminar pregunta */

app.post('/preguntaseli', async (req, res) => {
    try {
        const ids = req.body.ids;
        const pgtas = req.body.pgtas;

        // Log para depuración

        const [rows] =  await pool.execute('delete from preguntas WHERE id = ?', [ids]);
        return res.json({
            status: 'success',
            title: 'Borrado Exitoso.',
            message: '¡Registro Exitoso! BD'
        });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED') {
            return res.json({
                status: 'error',
                title: 'Borrado No Exitoso',
                message: 'No se puede eliminar la pregunta porque tiene dependencia de OPCIONES.'
            });
        }
        // Para cualquier otro tipo de error
        return res.json({
            status: 'error',
            title: 'Error de Borrado',
            message: `Error: ${error.code}`
        });
    }
});

/* voto opc1 pgtaresp pgtaresp pgtaresp */   
app.post('/procesarseleccion', async (req, res) => {
    try {
        const userUser = req.session.user;
        const userName = req.session.name;
        const selectedValue = req.body.preguntas; // Obtén el valor seleccionado
        const [id, texto, idp, respuesta] = selectedValue.split('|');

        // EVALUA SI YA VOTO
        const pgtas = req.body.pgtas;
        // Log para depuración

        // SELECT      
        const tablePtas = "respusers";
        const [rows] = await pool.execute(`SELECT respuesta FROM ${tablePtas} WHERE user = ? and idprg = ?`, [userUser, id]);
        
        if (rows.length > 0) {
            const respuesta = rows[0].respuesta;  // Obtenemos la primera fila y el campo "pregunta"
            return res.json({
                status: 'info',
                title: `ya No puede votar`,
                message: `Su Voto Registrado es : [ ${respuesta} ]`
            });
        } else {
            // insert de respuesta
            const tableName = "respusers";
            const date = new Date();
            const estado = 0; // Ejemplo de estado
            await pool.execute(`INSERT INTO ${tableName} (user, idprg, pregunta, idpres, respuesta) VALUES (?, ?, ?, ?, ?)`, [userUser, id, texto, idp, respuesta]);
            return res.json({
                status: 'success',
                title: 'Voto Exitoso.',
                message: '¡Registro Exitoso! BD'
            });
        }
    } catch (error) {
        res.json({
            status: 'error',
            title: 'Grabar Respuesta NO Exitoso',
            message: `Error: ${error.message}`
        });
    }
});

// opc 2 
app.post('/procesar-seleccion', async (req, res) => {
        try {
            const userUser = req.session.user;
            const userName = req.session.name;
            const selectedValue = req.body.pregunta; // Obtén el valor seleccionado
            const selectActivo = parseInt(req.body.selactivo, 10); // Convierte a entero

            // Actualiza el estado y activo a 0 para todas las preguntas
            await pool.execute('UPDATE preguntas SET estado = 0, activo = 0');

            // Verifica si hay valores seleccionados
            if (selectedValue && selectedValue.length > 0) {
                for (const id of selectedValue) {
                    // Actualiza el estado a 1 para los ids seleccionados
                    await pool.execute('UPDATE preguntas SET estado = 1 WHERE id = ?', [id]);
                    
                    // Actualiza el activo según selectActivo (asumiendo que es un valor por cada id)
                    await pool.execute('UPDATE preguntas SET activo = ? WHERE id = ?', [selectActivo, id]);
                }
            } else {
                console.log('Error update procesar-seleccion');
            }

            return res.json({
                status: 'success',
                title: 'Seleccion OK',
                message: '¡Registro Exitoso! BD'
            });   
        } catch (error) {
            res.json({
                status: 'error',
                title: 'Grabar Seleccion Pregunta NO Exitoso',
                message: `Error: ${error.message}`
            });
        }
    });
    
    
// modifica usuarios - post

app.post('/usuariomod', async (req, res) => {
    try {
        const user = req.body.user;
        const name = req.body.name;
        const rol = req.body.rol;
        const estado = req.body.estado;

        // Insertar nuevo usuario
        await pool.execute('UPDATE users SET name = ?, rol = ? WHERE (estado IS NULL OR estado = 0) AND user = ?', [name, rol, user]);
        if (estado !== '1') {
            return res.json({
                status: 'success',
                title: 'Actualizacion Exitosa',
                message: '¡Registrado correctamente!'
            });
        } else {
            await pool.execute('UPDATE users SET name = ? WHERE user = ?', [name, user]);
            return res.json({
                status: 'question',
                title: 'Actualiza Nombre Usuario',
                message: 'Usuario Administrador Principal, solo permite modificar el Nombre'
            });
        }
    } catch (error) {
        res.json({
            status: 'success',
            title: 'Registro de Preguta NO Exitoso...',
            message: '¡Error en el servidor! BD'
        });
    }
});

/* Eliminar usuarios */

app.post('/usuarioeli', async (req, res) => {
    try {
        const ids = req.body.ids;

        // Log para depuración delete

        const [result] = await pool.execute('DELETE FROM users WHERE (estado IS NULL OR estado = 0) AND user = ?', [ids]);
        if (result.affectedRows > 0) {
            // El registro fue eliminado con éxito
            return res.json({
                status: 'success',
                title: 'Eliminado',
                message: 'El usuario ha sido eliminado correctamente.'
            });
        } else {
            // No se eliminó ningún registro
            return res.json({
                status: 'error',
                title: 'Error',
                message: 'No se pudo eliminar el usuario. Es posible que el usuario sea Administrador Principal o No exista.'
            });
        }
    } catch (error) {
        res.json({
            status: 'error',
            title: 'Borrado de Usuario NO Exitoso',
            message: `Error: ${error.message}`
        });
    }
});


 // opciones de preguntas - post   -  createPool

 app.post('/opcionesreg', async (req, res) => {
    const { id, respuesta, pgtas } = req.body;
    try {
        const tableName = "pgtaresp";
        const [rows] = await pool.execute(`SELECT * FROM ${tableName} WHERE idprg= ? and respuesta = ?`, [id, pgtas]);
        if (rows.length > 0) {
            return res.json({
                status: 'error',
                message: 'Opción ya existe'
            });
        }
        const date = new Date();
        const estado = 0; // Ejemplo de estado
        await pool.execute(`INSERT INTO ${tableName} (idprg, pregunta, respuesta, fecha, estado) VALUES (?, ?, ?, ?, ?)`, [id, respuesta, pgtas, date, estado]);
        res.json({
            status: 'success',
            title: 'Registro Exitoso',
            message: '¡Registrado correctamente!'
        });
    } catch (error) {
        console.error('Error en /opcionesreg:', error);
        res.status(500).json({
            status: 'error',
            title: 'Error en el servidor',
            message: '¡Error en el servidor! BD'
        });
    }
});

// Ruta para procesar archivos CSV
async function processCSV(filePath) {
    const connection = await mysql.createConnection(dbConfig);
    try {
        await connection.execute(`CREATE TABLE IF NOT EXISTS my_table (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255),
            age INT
        )`);

        const data = [];
        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (row) => data.push(row))
            .on('end', async () => {
                for (const { name, age } of data) {
                    await connection.execute('INSERT INTO my_table (name, age) VALUES (?, ?)', [name, age]);
                }
            });
    } catch (error) {
        console.error('Error procesando CSV:', error);
    } finally {
        await connection.end();
    }
}

// Ruta para guardar datos en la tabla
app.post('/save-table-data2', async (req, res) => {
    const data = req.body;

    if (!Array.isArray(data) || data.length === 0) {
        return res.status(400).json({ message: 'No data provided' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        await connection.execute('DELETE FROM my_tableCol2');
        for (const { user, name, rol } of data) {
            if (user && name && rol) {
                await connection.execute('INSERT INTO my_tableCol2 (user, name, rol) VALUES (?, ?, ?)', [user, name, rol]);
            }
        }

        // Llamada al procedimiento almacenado
        await connection.execute('CALL SP_Valida_ImportarColumnas()'); // Reemplaza 'nombre_del_procedimiento_almacenado' con el nombre real de tu SP
        // Llamar a la función para ejecutar el proceso
        updatePasswords();

        await connection.commit();
        res.json({
            status: 'success',
            title: 'Registro Exitoso',
            message: '¡Registrado correctamente!'
        });
    } catch (error) {
        console.error('Error saving data:', error);
        await connection.rollback();
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        connection.release();
    }
});


// Ruta para guardar datos en la tabla
app.post('/save-table-data', async (req, res) => {
    const data = req.body;
    console.log('paso 1');
    if (!Array.isArray(data) || data.length === 0) {
        return res.status(400).json({ message: 'No data provided' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        await connection.execute('DELETE FROM my_table2');

        for (const { codigo } of data) {
            if (codigo) {
                await connection.execute('INSERT INTO my_table2 (codigo) VALUES (?)', [codigo]);
            }
        }
        console.log('ingresa');
        // Llamada al procedimiento almacenado
        await connection.execute('CALL SP_Valida_ImportarColumnas()');
        console.log('actualiza')
        // Llamar a la función para ejecutar el proceso
        await updatePasswords();  // Asegúrate de usar await aquí

        await connection.commit();
        res.json({
            status: 'success',
            title: 'Registro Exitoso',
            message: '¡Registrado correctamente!'
        });
    } catch (error) {
        console.error('Error saving data:', error);
        await connection.rollback();
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        connection.release();
    }
});

// Función para generar y actualizar la contraseña en la tabla
async function updatePasswords() {
    try {
        const [rows] = await pool.execute('SELECT Id, user FROM my_tableCol2');
        if (rows.length === 0) {
            console.log('No hay usuarios para actualizar.');
            return; // Salir si no hay registros
        }
        for (const row of rows) {
            try {
                const transformedPassword = `${row.user.charAt(0).toUpperCase()}${row.user.slice(1)}24%`;
                const hashedPassword = await bcryptjs.hash(transformedPassword, 8);
                await pool.execute('UPDATE my_tableCol2 SET pass = ? WHERE user = ?', [hashedPassword, row.user]);
            } catch (updateError) {
                console.error(`Error actualizando la contraseña para el usuario ${row.user}:`, updateError);
            }
        }
    } catch (error) {
        console.error('Error en updatePasswords:', error);
    }
}
  
// ejecutar

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

/// CERRAR CONEXIONES :  connection.release(); //