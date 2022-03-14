// utility function - allows program to 'sleep'
const sleep = (milli) => {
    return new Promise(resolve => {
        setTimeout(resolve, milli);
    });
}

// triggers the report generation program
const generate_report = () => {
    $.ajax({
        url: "gen_report",
        type: "GET",
        async: false,
        success:(res) =>{
            console.log("server response is:", res)
        },
        error:(err) => {
            console.error(err);
        }
    });
};

// sends the data to the server to be posted
const send_data = (array) => {
    $.ajax({
        url: "store_data", 
        type: "POST",
        data: JSON.stringify(array),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        async: false,
        success:(res) => {
            console.log("server response is:", res);
        },
        error:(err) => {
            console.error(err);
        }
    });

    get_store_JSON();
};

// get JSON object from the server, store in localStorage
const get_store_JSON = () => {
    $.ajax({
        url: "get_data",
        type: "GET",
        async: false,
        success: (res) => {
            localStorage.setItem("report_data", JSON.stringify(res));
        },
        error: (err) => {
            console.error(err)
        }
    })
};

const clear_localStore = () => {
    // possibly send the object to the server before clearing
    localStorage.clear();
    alert("Storage cleared");
}

const check_project_details = () => {
    let check_data = [
        "site_name",
        "site_address",
        "grid_ref",
        "dev_size",
        "units",
        "comiss_date",
        "client_name",
        "client_address",
        "proposals",
        "site_type",
        "position_1",
        "distance_major",
        "position_2",
        "major",
        "building_type",
        "building_use",
        "current_use",
        "arable",
        "buildings",
        "car_parks",
        "flowing",
        "grasslands",
        "hedgerows",
        "pasture",
        "railways",
        "roads",
        "scrubland",
        "standing",
        "woodland",
        "hardstanding"
    ]
    let data = JSON.parse(localStorage.getItem("report_data"));
    let completed = (data !== null);
    for(let key in data){
        if(check_data.includes(key))
            completed = (data[key].length !== 0);
        if(!completed)
            break;
    }
    return completed;
}

// generates the img tag and sets its properties
const create_image_preview = (data) => {
    let img = $("<img>", {
        id: "preview_" + data.imageName,
        class: "img-responsive img-rounded preview",
        src: data.imageUrl,
        alt: "image preview"
    });
    return img;
}