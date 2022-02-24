import express from "express";
import { spawn } from "child_process";
import fs, { PathOrFileDescriptor } from "fs";
const app: Application = express()
const port: number = 3000
import bodyParser from "body-parser";
import multer from "multer";
import favicon from 'serve-favicon';
import sharp from "sharp";
import path from "path";
import { Application } from "express-serve-static-core";

app.use(bodyParser.json());
app.use(favicon("favicon.ico"));
app.use("/report_gen/img", express.static("../report_gen/img"));

// used to add data to the json file
app.post("/store_data", (req, res): void => {
    let json = req.body;
    console.log(json);

    // need to make a system for naming the JSON files
    // when report is created, ask for a report name?
    try{
        if(fs.existsSync("data.json")){
            let file_raw = fs.readFileSync("data.json");
            let file = JSON.parse(file_raw.toString());
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
    
    res.end();
})

// used to generate the report
app.get("/gen_report", (req, res): void => {
    let data_to_send: string;

    // new child process to run the python script
    const python = spawn("python", ["../report_gen/generator.py"]);

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
        res.send(JSON.stringify(data_to_send));
        res.end();
    });
})

const upload = multer({
    dest: "temp/"
});

// image compression when uploading a file
app.post("/compress_image", upload.single("upload"), (req, res): void => {
    let filepath = req.file.path;
    let output = "../report_gen/img/" + req.file.originalname;

    sharp(filepath)
    .jpeg({mozjpeg: true, quality: 40})
    .toFile(output)
    .then(() => {
        res.status(200).json({
            "imageName" : req.file.originalname,
            "imageUrl"  : output
        })
    })
    .catch(err => {
        console.error(err);
    })
})

// clears the temp image folder
const clear_temp = (): void => {
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
const display_html = (filename: PathOrFileDescriptor, req, res): void => {
    fs.readFile((filename), (err, html) => {
        if(err) throw err;
        res.writeHead(200, { "Content-Type": "text/html" });
        res.write(html);
        res.end();
    })
}; 

app.get("/site_description", (req, res): void => {
    display_html("../website/webpages/project_details/site_description.html", req, res);
})

app.get("/project_proposals", (req, res): void => {
    display_html("../website/webpages/project_details/project_proposals.html", req, res);
})

app.get("/client_details", (req, res): void => {
    display_html("../website/webpages/project_details/client_details.html", req, res);
})

app.get("/site_details", (req, res): void => {
    display_html("../website/webpages/project_details/site_details.html", req, res);
})

app.get("/results_menu", (req, res): void => {
    display_html("../website/webpages/results/results_menu.html", req, res);
})

app.get("/exterior", (req, res): void => {
    display_html("../website/webpages/results/exterior.html", req, res);
})

app.get("/", (req, res): void => {
    display_html("../website/webpages/menu.html", req, res);
})

// returns the js file for the webpage to use
app.get("/functions.js", (req, res): void => {
    fs.readFile("../website/js/functions.js", (err, data) => {
        if (err) throw err;
        res.writeHead(200, { "Content-Type": "text/javascript" });
        res.write(data);
        res.end()
    })
})

// returns the stylesheet for the webpage to use
app.get("/stylesheet.css", (req, res): void => {
    fs.readFile("../website/css/stylesheet.css", (err, data) => {
        if (err) throw err;
        res.writeHead(200, { "Content-Type": "text/css" });
        res.write(data);
        res.end();
    })
})

// allows the user to download the report
app.get("/download_report", (req, res): void => {
    const file = "../report_gen/generated_report_test.docx"
    res.download(file, (err) => {
        if (err) throw err;
    })
})

const serve_element = (filename: string, filetype: string, req, res) => {
    fs.readFile(filename, (err, data) => {
        if (err) throw err;
        res.writeHead(200, { "Content-Type": filetype });
        res.write(data);
        res.end();
    })
}

// returns the buttons elements for the webpage to use
app.get("/buttons.html", (req, res): void => {
    serve_element("../website/elements/buttons.html", "text/html", req, res);
})

// returns the back button element for the webpage to use
app.get("/back.html", (req, res): void => {
    serve_element("../website/elements/back.html", "text/html", req, res);
})

// returns the evidence options elements for the webpage to use
app.get("/bat_evidence_options.html", (req, res): void => {
    serve_element("../website/elements/bat_evidence_options.html", "text/html", req, res);
})

// returns the options elements for the webpage to use
app.get("/options.html", (req, res): void => {
    serve_element("../website/elements/options.html", "text/html", req, res);
})

app.get("/image_upload.html", (req, res): void => {
    serve_element("../website/elements/image_upload.html", "text/html", req, res);
})

// clear the temp image folder on server start
clear_temp();

app.listen(port, ():void => {
    console.log("Server listening on port:", port);
})