//export const port = 3000

// se debe validar si estamos recibiendo variable de Entorno en la nuebe

export const PORT = process.env.PORT || 3008

// si se tiene variable de entorno se toma PORT, sino 3000

export const DB_HOST = process.env.DB_HOST || 'localhost' //'192.168.1.9' //'192.168.56.1' // 
export const DB_USER = process.env.DB_USER || 'root'
export const DB_PASSWORD = process.env.DB_PASSWORD || '123'
<<<<<<< HEAD
export const DB_NAME = process.env.DB_NAME || 'inventarios'
=======
<<<<<<< HEAD
<<<<<<< HEAD
export const DB_NAME = process.env.DB_NAME || 'inventarios'
=======
export const DB_NAME = process.env.DB_NAME || 'sarlaft'
>>>>>>> 2bae43f8696704fd763c7f647349185517cde258
=======
export const DB_NAME = process.env.DB_NAME || 'inventarios'
>>>>>>> 8974dc721e5edded72c523d8bf4608ec8eed8ae2
>>>>>>> 3aef0324390aef69e9cd52071cad933f3119878a
export const DB_PORT = process.env.DB_PORT || '3306'