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
        var title = $(this).data("title");
        var desc = $(this).data("desc");
        var mediaType = $(this).data("mediatype");

        $.get("https://images-api.nasa.gov/asset/" + nasaID).done(function(data) {
            populatePopup(data, title, desc, mediaType);
        });

    })

    $('.popup').on('click', '.popup__close', function() {
        $('.popupOverlay').css('display', 'none');
        clearPopup();
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
        var title = el.data[0].title;
        var desc = el.data[0].description;
        if (desc) {
            desc = desc.substring(0, 1000);
        }
        var nasaID = el.data[0].nasa_id;
        var mediaType = el.data[0].media_type;

        if (mediaType == "image") {
            imageResultHTML += '<div class="imageGrid__image" data-nasaID="' + nasaID + '" data-title="' + title + '" data-desc="' + desc + '" data-mediatype="' + mediaType + '"><img src="' + el.links[0].href + '" alt=""><div class="imageGrid__imageOverlay"><i class="fas fa-search-plus"></i></div></div>'
        } else if (mediaType == "audio") {
            imageResultHTML += '<div class="imageGrid__image" data-nasaID="' + nasaID + '" data-title="' + title + '" data-desc="' + desc + '" data-mediatype="' + mediaType + '"><div class="imageGrid__audioBlock">' + title + '<i class="fas fa-play"></i></div></div></div>'
        } else if (mediaType == "video") {
            imageResultHTML += '<div class="imageGrid__image" data-nasaID="' + nasaID + '" data-title="' + title + '" data-desc="' + desc + '" data-mediatype="' + mediaType + '"><div class="imageGrid__videoBlock">' + title + '<i class="fas fa-play"></i></div></div></div>'
        }
        
    });

    $('.imageGrid').html(imageResultHTML);
}

function populatePopup(assetData, title, desc, mediaType) {
    console.log(assetData);
    var popupHTML = "";
    var imgSrc = assetData.collection.items[3].href;

    var audioSrcmp3 = assetData.collection.items[0].href;
    var audioSrcm4a = assetData.collection.items[1].href;

    var videoSrc = assetData.collection.items[0].href;

    if (mediaType == "image") {
        popupHTML = "<div class='popup__close'><i class='far fa-times-circle'></i></div><h2 class='popup__assetTitle'>" + title + "</h2><p class='popup__assetDesc'>" + desc + "</p><img src='" + imgSrc + "' alt='' class='popup__assetImage'>"
    } else if (mediaType == "audio") {
        popupHTML = "<div class='popup__close'><i class='far fa-times-circle'></i></div><h2 class='popup__assetTitle'>" + title + "</h2><p class='popup__assetDesc'>" + desc + "</p><audio controls class='popup__assetAudio'><source src='" + audioSrcm4a + "' type='audio/m4a'><source src='" + audioSrcmp3 + "' type='audio/mpeg'>Your browser does not support the audio element.</audio>"
    } else if (mediaType == "video") {
        popupHTML = "<div class='popup__close'><i class='far fa-times-circle'></i></div><h2 class='popup__assetTitle'>" + title + "</h2><p class='popup__assetDesc'>" + desc + "</p><video controls class='popup__assetVideo'><source src='" + videoSrc + "' type='video/mp4'>Your browser does not support the video tag.</video>"
    } 

    $('.popup').html(popupHTML);

    $('.popupOverlay').css('display', 'flex');
}

function clearPopup() {
    $('.popup').html("");
}