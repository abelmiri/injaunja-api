let JDate = require("jalali-date")
let mssql = require("mssql")
let Connection = require("../connection")
let Data = require("../data")

////////////////////////////////////// MODULES_IMPORTS_ENDED

const select = ({id, response}) =>
{
    if (id === null)
    {
        let request = new mssql.Request(Connection.connection)
        request.query(`select id, name, description, selectable, parent_id, picture, svg, create_date, create_time from categories`, (error, records) =>
        {
            if (error) response.send({state: -1, log: "DATA_BASE_ERROR", form: error})
            else
            {
                response.send({state: 1, log: "SUCCESSFUL_GET_ALL_CATEGORIES", form: records.recordset})
            }
        })
    }
    else if (id > 0)
    {
        let request = new mssql.Request(Connection.connection)
        request.query(`select id, name, description, subscribes, selectable, parent_id, picture, svg, create_date, create_time from categories where id = N'${id}'`, (error, records) =>
        {
            if (error) response.send({state: -2, log: "DATA_BASE_ERROR", form: error})
            else
            {
                records.recordset[0] ?
                    response.send({state: 1, log: `SUCCESSFUL_GET_CATEGORY_${id}`, form: records.recordset[0]}) :
                    response.send({state: -3, log: `CATEGORY_${id}_NOT_FOUND`, form: null})
            }
        })
    }
    else if (id < 0)
    {
        let request = new mssql.Request(Connection.connection)
        request.query(`select id, name, subscribes, picture, svg, create_date, create_time from categories where selectable = 1 order by subscribes desc`, (error, records) =>
        {
            if (error) response.send({state: -2, log: "DATA_BASE_ERROR", form: error})
            else
            {
                records.recordset[0] ?
                    response.send({state: 1, log: `SUCCESSFUL_GET_CATEGORY_BY_SUBSCRIBES`, form: records.recordset}) :
                    response.send({state: -3, log: `CATEGORIES_NOT_FOUND`, form: null})
            }
        })
    }
    else response.end()
}

const selectByString = ({string, response}) =>
{
    let request = new mssql.Request(Connection.connection)
    request.query(`select * from categories where name like N'%${string}%' or description like N'%${string}%'`, (error, records) =>
    {
        if (error) response.send({state: -1, log: "DATA_BASE_ERROR", form: error})
        else
        {
            records.recordset[0] ?
                response.send({state: 1, log: `SUCCESSFUL_SEARCH_CATEGORY`, form: records.recordset}) :
                response.send({state: -2, log: `NO_CATEGORY_HAS_BEEN_FOUND`, form: []})
        }
    })
}

const selectByParent = ({parent_id, response}) =>
{
    let request = new mssql.Request(Connection.connection)
    request.query(`select id, name, description, selectable, parent_id, picture, svg, create_date, create_time from categories where parent_id = '${parent_id}'`, (error, records) =>
    {
        if (error) response.send({state: -2, log: "DATA_BASE_ERROR", form: error})
        else
        {
            records.recordset[0] ?
                response.send({state: 1, log: `SUCCESSFUL_GET_CATEGORIES_${parent_id}`, form: records.recordset}) :
                response.send({state: -3, log: `CATEGORY_NOT_FOUND`, form: null})
        }
    })
}

const selectLastOnes = ({limit, response}) =>
{
    let request = new mssql.Request(Connection.connection)
    request.query(`select top ${limit} id, name, description, selectable, parent_id, picture, svg, create_date, create_time from categories order by id desc`, (error, records) =>
    {
        if (error) response.send({state: -1, log: "DATA_BASE_ERROR", form: error})
        else
        {
            response.send({state: 1, log: "SUCCESSFUL_GET_LAST_CATEGORIES", form: records.recordset})
        }
    })
}

