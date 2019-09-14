let cors = require("cors")
let express = require("express")
let bodyParser = require("body-parser")
let fileUpload = require("express-fileupload")
let apnConnection = require("./apn_connection")

const app = express()

app.use(cors())
app.use(fileUpload())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

////////////////////////////////////// CONFIG_ENDED

const Root = require("./routers/Root")
const User = require("./routers/User")
const Files = require("./routers/Files")
const Event = require("./routers/Event")
const Backdoor = require("./routers/Backdoor")
const Category = require("./routers/Category")
const Notification = require("./routers/Notification")

const Data = require("./data")

////////////////////////////////////// ROUTERS_IMPORTS_ENDED

app.use("/user", User)
app.use("/files", Files)
app.use("/event", Event)
app.use("/backdoor", Backdoor)
app.use("/category", Category)
app.use("/notification", Notification)

app.use("/", Root)

////////////////////////////////////// ROUTERS_CALLS_ENDED

app.listen(process.env.PORT || Data.port, () =>
{
    console.log(`Server is Now Running on Port ${Data.port}, (${Data.sign})HEX - API: ${Data.restful_url} - DOMAIN: ${Data.domain_url}`)
})
