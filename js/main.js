$( document ).ready(function() {
    $('#imageCheckLabel, #imageCheckFake').on('click', function() {
        $('#imageCheckFake').toggleClass('checked');
    });

    $('#audioCheckLabel, #audioCheckFake').on('click', function() {
        $('#audioCheckFake').toggleClass('checked');
    });

    $('#videoCheckLabel, #videoCheckFake').on('click', function() {
        $('#videoCheckFake').toggleClass('checked');
    });

    $('.searchBox__icon').on('click', function() {
        searchRequested()
    });

    $('.searchBox__text').on('keyup', function(event) {
        if (event.keyCode === 13) {
            searchRequested()
        }
    })

    $('.imageGrid').on('click', '.imageGrid__image', function() {
        var nasaID = $(this).data("nasaid");
        var title = $(this).data("title");;
        var desc = $(this).data("desc");;

        clearPopup();

        $.get("https://images-api.nasa.gov/asset/" + nasaID).done(function(data) {
            populatePopup(data, title, desc);
        });

    })

    $('.popup__close').on('click', function() {
        $('.popupOverlay').css('display', 'none');
    })
    
});

function searchRequested() {
    var optionsResponse = checkOptions();

    if (optionsResponse.valid == true) {
        var options = getOptions();
        $('.searchBox__userNotification').hide();
        searchNasa(options);
    } else {
        notifyUser(optionsResponse.msg);
    }
}

function checkOptions() {
    var response = {valid: true, msg: ""};

    if ($('.searchBox__text').val() == "")  {
        response.valid = false;
        response.msg = "Please enter something in the search box.";
    } else if ($('#imageCheckFake').hasClass('checked') || $('#audioCheckFake').hasClass('checked') || $('#videoCheckFake').hasClass('checked')) {

    } else {
        response.valid = false;
        response.msg = "Please select a search option.";
    }

    return response;
}

function notifyUser(msg) {
    $('.searchBox__userNotification').text(msg);
    $('.searchBox__userNotification').show();
}

function getOptions() {
    var response = {image: false, audio: false, video: false}

    if ($('#imageCheckFake').hasClass('checked')) {
        response.image = true;
    }

    if ($('#audioCheckFake').hasClass('checked')) {
        response.audio = true;
    }

    if ($('#videoCheckFake').hasClass('checked')) {
        response.video = true;
    }

    return response;
}

function searchNasa(options) {
    var searchTerm = $('.searchBox__text').val();
    var mediaTypes = "";

    if (options.image == true) {
        mediaTypes += "image,"
    }
    if (options.audio == true) {
        mediaTypes += "audio,"
    }
    if (options.video == true) {
        mediaTypes += "video,"
    }

    $.get("https://images-api.nasa.gov/search?q="+ searchTerm + "&media_type=" + mediaTypes, function(data, status){

        generateGridOutput(data);
        
    });
}

function generateGridOutput(data) {
    var imageResultHTML = "";

    $(data.collection.items).each(function(index, el){

        if (el.data[0].media_type == "image") {
            imageResultHTML += '<div class="imageGrid__image" data-nasaID="' + el.data[0].nasa_id + '" data-title="' + el.data[0].title + '" data-desc="' + el.data[0].description + '"><img src="' + el.links[0].href + '" alt=""><div class="imageGrid__imageOverlay"><i class="fas fa-search-plus"></i></div></div>'
        } else if (el.data[0].media_type == "audio") {
            imageResultHTML += '<div class="imageGrid__image" data-nasaID="' + el.data[0].nasa_id + '" data-title="' + el.data[0].title + '" data-desc="' + el.data[0].description + '"><div class="imageGrid__audioBlock">' + el.data[0].title + '<i class="fas fa-play"></i></div></div></div>'
        } else if (el.data[0].media_type == "video") {
            imageResultHTML += '<div class="imageGrid__image" data-nasaID="' + el.data[0].nasa_id + '" data-title="' + el.data[0].title + '" data-desc="' + el.data[0].description + '"><div class="imageGrid__videoBlock">' + el.data[0].title + '<i class="fas fa-play"></i></div></div></div>'
        }
        
    });

    $('.imageGrid').html(imageResultHTML);
}

function populatePopup(assetData, title, desc) {

    //TODO Output audio and video assets depending on media type
    var asset = assetData.collection.items[3].href;
        
    $('.popup__assetImage').attr("src", asset);

    $('.popup__assetTitle').text(title);
    $('.popup__assetDesc').text(desc);

    $('.popupOverlay').css('display', 'flex');
}

function clearPopup() {
    $('.popup__assetTitle').text("");
    $('.popup__assetDesc').text("");
    $('.popup__assetImage').attr("src", "");
}