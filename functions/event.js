let JDate = require("jalali-date")
let mssql = require("mssql")
let Connection = require("../connection")
let Data = require("../data")

////////////////////////////////////// MODULES_IMPORTS_ENDED

const create = ({category_id, name, description, info, address, location, creator_id, have_rating, is_long, start_time, end_time, start_year, start_month, start_day, end_year, end_month, end_day, pictures, response}) =>
{
    if (name.length >= 4 && name.length < 100 && description.length < 500 && info.length < 500 && address.length < 500 && location.length < 150)
    {
        let request = new mssql.Request(Connection.connection)

        let Jdate = new JDate()
        let date = new Date()
        let timestamp = new Date().getTime()

        let pic_names = null
        if (pictures !== null) pic_names = pictures.map(() => Data.media_url + timestamp + Math.floor(Math.random() * 10000) + ".png")


        /** @namespace Jdate.date */
        let create_date = `${Jdate.date[0]}/${Jdate.date[1]}/${Jdate.date[2]}`
        let create_time = `${date.getHours()}:${date.getMinutes()}`

        // TODO: Add "notification" field / maybe no
        request.query(`insert into events (category_id, name, description, info, address, location, creator_id, have_rating, is_long, create_date, create_time, pictures,
        start_time, end_time, start_year, start_month, start_day ${end_year ? ", end_year," : ""}${end_month ? "end_month," : ""}${end_day ? "end_day" : ""})
        output (inserted.id)
        values (N'${category_id}', N'${name}', N'${description}', N'${info}', N'${address}', N'${location}', N'${creator_id}', '${have_rating}', '${is_long}',
        N'${create_date}', N'${create_time}', N'${JSON.stringify(pic_names)}', N'${start_time}', N'${end_time}',
        N'${start_year}', N'${start_month}', N'${start_day}' ${end_year ? `,${end_year}` : ""}${end_month ? `,${end_month}` : ""}${end_day ? `,${end_day}` : ""})`, (err, record_set) =>
        {
            if (err) response.send({state: -5, log: "DATA_BASE_ERROR", form: err})
            else
            {
                response.send({state: 1, log: "SUCCESSFUL_CREATE_EVENT", form: record_set.recordset[0]})
                if (pic_names !== null)
                {
                    for (let i = 0; i < pictures.length; i++)
                    {
                        pictures[i].mv(pic_names[i].split(Data.restful_url).pop(), (errPic) =>
                            errPic ?
                                console.log({errPic}) :
                                console.log("SUCCESS_EVENT_PIC_SAVE"))
                    }
                }
            }
        })
    }
    else response.send({state: -4, log: "CREATE_EVENT_PARAMETERS_DOES_NOT_HAVE_REQUIRED_LENGTHS"})
}

const update = ({id, old_pictures, category_id, name, description, info, address, location, have_rating, is_long, start_time, end_time, start_year, start_month, start_day, end_year, end_month, end_day, pictures, response}) =>
{
    if (name.length >= 4 && name.length < 100 && description.length < 500 && info.length < 500 && address.length < 500 && location.length < 150)
    {
        let request = new mssql.Request(Connection.connection)

        let timestamp = new Date().getTime()

        let pic_names = []
        if (pictures !== null) pic_names = pictures.map(() => Data.media_url + timestamp + Math.floor(Math.random() * 10000) + ".png")
        if (JSON.parse(old_pictures).length > 0) JSON.parse(old_pictures).forEach((p) => pic_names.push(p))

        // TODO: Add "notification" field / maybe no
        request.query(`update events set 
        category_id = N'${category_id}',
        name = N'${name}',
        description = N'${description}',
        info = N'${info}',
        address = N'${address}',
        location = N'${location}',
        have_rating = '${have_rating}',
        is_long = '${is_long}',
        pictures = N'${JSON.stringify(pic_names)}',
        start_time = N'${start_time}',
        end_time = N'${end_time}',
        start_year = N'${start_year}',
        start_month = N'${start_month}',
        start_day = N'${start_day}'
        ${end_year ? `, end_year = N'${end_year}'` : ""}
        ${end_month ? `, end_month = N'${end_month}'` : ""}
        ${end_day ? `, end_day = N'${end_day}'` : ""}
         where id = N'${id}'
        `, (err, record_set) =>
        {
            if (err) response.send({state: -5, log: "DATA_BASE_ERROR", form: err})
            else
            {
                response.send({state: 1, log: "SUCCESSFUL_EDIT_EVENT", form: {rowsAffected: record_set.rowsAffected}})
                if (pic_names.length > 0 && pictures)
                {
                    for (let i = 0; i < pictures.length; i++)
                    {
                        pictures[i].mv(pic_names[i].split(Data.restful_url).pop(), (errPic) =>
                            errPic ?
                                console.log({errPic}) :
                                console.log("SUCCESS_EVENT_PIC_SAVE"))
                    }
                }
            }
        })
    }
    else response.send({state: -4, log: "EDIT_EVENT_PARAMETERS_DOES_NOT_HAVE_REQUIRED_LENGTHS"})
}

