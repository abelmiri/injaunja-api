let express = require("express")
let Data = require("../data")

////////////////////////////////////// MODULES_IMPORTS_ENDED

let event_router = express.Router()

////////////////////////////////////// ROUTERS_CONFIG_ENDED

const {create, update, select, deleting, selectByCategoryId, selectByDateAndCategoryId} = require("../functions/event")

////////////////////////////////////// FUNCTION_CALLS_ENDED

event_router.route("/")
    .get((req, res) =>
    {
        res.setHeader("Access-Control-Allow-Origin", "*")
        select({id: null, response: res})
    })

event_router.route("/date/")
    .post((req, res) =>
    {
        res.setHeader("Access-Control-Allow-Origin", "*")
        let data = {...req.body}

        /** @namespace data.event_year */
        /** @namespace data.event_month */
        data.category_id && data.event_month && data.event_year ?
            !isNaN(data.category_id) && !isNaN(data.event_month) && !isNaN(data.event_year) ?
                selectByDateAndCategoryId({
                    category_id: data.category_id,
                    event_month: data.event_month,
                    event_year: data.event_year,
                    response: res,
                })
                : res.send({state: -2, log: `GET_EVENTS_BY_DATE_AND_CATEGORY_ID_PARAMETERS_ARE_NOT_INTEGER`})
            : res.send({state: -1, log: `GET_EVENTS_BY_DATE_AND_CATEGORY_ID_PARAMETERS_UNDEFINED`})
    })

event_router.route("/category_id/:id")
    .get((req, res) =>
    {
        res.setHeader("Access-Control-Allow-Origin", "*")
        if (!isNaN(req.params.id))
            selectByCategoryId({category_id: req.params.id, response: res})
        else res.send({state: -1, log: `GET_EVENT_PARENT_${req.params.id}_IS_NOT_NUMBER`})
    })


event_router.route("/full/:id")
    .get((req, res) =>
    {
        res.setHeader("Access-Control-Allow-Origin", "*")
        if (!isNaN(req.params.id))
            select({id: -req.params.id, response: res})
        else res.send({state: -1, log: `GET_FULL_EVENT_${req.params.id}_IS_NOT_NUMBER`})
    })

event_router.route("/create")
    .post((req, res) =>
    {
        res.setHeader("Access-Control-Allow-Origin", "*")

        let data = {...req.body}
        let header = {...req.headers}

        let pictures = req.files ? Object.values(req.files) : []

        /** @namespace data.category_id */
        /** @namespace data.creator_id */
        /** @namespace data.have_rating */
        /** @namespace data.is_long */
        /** @namespace data.start_day */
        /** @namespace data.start_month */
        /** @namespace data.start_year */

        if (header.auth !== undefined)
        {
            if (header.auth === Data.auth)
            {
                if (data.category_id !== undefined &&
                    data.name !== undefined &&
                    data.description !== undefined &&
                    data.address !== undefined &&
                    data.creator_id !== undefined &&
                    data.have_rating !== undefined &&
                    data.is_long !== undefined &&
                    data.start_day !== undefined &&
                    data.start_month !== undefined &&
                    data.start_year !== undefined)
                {
                    create({
                        category_id: data.category_id,
                        name: data.name,
                        description: data.description,
                        info: data.info,
                        address: data.address,
                        location: data.location,
                        creator_id: data.creator_id,
                        have_rating: data.have_rating,
                        is_long: data.is_long,
                        start_time: data.start_time,
                        end_time: data.end_time,
                        start_day: data.start_day,
                        start_month: data.start_month,
                        start_year: data.start_year,
                        end_day: data.end_day,
                        end_month: data.end_month,
                        end_year: data.end_year,
                        pictures: pictures,
                        response: res,
                    })
                }
                else res.send({state: -3, log: "CREATE_EVENT_PARAMETERS_UNDEFINED", form: data})
            }
            else res.send({state: -2, log: "CREATE_EVENT_INCORRECT_HEADER"})
        }
        else res.send({state: -1, log: "CREATE_EVENT_PERMISSION_DENIED"})
    })

