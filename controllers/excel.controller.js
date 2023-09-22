const db = require("../models");
const Excel = db.tutorials;
const readXlsxFile = require("read-excel-file/node");

const upload = async (req, res) => {
    try {
      if (req.file == undefined) {
        return res.status(400).send("Por favor envie um arquivo excel!");
      }

      let path = "/uploads/" + req.file.filename;
      readXlsxFile(path).then((rows) => {
        // skip header
        rows.shift();
        let tutorials = [];
        rows.forEach((row) => {
          let tutorial = {
            cod_ordem: row[1],
            empresa: row[2],
            canal_dist: row[3],
            setor_ativ: row[4],
          };
          tutorials.push(tutorial);
        });
        Tutorial.bulkCreate(tutorials)
          .then(() => {
            res.status(200).send({
              message: "Uploaded the file successfully: " + req.file.originalname,
            });
          })
          .catch((error) => {
            res.status(500).send({
              message: "Fail to import data into database!",
              error: error.message,
            });
          });
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Could not upload the file: " + req.file.originalname,
      });
    }
  };

  const getTutorials = async (req, res) => {
    Tutorial.findAll()
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving tutorials.",
        });
      });
  };


  module.exports = {
    upload,
    getTutorials,
  };