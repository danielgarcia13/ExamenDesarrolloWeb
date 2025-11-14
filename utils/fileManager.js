const fs = require('fs')
const path = require('path')

// Función para leer un archivo JSON y devolver los datos como objeto
function readJSON(fileName) {
  const filePath = path.join(__dirname, '..', 'data', fileName)
  const data = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(data)
}

// Función para escribir un objeto en un archivo JSON
function writeJSON(fileName, data) {
  const filePath = path.join(__dirname, '..', 'data', fileName)
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

module.exports = { readJSON, writeJSON }