const express = require("express")
const {spawn} = require("child_process")
const fs = require("fs");
const app = express()
const port = 3000
const bodyParser = require("body-parser")
const favicon = require('serve-favicon')

app.use(bodyParser.json())
app.use(favicon("favicon.ico"))

app.post("/test_1", (req, res) => {
    var json = req.body;

    fs.writeFile("data.json", JSON.stringify(json), (err) => {
        if (err) throw err;
        console.log("JSON file written");
    })

    var data_to_send;

    // new child process to run the python script
    const python = spawn("python", ["../report gen/generator.py"]);

    // collect the data output from the script
    python.stdout.on("data", (data) => {
        console.log(data);
        data_to_send = data.toString();
    });

    // output when the child process closes
    python.on("close", (code) => {
        console.log("Child process closes all stdio with code" + code);
        // must be sent back as JSON
        res.send(JSON.stringify(data_to_send))
    });
})

const display_html = (filename, req, res) => {
    fs.readFile((filename), (err, html) => {
        if(err){
            throw err;
        }
        res.write(html);
        res.end()
    })
}; 

app.get("/client_details", (req, res) => {
    // display html to user
    display_html("../website pages/client_details.html", req, res)
})

// when user visit root page
app.get("/", (req, res) => {
    // display html to user
    display_html("../website pages/site_details.html", req, res)
})

app.listen(port, () => console.log("Server listening on port:", port))