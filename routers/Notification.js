let express = require("express")
let Data = require("../data")

////////////////////////////////////// MODULES_IMPORTS_ENDED

let notification_router = express.Router()

////////////////////////////////////// ROUTERS_CONFIG_ENDED

const {addNotification, getUserShortNotification, getUserLongNotification} = require("../functions/notification")

////////////////////////////////////// FUNCTION_CALLS_ENDED

notification_router.route("/")
    .get((req, res) =>
    {
        res.setHeader("Access-Control-Allow-Origin", "*")
        res.send({state: 0, log: `NOTIFICATION_IS_UNDER_DEVELOP`})
    })

notification_router.route("/add")
    .post((req, res) =>
    {
        res.setHeader("Access-Control-Allow-Origin", "*")

        let data = {...req.body}
        let header = {...req.headers}

        if (header.auth !== undefined)
        {
            if (header.auth === Data.auth)
            {
                if (data.event_id !== undefined && data.notification !== undefined)
                {
                    if (!isNaN(data.event_id))
                        addNotification
                        ({
                            event_id: data.event_id,
                            notification: data.notification,
                            response: res
                        })
                    else res.send({state: -4, log: `EVENT_ID_${data.event_id}_IS_NOT_A_NUMBER_DEAR_DEER`, form: data})
                } else res.send({state: -3, log: "ADD_NOTIFICATION_PARAMETERS_UNDEFINED", form: data})
            } else res.send({state: -2, log: "ADD_NOTIFICATION_INCORRECT_HEADER", form: data})
        } else res.send({state: -1, log: "ADD_NOTIFICATION_PERMISSION_DENIED", form: data})
    })

notification_router.route("/getUserShortNotification")
    .post((req, res) =>
    {
        res.setHeader("Access-Control-Allow-Origin", "*")

        let data = {...req.body}
        let header = {...req.headers}

        if (header.auth !== undefined)
        {
            if (header.auth === Data.android_token || header.auth === Data.ios_token)
            {
                if (!isNaN(data.user_id))
                {
                    data.user_id ?
                        getUserShortNotification(
                            {
                                user_id: data.user_id,
                                response: res
                            }) : res.send({state: -4, log: "GET_USER_NOTIFICATIONS_PARAMETERS_UNDEFINED", form: []})
                } else res.send({state: -3, log: `USER_ID_${data.user_id}_IS_NOT_A_NUMBER`, form: []})
            } else res.send({state: -2, log: "GET_USER_NOTIFICATIONS_INCORRECT_HEADER", form: []})
        } else res.send({state: -1, log: "GET_USER_NOTIFICATIONS_PERMISSION_DENIED", form: []})
    })

notification_router.route("/getUserLongNotification")
    .post((req, res) =>
    {
        res.setHeader("Access-Control-Allow-Origin", "*")

        let data = {...req.body}
        let header = {...req.headers}

        if (header.auth !== undefined)
        {
            if (header.auth === Data.android_token || header.auth === Data.ios_token)
            {
                if (!isNaN(data.user_id))
                {
                    data.user_id ?
                        getUserLongNotification(
                            {
                                user_id: data.user_id,
                                response: res
                            }) : res.send({state: -4, log: "GET_USER_NOTIFICATIONS_PARAMETERS_UNDEFINED", form: []})
                } else res.send({state: -3, log: `USER_ID_${data.user_id}_IS_NOT_A_NUMBER`, form: []})
            } else res.send({state: -2, log: "GET_USER_NOTIFICATIONS_INCORRECT_HEADER", form: []})
        } else res.send({state: -1, log: "GET_USER_NOTIFICATIONS_PERMISSION_DENIED", form: []})
    })

notification_router.route("/:id")
    .get((req, res) =>
    {
        res.setHeader("Access-Control-Allow-Origin", "*")
        if (!isNaN(req.params.id))
            res.send({state: 0, log: `GET_NOTIFICATION_${req.params.id}_IS_UNDER_DEVELOP`})
        else res.send({
            state: -1,
            log: `GET_NOTIFICATION_${req.params.id}_IS_NOT_A_NUMBER_BUT_WE_ARE_STILL_UNDER_DEVELOP_DEAR_DEER`
        })
    })

notification_router.route("/test/:id")
    .get((req, res) =>
    {
        res.setHeader("Access-Control-Allow-Origin", "*")
        if (!isNaN(req.params.id))
            res.send({
                state: 1,
                log: `GET_NOTIFICATION_SUCCESSFUL`,
                form: {
                    id: parseInt(req.params.id, 10),
                    title: "Test for Notification",
                    description: "this is description for that",
                    time: "19:25",
                    date: "2019-01-01",
                }
            })
        else res.send({state: -1, log: `${req.params.id}_IS_NOT_NUMBER`, form: []})
    })

module.exports = notification_router