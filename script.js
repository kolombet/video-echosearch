var ajax = {};
ajax.x = function() {
    try {
        return new ActiveXObject('Msxml2.XMLHTTP')
    } catch (e1) {
        try {
            return new ActiveXObject('Microsoft.XMLHTTP')
        } catch (e2) {
            return new XMLHttpRequest()
        }
    }
};

ajax.send = function(url, callback, method, data, sync) {
    var x = ajax.x();
    x.open(method, url, sync);
    x.onreadystatechange = function() {
        if (x.readyState == 4) {
            callback(x.responseText)
        }
    };
    if (method == 'POST') {
        x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    }
    x.send(data)
};

ajax.get = function(url, data, callback, sync) {
    var query = [];
    for (var key in data) {
        query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    }
    ajax.send(url + '?' + query.join('&'), callback, 'GET', null, sync)
};

ajax.post = function(url, data, callback, sync) {
    var query = [];
    for (var key in data) {
        query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    }
    ajax.send(url, callback, 'POST', query.join('&'), sync)
};

////////////////////////////////////////////////////////////////////////

function reqVideos() {
    var videoCountTF = document.getElementById("video_count");
    var currentPageTF = document.getElementById("current_page");

    var reqVars = {
        "start" : (currentPageTF.value - 1) * videoCountTF.value,
        "count" : videoCountTF.value
    }

    document.getElementById("search_result").innerHTML = "Загружаю ссылки...";
    
    console.log("req videos id: " + JSON.stringify(reqVars))
    ajax.get("http://"+ location.host +"/video_get.php", reqVars, onVideosGet, true);
}

function onVideosGet(res) {
    var videos = JSON.parse(res);
    videoLinks = videos;
    //console.log(res)
    document.getElementById("search_result").innerHTML = "Видео не найдено";
    console.log(videos.length);

    showVideos(videoLinks, currentType);
}

function removeAllVideos() {
    var videoCont = document.getElementById("video_container");
    while (videoCont.firstChild) {
        var el = videoCont.removeChild(videoCont.firstChild);
        el.innerHTML = "";
        delete el;
    }
}

function showVideos(videos, type) {
    removeAllVideos();

    videos.forEach(function(video) {
        if (type == 'pirate' && video.check_result != 1) 
            return;
        else if (type == 'other' && video.check_result == 1)
            return;


        if (video != null) {
            //Generating results DOM
            var oImg=document.createElement("img");
            oImg.setAttribute('src', video.photo);
            oImg.setAttribute('alt', video.unic_id);
            oImg.setAttribute('class', getTokyoCabStatus(video));
            oImg.setAttribute('title', "Айди видео" + video.unic_id + " " 
                + getCheckResultInfo(video.check_result) + " " + video.e_status);

            var link = document.createElement("a");
            var linkHref = "http://vk.com/video" + video.owner_id + "_" + video.id;
            link.setAttribute('href', linkHref);
            link.appendChild(oImg);

            document.getElementById("video_container").appendChild(link);
        }
    });

    document.getElementById("search_result").innerHTML = "Загружено!"; 

    //Сохраняю номер страницы
    localStorage.setItem('currentPageTF', document.getElementById("current_page").value);
}

function getNodeStatus(video) {
    if (video.e_status && video.e_status.length > 0) {
        if (video.e_status == 'NO_RESULTS_HISTOGRAM_DECREASED' ||
            video.e_status =='MULTIPLE_BAD_HISTOGRAM_MATCH') {
            return "GOOD_VIDEO"
        } else if ( 
                    video.e_status == 'MULTIPLE_GOOD_MATCH_HISTOGRAM_DECREASED' ||
                    video.e_status == 'MULTIPLE_GOOD_MATCH'||
                    video.e_status == 'MULTIPLE_GOOD_MATCH_HISTOGRAM_INCREASED'||
                    video.e_status =='SINGLE_GOOD_MATCH'||
                    video.e_status == 'SINGLE_GOOD_MATCH_HISTOGRAM_DECREASED'
                   ) {
            return "BAD_VIDEO"
        } else {
            return "STRANGE_VIDEO"
        }
    } else if (check_result == 0) {
        return "NOT_CHECKED"
    } else if ( check_result == 3 || check_result == 4 || 
                check_result == 5 || check_result == 6) {
        return "CAN_NOT_CHECK"
    }
}

function getTokyoCabStatus(video) {
    if (video.check_result == 1) {

        return "BAD_VIDEO"
    } else if (video.check_result == 2) {
        if (video.e_status == "no results found (type 7)")
            return "GOOD_VIDEO"
        else (video.e_status == "query code length is too small")
            return "CAN_NOT_CHECK"
    } else if ( video.check_result == 3 || video.check_result == 4 || 
                video.check_result == 5 || video.check_result == 6) {
        return "CAN_NOT_CHECK" 
    }
    else if (!video.check_result) 
        return "NOT_CHECKED"
    else
        return "STRANGE_VIDEO"
}

function getCheckResultInfo(check_result) {
    var check_result_text = "";
    if (check_result == 0) {
        check_result_text = "Видео файл еще не проверен";
    } else if (check_result == 1 || check_result == 2) {
        check_result_text = "Видео успешно проверено";
    } else if (check_result == 3) {
        check_result_text = "Пользователь загрузивший видео удален";
    } else if (check_result == 4) {
        check_result_text = "Не удалось получить коды из видео. Возможно файл слишком короткий";
    } else if (check_result == 5) {
        check_result_text = "Видео удалено правообладателем";
    } else if (check_result == 6) {
        check_result_text = "Видео удалено. Редирект на страницу пользователя";
    }
    return check_result_text;
}

function onPageLoad() {
    var videoCountTF = document.getElementById("video_count");
    var currentPageTF = document.getElementById("current_page");
    var refreshBtn = document.getElementById("refresh_button");
    var backBtn = document.getElementById("back_button");
    var forwBtn = document.getElementById("forw_button");
    var selectStatus = document.getElementById("select_status");

    selectStatus.onchange=function(){ //run some code when "onchange" event fires
        currentType = this.options[this.selectedIndex].value;
        console.log("choosed option: " + currentType);
        showVideos(videoLinks, currentType);
    }

    videoCountTF.oninput = reqVideos;
    currentPageTF.oninput = reqVideos;
    refreshBtn.onclick = reqVideos;
    backBtn.onclick = function () {
        if (document.getElementById("current_page").value > 1) {
            var cur = document.getElementById("current_page").value--;
            reqVideos();
        }
    }
    forwBtn.onclick = function () {
        var cur = document.getElementById("current_page").value++;
        reqVideos();
    }

    if (localStorage.getItem('currentPageTF') == null)
        currentPageTF.value = 1;
    else 
        currentPageTF.value = localStorage.getItem('currentPageTF');
    
    videoCountTF.value = 500;

    reqVideos();
}

window.onload = onPageLoad;
var videoLinks;
var currentType = 'all';

