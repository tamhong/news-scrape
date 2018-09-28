$(function () {
    $("#scrapeBtn").on("click", function () {

        $.ajax("/scrape", {
            type: "GET"
        }).then(function(res) {
            location.reload();
        });
    });

    $(".saveArt").on("click", function() {

        var id = $(this).data("id");

        console.log(id);

        var newSaveState = {
            saved: true
        }

        $.ajax("/articles/" + id, {
            type: "PUT",
            data: newSaveState
        }).then(function(data) {
            console.log(data)
            location.reload();
        });
    });
});