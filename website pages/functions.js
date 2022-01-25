let header = new Headers();
header.append("Content-Type", "text/jacascript");

// triggers the report generation program
const generate_report = () => {
    $.ajax({
        url: "test_2",
        type: "GET",
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
        url: "test_1", 
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
