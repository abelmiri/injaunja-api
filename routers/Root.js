let express = require("express")
let path = require('path')

////////////////////////////////////// MODULES_IMPORTS_ENDED

let root_router = express.Router()

root_router.route("/")
    .get((req, res) =>
    {
        res.setHeader("Access-Control-Allow-Origin", "*")
        // res.send("Welcome to 'Inja Unja' Restful API, Happy Hacking ;)")
        res.sendFile(path.join(__dirname.slice(0, -8), `/200/index.html`))
    })

root_router.route("/*")
    .get((req, res) =>
    {
        res.setHeader("Access-Control-Allow-Origin", "*")
        res.sendFile(path.join(__dirname.slice(0, -8), `/404/index.html`))
    })

module.exports = root_router