event_router.route("/update")
    .post((req, res) =>
    {
        res.setHeader("Access-Control-Allow-Origin", "*")

        let data = {...req.body}
        let header = {...req.headers}

        let pictures = req.files ? Object.values(req.files) : null

        if (header.auth !== undefined)
        {
            if (header.auth === Data.auth)
            {
                if (data.id !== undefined &&
                    data.old_pictures !== undefined &&
                    data.category_id !== undefined &&
                    data.name !== undefined &&
                    data.description !== undefined &&
                    data.address !== undefined &&
                    data.have_rating !== undefined &&
                    data.is_long !== undefined &&
                    data.start_day !== undefined &&
                    data.start_month !== undefined &&
                    data.start_year !== undefined)
                {
                    update({
                        id: data.id,
                        old_pictures: data.old_pictures,
                        category_id: data.category_id,
                        name: data.name,
                        description: data.description,
                        info: data.info,
                        address: data.address,
                        location: data.location,
                        have_rating: data.have_rating,
                        is_long: data.is_long,
                        start_time: data.start_time,
                        end_time: data.end_time,
                        start_day: data.start_day,
                        start_month: data.start_month,
                        start_year: data.start_year,
                        end_day: data.end_day,
                        end_month: data.end_month,
                        end_year: data.end_year,
                        pictures: pictures,
                        response: res,
                    })
                }
                else res.send({state: -3, log: "EDIT_EVENT_PARAMETERS_UNDEFINED", form: data})
            }
            else res.send({state: -2, log: "EDIT_EVENT_INCORRECT_HEADER"})
        }
        else res.send({state: -1, log: "EDIT_EVENT_PERMISSION_DENIED"})
    })

event_router.route("/delete")
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
                    res.send({state: -3, log: "DELETE_EVENT_PARAMETERS_UNDEFINED", form: data}) :
                res.send({state: -2, log: "DELETE_EVENT_INCORRECT_HEADER"})
        }
        else res.send({state: -1, log: "DELETE_EVENT_PERMISSION_DENIED"})
    })

event_router.route("/:id")
    .get((req, res) =>
    {
        res.setHeader("Access-Control-Allow-Origin", "*")
        if (!isNaN(req.params.id))
            select({id: req.params.id, response: res})
        else res.send({state: -1, log: `GET_EVENT_${req.params.id}_IS_NOT_NUMBER`})
    })


/*event_router.route("/update")
    .post((req, res) =>
    {
        res.setHeader("Access-Control-Allow-Origin", "*")

        let data = {...req.body}
        let header = {...req.headers}

        let pictures = req.files ? Object.values(req.files) : null

        /!** @namespace data.category_id *!/
        /!** @namespace data.creator_id *!/
        /!** @namespace data.have_rating *!/
        /!** @namespace data.is_long *!/
        /!** @namespace data.start_day *!/
        /!** @namespace data.start_month *!/
        /!** @namespace data.start_year *!/

        if (header.auth !== undefined)
        {
            if (header.auth === Data.auth)
            {
                if (data.category_id !== undefined &&
                    data.name !== undefined &&
                    data.description !== undefined &&
                    data.address !== undefined &&
                    data.creator_id !== undefined &&
                    data.have_rating !== undefined &&
                    data.is_long !== undefined &&
                    data.start_day !== undefined &&
                    data.start_month !== undefined &&
                    data.start_year !== undefined)
                {
                    create({
                        category_id: data.category_id,
                        name: data.name,
                        description: data.description,
                        info: data.info,
                        address: data.address,
                        location: data.location,
                        creator_id: data.creator_id,
                        have_rating: data.have_rating,
                        is_long: data.is_long,
                        start_time: data.start_time,
                        end_time: data.end_time,
                        start_day: data.start_day,
                        start_month: data.start_month,
                        start_year: data.start_year,
                        end_day: data.end_day,
                        end_month: data.end_month,
                        end_year: data.end_year,
                        pictures: pictures,
                        response: res
                    })
                } else res.send({state: -3, log: "CREATE_EVENT_PARAMETERS_UNDEFINED", form: data})
            } else res.send({state: -2, log: "CREATE_EVENT_INCORRECT_HEADER"})
        } else res.send({state: -1, log: "CREATE_EVENT_PERMISSION_DENIED"})
    })*/

module.exports = event_router