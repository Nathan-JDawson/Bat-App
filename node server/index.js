const express = require("express")
const {spawn} = require("child_process")
const fs = require("fs");
const app = express()
const port = 3000
const bodyParser = require("body-parser")
const multer = require("multer")
const favicon = require('serve-favicon')
const sharp = require("sharp");
const path = require("path");

app.use(bodyParser.json())
app.use(favicon("favicon.ico"))

// used to add data to the json file
app.post("/store_data", (req, res) => {
    let json = req.body;
    console.log(json);

    // need to make a system for naming the JSON files
    // when report is created, ask for a report name?
    try{
        if(fs.existsSync("data.json")){
            let file_raw = fs.readFileSync("data.json");
            let file = JSON.parse(file_raw);
            let new_json = { ...file , ...json };
            fs.writeFileSync("data.json", JSON.stringify(new_json));
        }else{
            fs.writeFileSync("data.json", JSON.stringify(json));
        }
        res.send(JSON.stringify("Data stored successfully"))
    }catch(err){
        console.log(err);
        res.send(JSON.stringify(err));
    }
})

// used to generate the report
app.get("/gen_report", (req, res) => {
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

const upload = multer({
    dest: "temp/"
});

// image compression when uploading a file
app.post("/compress_image", upload.single("upload"), (req, res) => {
    let filepath = req.file.path;
    let output = "../report gen/img/image.jpeg";
    
    sharp(filepath)
    .jpeg({ mozjpeg: true, quality: 40 })
    .toFile(output)
    .then(() => {
        res.send("image compressed")
    })
    .catch((err) => {
        res.send(err)
    });
    res.end()
})

const clear_temp = () => {
    let folder = "temp";

    fs.readdir(folder, (err1, files) => {
        if (err1) throw err1;

        for(const file of files){
            fs.unlink(path.join(folder, file), err2 => {
                if (err2) throw err2;
            });
        }
    });
}

const display_html = (filename, req, res) => {
    fs.readFile((filename), (err, html) => {
        if(err) throw err;
        res.writeHead(200, {"Content-Type": "text/html"});
        res.write(html);
        res.end()
    })
}; 

app.get("/project_proposals", (req, res) => {
    // display html to user
    display_html("../website pages/project_proposals.html", req, res)
})

app.get("/client_details", (req, res) => {
    // display html to user
    display_html("../website pages/client_details.html", req, res)
})

// when user visit root page
app.get("/", (req, res) => {
    // display html to user
    display_html("../website pages/site_details.html", req, res)
})

app.get("/functions.js", (req, res) => {
    fs.readFile("../website pages/functions.js", (err, data) => {
        if (err) throw err;
        res.writeHead(200, {"Content-Type": "text/javascript"});
        res.write(data);
        res.end()
    })
})

// clear the temp image folder on server start
clear_temp();

app.listen(port, () => console.log("Server listening on port:", port))