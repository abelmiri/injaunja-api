let express = require("express")
let path = require('path')

////////////////////////////////////// MODULES_IMPORTS_ENDED

let files_router = express.Router()

files_router.route("/:folder/:file")
    .get((req, res) =>
    {
        /** @namespace req.params.folder */
        res.setHeader("Access-Control-Allow-Origin", "*")
        res.sendFile(path.join(__dirname.slice(0, -8), `/files/${req.params.folder}/${req.params.file}`))
    })

module.exports = files_router