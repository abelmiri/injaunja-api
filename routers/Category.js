let express = require("express")
let Data = require("../data")

////////////////////////////////////// MODULES_IMPORTS_ENDED

let category_router = express.Router()

////////////////////////////////////// ROUTERS_CONFIG_ENDED

const {create, deleting, update, select, selectByParent, selectLastOnes, selectByString} = require("../functions/category")

////////////////////////////////////// FUNCTION_CALLS_ENDED

category_router.route("/")
    .get((req, res) =>
    {
        res.setHeader("Access-Control-Allow-Origin", "*")
        select({id: null, response: res})
    })

category_router.route("/search/:string")
    .get((req, res) =>
    {
        res.setHeader("Access-Control-Allow-Origin", "*")
        selectByString({string: req.params.string, response: res})
    })

category_router.route("/last/:limit")
    .get((req, res) =>
    {
        res.setHeader("Access-Control-Allow-Origin", "*")
        if (!isNaN(req.params.limit))
            selectLastOnes({limit: req.params.limit, response: res})
        else res.send({state: -1, log: `GET_CATEGORY_LIMIT_${req.params.limit}_IS_NOT_NUMBER`})
    })

category_router.route("/parent_id/:id")
    .get((req, res) =>
    {
        res.setHeader("Access-Control-Allow-Origin", "*")
        if (!isNaN(req.params.id))
            selectByParent({parent_id: req.params.id, response: res})
        else res.send({state: -1, log: `GET_CATEGORY_PARENT_${req.params.id}_IS_NOT_NUMBER`})
    })

category_router.route("/create")
    .post((req, res) =>
    {
        res.setHeader("Access-Control-Allow-Origin", "*")

        let data = {...req.body}
        let header = {...req.headers}
        let picture = req.files ? {...req.files.picture} : null
        let svg = req.files ? {...req.files.svg} : null

        if (header.auth !== undefined)
        {
            if (header.auth === Data.auth)
            {
                if (data.name !== undefined && data.description !== undefined && data.selectable !== undefined && data.parent_id !== undefined)
                {
                    create({
                        name: data.name,
                        description: data.description,
                        selectable: data.selectable,
                        parent_id: data.parent_id,
                        picture: picture,
                        svg: svg,
                        response: res,
                    })
                }
                else res.send({state: -3, log: "CREATE_CATEGORY_PARAMETERS_UNDEFINED", form: data})
            }
            else res.send({state: -2, log: "CREATE_CATEGORY_INCORRECT_HEADER"})
        }
        else res.send({state: -1, log: "CREATE_CATEGORY_PERMISSION_DENIED"})
    })

category_router.route("/delete")
    .post((req, res) =>
    {
        res.setHeader("Access-Control-Allow-Origin", "*")
        let data = {...req.body}
        let header = {...req.headers}

        if (header.auth !== undefined)
        {
            header.auth === Data.auth ?
                data.id !== undefined ?
                    deleting({id: data.id, response: res}) :
                    res.send({state: -3, log: "DELETE_CATEGORY_PARAMETERS_UNDEFINED", form: data}) :
                res.send({state: -2, log: "DELETE_CATEGORY_INCORRECT_HEADER"})
        }
        else res.send({state: -1, log: "DELETE_CATEGORY_PERMISSION_DENIED"})
    })

category_router.route("/update")
    .post((req, res) =>
    {
        res.setHeader("Access-Control-Allow-Origin", "*")
        let data = {...req.body}
        let header = {...req.headers}
        let picture = req.files ? {...req.files.picture} : null
        let svg = req.files ? {...req.files.svg} : null


        if (header.auth !== undefined)
        {
            if (header.auth === Data.auth)
            {
                if (data.id !== undefined)
                {
                    update({
                        id: data.id,
                        name: data.name,
                        description: data.description,
                        selectable: data.selectable,
                        picture: picture,
                        svg: svg,
                        response: res,
                    })
                }
                else res.send({state: -3, log: "UPDATE_CATEGORY_PARAMETERS_UNDEFINED", form: data})
            }
            else res.send({state: -2, log: "UPDATE_CATEGORY_INCORRECT_HEADER"})
        }
        else res.send({state: -1, log: "UPDATE_CATEGORY_PERMISSION_DENIED"})
    })

category_router.route("/:id")
    .get((req, res) =>
    {
        res.setHeader("Access-Control-Allow-Origin", "*")
        if (!isNaN(req.params.id))
            select({id: req.params.id, response: res})
        else if (req.params.id === "get_by_subscribes")
            select({id: -1, response: res})
        else res.send({state: -1, log: `GET_CATEGORY_${req.params.id}_IS_NOT_NUMBER`})
    })


module.exports = category_router