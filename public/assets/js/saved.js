$(document).foundation();

$(function  () {
    $('.noteBtn').on('click', function() {

        $("#existNote").empty();

        var articleId = $(this).attr("data-id");
        console.log(articleId);

        $.ajax({
            method: "GET",
            url: "/articles/" + articleId
        })
        .then(function (data) {

            var noteId = data.note._id;

            console.log(noteId);

            $("#existNote").append("<strong>" + data.note.title + "</strong>" + "<br>" + data.note.body + " <br> <button class = 'button' id = 'noteDelete' data-id = '" + noteId + " '> Delete </button>")
            
        });

        $('#articleId').attr("data-id", articleId);
        $('#exampleModal1').foundation('open');
        
    });

    $(document).on('click', "#noteDelete", function() {

        var noteId = $(this).attr("data-id");

        console.log("This note is" + noteId);
    
        $.ajax({
            method: "DELETE",
            url: "/notes/" + noteId
        })
        .then(function(data) {
            console.log("Note" + noteId + "deleted.")
    
            location.reload();
        });
        
    });

    $('#createNote').on('submit', function(event) {
        event.preventDefault()

        var id = $("#articleId").attr("data-id");
        var title = $("#noteTitle").val().trim();
        var body = $("#noteBody").val().trim();

        var newNote = {
            title: title,
            body: body
        };

        $.ajax({
            method: "POST",
            url: "/articles/" + id,
            data: newNote
        })
        .then(function(data) {
            console.log(data.note);

            $("#noteTitle").val("");
            $("#noteBody").val("");

            location.reload();
        });

    });

    $(".unsave").on("click", function() {

        var id = $(this).data("id");

        console.log(id);

        var newSaveState = {
            saved: false
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




