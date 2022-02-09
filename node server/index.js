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
            fs.writeFileSync("data.json", JSON.stringify(new_json), { mode: 0o777 });
        }else{
            fs.writeFileSync("data.json", JSON.stringify(json), { mode: 0o777 });
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

    python.stderr.on("data", (data) => {
        data_to_send += data;
        console.log(data);
    })
    
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
    
    res.send(JSON.stringify("image compressed"));
})

// clears the temp image folder
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

// will display the html file to the user
const display_html = (filename, req, res) => {
    fs.readFile((filename), (err, html) => {
        if(err) throw err;
        res.writeHead(200, { "Content-Type": "text/html" });
        res.write(html);
        res.end()
    })
}; 

app.get("/site_description", (req, res) => {
    display_html("../website/webpages/project_details/site_description.html", req, res);
})

app.get("/project_proposals", (req, res) => {
    display_html("../website/webpages/project_details/project_proposals.html", req, res);
})

app.get("/client_details", (req, res) => {
    display_html("../website/webpages/project_details/client_details.html", req, res);
})

app.get("/site_details", (req, res) => {
    display_html("../website/webpages/project_details/site_details.html", req, res);
})

app.get("/", (req, res) => {
    display_html("../website/webpages/menu.html", req, res);
})

// returns the js file for the webpage to use
app.get("/functions.js", (req, res) => {
    fs.readFile("../website/js/functions.js", (err, data) => {
        if (err) throw err;
        res.writeHead(200, { "Content-Type": "text/javascript" });
        res.write(data);
        res.end()
    })
})

// returns the stylesheet for the webpage to use
app.get("/stylesheet.css", (req, res) => {
    fs.readFile("../website/css/stylesheet.css", (err, data) => {
        if (err) throw err;
        res.writeHead(200, { "Content-Type": "text/css" });
        res.write(data);
        res.end();
    })
})

// allows the user to download the report
app.get("/download_report", (req, res) => {
    const file = "../report gen/generated_report_test.docx"
    res.download(file, (err) => {
        if (err) throw err;
    })
})

// returns the buttons elements for the webpage to use
app.get("/buttons.html", (req, res) => {
    fs.readFile("../website/elements/buttons.html", (err, data) => {
        if (err) throw err;
        res.writeHead(200, { "Content-Type": "text/html" });
        res.write(data);
        res.end();
    })
})

// returns the back button element for the webpage to use
app.get("/back.html", (req, res) => {
    fs.readFile("../website/elements/back.html", (err, data) => {
        if (err) throw err;
        res.writeHead(200, { "Content-Type": "text/html" });
        res.write(data);
        res.end();
    })
})

// returns the options elements for the webpage to use
app.get("/options.html", (req, res) => {
    fs.readFile("../website/elements/options.html", (err, data) => {
        if (err) throw err;
        res.writeHead(200, { "Content-Type": "text/html" });
        res.write(data);
        res.end();
    })
})

// clear the temp image folder on server start
clear_temp();

app.listen(port, () => console.log("Server listening on port:", port))