let express = require("express")
let Data = require("../data")

////////////////////////////////////// MODULES_IMPORTS_ENDED

let update_router = express.Router()

////////////////////////////////////// ROUTERS_CONFIG_ENDED

const {} = require("../functions/dynamicUpdate")

////////////////////////////////////// FUNCTION_CALLS_ENDED

update_router.route("/")
            .get((req, res) =>
            {
              res.setHeader("Access-Control-Allow-Origin", "*")
              select({id: null, response: res})
            })
module.exports = update_router