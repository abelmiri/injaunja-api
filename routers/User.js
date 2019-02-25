let express = require("express")
let Data = require("../data")

////////////////////////////////////// MODULES_IMPORTS_ENDED

let user_router = express.Router()

////////////////////////////////////// ROUTERS_CONFIG_ENDED

const {login, admin_login, sign_up, update, delete_user, select, select_admin} = require("../functions/authentication")
const {add_category, delete_category, get_favorite} = require("../functions/user")

////////////////////////////////////// FUNCTION_CALLS_ENDED

user_router.route("/")
    .get((req, res) =>
    {
        res.setHeader("Access-Control-Allow-Origin", "*")
        select({id: null, response: res})
    })

user_router.route("/admin/")
    .get((req, res) =>
    {
        res.setHeader("Access-Control-Allow-Origin", "*")

        let header = {...req.headers}

        if (header.auth !== undefined)
        {
            if (header.auth === Data.auth)
            {
                select_admin({id: null, response: res})
            } else res.send({state: -2, log: "GET_USER_INCORRECT_HEADER"})
        } else res.send({state: -1, log: "GET_USER_PERMISSION_DENIED"})
    })

user_router.route("/admin/:id")
    .get((req, res) =>
    {
        res.setHeader("Access-Control-Allow-Origin", "*")

        let header = {...req.headers}

        if (header.auth !== undefined)
        {
            if (header.auth === Data.auth)
            {
                if (!isNaN(req.params.id))
                    select_admin({id: req.params.id, response: res})
                else res.send({state: -1, log: `GET_USER_${req.params.id}_IS_NOT_NUMBER`})
            } else res.send({state: -2, log: "GET_USER_INCORRECT_HEADER"})
        } else res.send({state: -1, log: "GET_USER_PERMISSION_DENIED"})
    })

user_router.route("/login")
    .post((req, res) =>
    {
        res.setHeader("Access-Control-Allow-Origin", "*")
        let data = {...req.body}

        data.phone ?
            login({
                phone: data.phone,
                response: res
            }) : res.send({state: -1, log: "LOGIN_PARAMETERS_UNDEFINED"})
    })

user_router.route("/login/admin")
    .post((req, res) =>
    {
        res.setHeader("Access-Control-Allow-Origin", "*")
        let data = {...req.body}

        data.phone && data.username ?
            admin_login({
                phone: data.phone,
                username: data.username,
                response: res
            }) : res.send({state: -1, log: "LOGIN_PARAMETERS_UNDEFINED"})
    })

user_router.route("/sign_up")
    .post((req, res) =>
    {
        res.setHeader("Access-Control-Allow-Origin", "*")
        let data = {...req.body}

        data.username && data.phone ?
            sign_up(
                {
                    username: data.username,
                    phone: data.phone,
                    response: res
                }) : res.send({state: -1, log: "SIGN_UP_PARAMETERS_UNDEFINED"})
    })

user_router.route("/update")
    .post((req, res) =>
    {
        res.setHeader("Access-Control-Allow-Origin", "*")
        let data = {...req.body}

        data.id && data.name && data.phone ?
            update(
                {
                    id: data.id,
                    name: data.name,
                    phone: data.phone,
                    response: res
                }) : res.send({state: -1, log: "UPDATE_USER_PARAMETERS_UNDEFINED"})
    })

user_router.route("/delete")
    .post((req, res) =>
    {
        res.setHeader("Access-Control-Allow-Origin", "*")
        let data = {...req.body}
        let header = {...req.headers}

        if (header.auth !== undefined)
        {
            if (header.auth === Data.auth)
            {
                data.admin_id && data.user_id ?
                    delete_user(
                        {
                            admin_id: data.admin_id,
                            user_id: data.user_id,
                            response: res
                        }) : res.send({state: -3, log: "DELETE_USER_PARAMETERS_UNDEFINED"})

            } else res.send({state: -2, log: "DELETE_USER_INCORRECT_HEADER"})
        } else res.send({state: -1, log: "DELETE_USER_PERMISSION_DENIED"})
    })

user_router.route("/add_category")
    .post((req, res) =>
    {
        res.setHeader("Access-Control-Allow-Origin", "*")
        let data = {...req.body}
        let header = {...req.headers}

        if (header.auth !== undefined)
        {
            if (header.auth === Data.android_token || header.auth === Data.ios_token)
            {
                data.user_id && data.category_id ?
                    add_category(
                        {
                            user_id: data.user_id,
                            category_id: data.category_id,
                            response: res
                        }) : res.send({state: -3, log: "ADD_USER_CATEGORY_PARAMETERS_UNDEFINED"})

            } else res.send({state: -2, log: "ADD_USER_CATEGORY_INCORRECT_HEADER"})
        } else res.send({state: -1, log: "ADD_USER_CATEGORY_PERMISSION_DENIED"})
    })

user_router.route("/delete_category")
    .post((req, res) =>
    {
        res.setHeader("Access-Control-Allow-Origin", "*")
        let data = {...req.body}
        let header = {...req.headers}

        if (header.auth !== undefined)
        {
            if (header.auth === Data.android_token || header.auth === Data.ios_token)
            {
                data.user_id && data.category_id ?
                    delete_category(
                        {
                            user_id: data.user_id,
                            category_id: data.category_id,
                            response: res
                        }) : res.send({state: -3, log: "DELETE_USER_CATEGORY_PARAMETERS_UNDEFINED"})

            } else res.send({state: -2, log: "DELETE_USER_CATEGORY_INCORRECT_HEADER"})
        } else res.send({state: -1, log: "DELETE_USER_CATEGORY_PERMISSION_DENIED"})
    })

user_router.route("/get_favorite")
    .post((req, res) =>
    {
        res.setHeader("Access-Control-Allow-Origin", "*")
        let data = {...req.body}

        data.username && data.phone ?
            get_favorite(
                {
                    phone: data.phone,
                    username: data.username,
                    response: res
                }) : res.send({state: -1, log: "GET_USER_FAVORITES_PARAMETERS_UNDEFINED"})
    })

user_router.route("/:id")
    .get((req, res) =>
    {
        res.setHeader("Access-Control-Allow-Origin", "*")
        if (!isNaN(req.params.id))
            select({id: req.params.id, response: res})
        else res.send({state: -1, log: `GET_USER_${req.params.id}_IS_NOT_NUMBER`})
    })


module.exports = user_router