const create = ({name, description, selectable, parent_id, picture, svg, response}) =>
{
    if (name.length >= 4 && description.length >= 4)
    {
        let request = new mssql.Request(Connection.connection)

        let Jdate = new JDate()
        let date = new Date()
        let timestamp = new Date().getTime()

        /** @namespace Jdate.date */
        let create_date = `${Jdate.date[0]}/${Jdate.date[1]}/${Jdate.date[2]}`
        let create_time = `${date.getHours()}:${date.getMinutes()}`

        request.query(`insert into categories (name, description, selectable, parent_id, ${picture && picture.name ? `picture, ` : ""}${svg && svg.name ? `svg, ` : ""}create_date, create_time)
        output (inserted.id)
        values (N'${name}', N'${description}', '${selectable}', ${parent_id}, 
        ${picture && picture.name ? `N'${Data.media_url + timestamp + ".jpg"}',` : ""}${svg && svg.name ? `N'${Data.vector_url + timestamp + ".svg"}',` : ""} 
        N'${create_date}', N'${create_time}')`,
            (error, records) =>
            {
                if (error) response.send({state: -5, log: "DATA_BASE_ERROR", form: error})
                else
                {
                    picture && picture.name && picture.mv(Data.media_location + timestamp + ".jpg", (errPic) =>
                        errPic ? console.log({errPic}) : console.log("SUCCESS_CATEGORY_PIC_SAVE"))
                    svg && svg.name && svg.mv(Data.vector_location + timestamp + ".svg", (errSvg) =>
                        errSvg ? console.log({errSvg}) : console.log("SUCCESS_CATEGORY_SVG_SAVE"))

                    response.send({state: 1, log: "SUCCESSFUL_CREATE_CATEGORY", form: records.recordset[0]})
                }
            })
    }
    else response.send({state: -4, log: "CREATE_CATEGORY_PARAMETERS_DOES_NOT_HAVE_MINIMUM_LENGTHS"})
}

const deleting = ({id, response}) =>
{
    let request = new mssql.Request(Connection.connection)
    request.query(`delete from categories where id = '${id}' or parent_id = '${id}'`, (error) =>
    {
        if (error) response.send({state: -5, log: "DATA_BASE_ERROR", form: error})
        else
        {
            request.query(`delete from events where category_id = '${id}'`, (error0) =>
            {
                if (error0) response.send({state: -6, log: "DATA_BASE_ERROR", form: error0})
                else
                {
                    response.send({state: 1, log: `DELETE_CATEGORY_${id}_WAS_SUCCESSFUL`})
                }
            })
        }
    })
}

const update = ({id, name, description, selectable, picture, svg, response}) =>
{
    let request = new mssql.Request(Connection.connection)

    let timestamp = new Date().getTime()

    request.query(`select id from categories where id = '${id}'`, (error, records) =>
    {
        if (error) response.send({state: -4, log: "DATA_BASE_ERROR", form: error})
        else
        {
            if (records.recordset[0] !== undefined)
            {
                let xQuery = ""
                xQuery += name ? `name = N'${name}',` : ""
                xQuery += description ? `description = N'${description}',` : ""
                xQuery += selectable ? `selectable = '${selectable}',` : ""
                xQuery += picture && picture.name ? `picture = N'${Data.media_url + timestamp + ".jpg"}',` : ""
                xQuery += svg && svg.name ? `svg = N'${Data.vector_url + timestamp + ".svg"}',` : ""

                if (xQuery.length > 1)
                {
                    request.query(`update categories set ${xQuery.slice(0, -1)} where id = '${id}'`, (error) =>
                    {
                        if (error) response.send({state: -7, log: "DATA_BASE_ERROR", form: error})
                        else
                        {
                            picture && picture.name && picture.mv(Data.media_location + timestamp + ".jpg", (errPic) =>
                                errPic ? console.log({errPic}) : console.log("SUCCESS_UPDATE_CATEGORY_PIC_SAVE"))
                            svg && svg.name && svg.mv(Data.vector_location + timestamp + ".svg", (errSvg) =>
                                errSvg ? console.log({errSvg}) : console.log("SUCCESS_UPDATE_CATEGORY_SVG_SAVE"))

                            response.send({state: 1, log: `UPDATE_CATEGORY_${id}_WAS_SUCCESSFUL`})
                        }
                    })

                }
                else response.send({state: -6, log: "NO_FIELD_FOR_UPDATE", form: null})
            }
            else response.send({state: -5, log: `CATEGORY_${id}_NOT_FOUND`, form: null})
        }
    })
}

module.exports =
    {
        select: select,
        create: create,
        deleting: deleting,
        update: update,
        selectByParent: selectByParent,
        selectLastOnes: selectLastOnes,
        selectByString: selectByString,
    }