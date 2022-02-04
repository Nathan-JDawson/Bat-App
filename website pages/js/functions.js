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
        success:function(res){
            console.log("server response is:", res);
        },
        error:function(err){
            console.error(err);
        }
    });
};