const select = ({id, response}) =>
{
    if (id === null)
    {
        let request = new mssql.Request(Connection.connection)
        request.query(
            `select * from events`
            , (error, records) =>
            {
                if (error) response.send({state: -1, log: "DATA_BASE_ERROR", form: error})
                else
                {
                    response.send({state: 1, log: "SUCCESSFUL_GET_ALL_EVENTS", form: records.recordset})
                }
            })
    }
    else if (id > 0)
    {
        let request = new mssql.Request(Connection.connection)
        request.query(
            `select 
            id, category_id, name, description, info, pictures, address, location, have_rating, is_long, start_time, end_time, 
            start_day, start_month, start_year, end_day, end_month, end_year, create_date, create_time 
            from events where id = N'${id}'`
            , (error, records) =>
            {
                if (error) response.send({state: -2, log: "DATA_BASE_ERROR", form: error})
                else
                {
                    records.recordset[0] ?
                        response.send({
                            state: 1, log:
                                `SUCCESSFUL_GET_EVENT_${id}`
                            , form: records.recordset[0],
                        }) :
                        response.send({
                            state: -3, log:
                                `EVENT_${id}_NOT_FOUND`
                            , form: null,
                        })
                }
            })
    }
    else if (id < 0)
    {
        let request = new mssql.Request(Connection.connection)
        request.query(
            `select * from events where id = ${Math.abs(id)}`
            , (error, records) =>
            {
                if (error) response.send({state: -2, log: "DATA_BASE_ERROR", form: error})
                else
                {
                    records.recordset[0] ?
                        response.send({
                            state: 1, log:
                                `SUCCESSFUL_GET_FULL_EVENT_${Math.abs(id)}`
                            , form: records.recordset[0],
                        }) :
                        response.send({
                            state: -3, log:
                                `EVENT_${Math.abs(id)}_NOT_FOUND`
                            , form: null,
                        })
                }
            })
    }
}

const deleting = ({id, response}) =>
{
    let request = new mssql.Request(Connection.connection)
    request.query(
        `delete from events where id = '${id}'`
        , (error) =>
        {
            if (error) response.send({state: -5, log: "DATA_BASE_ERROR", form: error})
            else response.send({
                state: 1, log:
                    `DELETE_EVENT_${id}_WAS_SUCCESSFUL`,
            })
        })
}

const selectByString = ({string, response}) =>
{
    let request = new mssql.Request(Connection.connection)
    request.query(`
    select * from events where
    name like N'%${string}%' or 
    description like N'%${string}%' or
    info like N'%${string}%' or
    address like N'%${string}%'`, (error, records) =>
    {
        if (error) response.send({state: -1, log: "DATA_BASE_ERROR", form: error})
        else
        {
            records.recordset[0] ?
                response.send({state: 1, log: `SUCCESSFUL_SEARCH_EVENT`, form: records.recordset}) :
                response.send({state: -2, log: `NO_EVENT_HAS_BEEN_FOUND`, form: []})
        }
    })
}

const selectByCategoryId = ({category_id, response}) =>
{
    let request = new mssql.Request(Connection.connection)
    request.query(
        `select id, category_id, name, description, info, pictures, address, location, have_rating, is_long, start_time, end_time, 
                    start_day, start_month, start_year, end_day, end_month, end_year, create_date, create_time 
                    from events where category_id = N'${category_id}' order by start_year, start_month, start_day`
        , (error, records) =>
        {
            if (error) response.send({state: -2, log: "DATA_BASE_ERROR", form: error})
            else
            {
                records.recordset[0] ?
                    response.send({
                        state: 1,
                        length: records.recordset.length,
                        log: `SUCCESSFUL_GET_EVENT_BY_CATEGORY_${category_id}_ID`,
                        form: records.recordset,
                    }) :
                    response.send({
                        state: -3,
                        log: `EVENT_OR_CATEGORY_NOT_FOUND`,
                        form: null,
                    })
            }
        })
}

const selectByDateAndCategoryId = ({category_id, event_month, event_year, response}) =>
{
    let request = new mssql.Request(Connection.connection)
    request.query(`select id, category_id, name, description, info, pictures, address, location, have_rating, is_long, start_time, end_time,
                             start_day, start_month, start_year, end_day, end_month, end_year from events where
                             category_id = N'${category_id}' and (start_month = ${event_month} or end_month = ${event_month}) and (start_year = ${event_year} or end_year = ${event_year})`
        , (error, records) =>
        {
            if (error) response.send({state: -3, log: "DATA_BASE_ERROR", form: error})
            else
            {
                records.recordset[0] ?
                    response.send({
                        state: 1,
                        log: `SUCCESSFUL_GET_EVENTS_BY_CATEGORY_${category_id}_AND_DATE`,
                        length: records.recordset.length,
                        form: records.recordset,
                    })
                    : response.send({state: -4, log: `NO_EVENT_MATCHES_TO_THE_PROVIDED_STATEMENTS`, form: null})
            }
        })
}

module.exports =
    {
        create: create,
        update: update,
        select: select,
        deleting: deleting,
        selectByString: selectByString,
        selectByCategoryId: selectByCategoryId,
        selectByDateAndCategoryId: selectByDateAndCategoryId,
    }