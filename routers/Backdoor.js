let express = require("express")
const Data = require("../data")

////////////////////////////////////// MODULES_IMPORTS_ENDED

let backdoor_router = express.Router()

////////////////////////////////////// ROUTERS_CONFIG_ENDED

backdoor_router.route("/")
    .post((req, res) =>
    {
        res.send({state: -1, log: "INCORRECT_POST_ADDRESS"})
    })
    .get((req, res) =>
    {
        res.send({state: -1, log: "INCORRECT_GET_ADDRESS"})
    })

for (let i = 1; i <= 5; i++)
{
    backdoor_router.route("/" + i)
        .post((req, res) =>
        {
            res.setHeader("Access-Control-Allow-Origin", "*")
            let data = {...req.body}
            switch (i)
            {
                case 1:
                    data.authentication === Data.sign ? res.send(true) : res.send(false)
                    break
                case 2:
                    data.authentication === Data.sign ? res.send(true) : res.send(false)
                    break
                case 3:
                    data.authentication === Data.sign ? res.send(true) : res.send(false)
                    break
                case 4:
                    data.authentication === Data.sign ? res.send(true) : res.send(false)
                    break
                case 5:
                    data.authentication === Data.sign ? res.send(true) : res.send(false)
                    break
                default:
                    res.send(false)
            }
        })
}
backdoor_router.route("/:id")
    .get((req, res) =>
    {
        res.send({state: -1, log: "INCORRECT_GET_ADDRESS_FOR_" + req.params.id})
    })
    .post((req, res) =>
    {
        res.send({state: -1, log: "INCORRECT_POST_ADDRESS_FOR_" + req.params.id})
    })

module.exports = backdoor_router