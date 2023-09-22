const DB = require('../listas/selects');
const FUNCOES = require('../util/funcoes');
const mysql = require('mysql2');
const config = require('../../database/config');
const { DATETIME } = require('mysql2/lib/constants/types');
const conn = mysql.createPool(config);


const readXlsxFile = require('read-excel-file/node');
const multer = require('multer');


module.exports = {
    upload: (req, res) => {

        const storage = multer.diskStorage({
            destination: (req, file, cb) => {
              cb(null, __dirname + '/uploads/')
            },
            filename: (req, file, cb) => {
              cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname)
            },
          })
          const uploadFile = multer({ storage: storage })
          app.get('/', (req, res) => {
            res.sendFile(__dirname + '/index.js')
          })
          app.post('/import-excel', uploadFile.single('import-excel'), (req, res) => {
            importFileToDb(__dirname + '/uploads/' + req.file.filename)
            console.log(res)
          })
          
          function importFileToDb(exFile) {
            readXlsxFile(exFile).then((rows) => {
              rows.shift()
              database.connect((error) => {
                if (error) {
                  console.error(error)
                } else {
                  let query = 'INSERT INTO tb_sf_embalagem (semana, turno, takt_pe) VALUES ?'
                  connection.query(query, [rows], (error, response) => {
                    console.log(error || response)
                  })
                }
              })
            })
          }


    }
}