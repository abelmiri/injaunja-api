const apn = require("apn")
const path = require("path")
const mssql = require("mssql")
const Data = require("./data")
const Connection = require("./connection")

////////////////////////////////////// MODULES_IMPORTS_ENDED

const {getUserShortNotification, getUserLongNotification} = require("./functions/notification")

////////////////////////////////////// FUNCTION_CALLS_ENDED

setInterval(() =>
{
    let request = new mssql.Request(Connection.connection)
    request.query(`select id, device_token from users where is_ios = 'true'`, (error, records) =>
    {
        if (error) console.log("fetchIOSdbError", error)
        else if (records.recordset.length > 0)
        {
            records.recordset.forEach((user) =>
            {
                getUserShortNotification({user_id: user.id, is_ios: user.device_token})
                getUserLongNotification({user_id: user.id, is_ios: user.device_token})
            })
        }
    })
}, 420000) // Every 7 Minutes

// setTimeout(() => // Test
// {
//     apnFunction({
//         notification_title: "Title",
//         notification_description: "Desc",
        // is_ios: "4f234e819c1d3fe625e0a6dc07148c76f03380f8e0f3bf12951505a9e36be3ba", // Ok Test
//         is_ios: "7eeb2c61337cfdd7d1645cde6d91d54c5415c96c748f1f65a42de033a05e2fda", // Develop Ok Test
//     })
// }, 5000) // After 5 Second

const apnFunction = ({notification_title = "Title Test", notification_description = "Body Test", is_ios = "something"}) =>
{
    let apnProvider = new apn.Provider(
        {
            token: {
                key: path.join(__dirname, `/files/keys/${Data.apnKey}`),
                keyId: Data.apnKeyId,
                teamId: Data.apnTeamId,
            },
            production: false,
        })

    let notification = new apn.Notification(),
        alert = {
            body: notification_title,
            title: notification_description,
        },
        topic = Data.apnBundleId,
        badge = 5,
        priority = 5,
        pushType = "alert",
        payload = {"messageFrom": "InjaUnja API"}

    notification.alert = {...alert}
    notification.payload = {...payload}
    notification.topic = topic
    notification.badge = badge
    notification.priority = priority
    notification.pushType = pushType
    notification.expiry = Math.floor(Date.now() / 1000) + 21600 // 6 Hours

    apnProvider.send(notification, is_ios) // 4f234e819c1d3fe625e0a6dc07148c76f03380f8e0f3bf12951505a9e36be3ba
        .then(res =>
        {
            console.log("OnApnSuccessRes ->", res)
        })
        .catch(err =>
        {
            console.log("OnApnError ->", err)
        })
        .finally(() =>
        {
            apnProvider.shutdown()
            console.log("OnApnShutdown ->", notification.id)
        })
}

module.exports =
    {
        apnFunction: apnFunction,
    }