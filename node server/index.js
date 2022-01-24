const express = require("express")
const {spawn} = require("child_process")
const fs = require("fs");
const app = express()
const port = 3000
const bodyParser = require("body-parser")
const favicon = require('serve-favicon')

app.use(bodyParser.json())
app.use(favicon("favicon.ico"))

// used to add data to the json file
app.post("/test_1", (req, res) => {
    let json = req.body;
    console.log(json);

    // need to make a system for naming the JSON files
    // when report is created, ask for a report name?
    try{
        if(fs.existsSync("data.json")){
            let file_raw = fs.readFileSync("data.json");
            let file = JSON.parse(file_raw);
            let new_json = { file, json };
            fs.writeFileSync("data.json", JSON.stringify(new_json));
        }else{
            fs.writeFileSync("data.json", JSON.stringify(json));
        }
        res.send(JSON.stringify("Data stored successfully"))
    }catch(err){
        console.log(err);
        res.send(err);
    }
})

// used to generate the report
app.get("/test_2", (req, res) => {
    let data_to_send;

    // new child process to run the python script
    const python = spawn("python", ["../report gen/generator.py"]);

    python.on("error", (error) => {
        console.log("ERROR: " + error);
        res.send(error)
    });
    
    // collect the data output from the script
    python.stdout.on("data", (data) => {
        data_to_send = data.toString();
        console.log(data_to_send);
    });

    // output when the child process closes
    python.on("close", (code, signal) => {
        console.log("code" + code);
        console.log(signal);
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