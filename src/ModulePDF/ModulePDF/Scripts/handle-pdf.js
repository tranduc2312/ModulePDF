var posX = 0, posY = 0;
// var canvas = document.getElementById("the-canvas");
var menu = $("#contextmenu");//document.getElementById("contextmenu");
//var cmt = document.getElementById("addComment");
//var wrap = document.getElementById("wrap");

$("#the-canvas").on("contextmenu", function(e) {
    e.preventDefault();
    
    if ($("#contentCmt").val().length == 0) {
        posX = e.offsetX;
        posY = e.offsetY;
        menu.css({ "top": e.offsetY + "px", "left": e.offsetX + "px", "display": "block" });
        $("#addComment").css("display", "block");
        $("#delComment").css("display", "block");
        $("#contentCmt").removeAttr("readonly");
        $("#contentCmt").val("");
        $("#contentCmt").focus();
    }
});

$("body").on("keyup", function(e) {
    if (e.keyCode == 27) {
        resetData();
    }
});
var idComment = 0;
$("#addComment").on("click", function () {
    if ($("#contentCmt").val().length > 0) {
        if (idComment == 0) {
            var url = "/api/Comments";
            var data = {
                ContentCmt: $("#contentCmt").val(),
                IdFilePDF: idFilePDF,
                IdUserCreate: $("#idUserCreate").val(),
                PageNumber: pageNum,
                PositionX: posX,
                PositionY: posY,
                DeleteFlag: '0'
            }
            fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            }).then(function (res) {
                return res.json();
            }).then(function (item) {
                resetData();
                var top = item.PositionY + "px";
                var left = item.PositionX + "px";
                var id = item.IdComment + "-" + item.IdUserCreate;
                var html = "";
                html += `<div class="comments" id="${id}" style="top: ${top}; left: ${left} ">
                                    ${item.ContentCmt}
                            </div>`;
                $("#commentdiv").append(html);
                addEventForCommentDiv();
            })
        }
        else {
            var url = "/api/Comments/" + idComment;
            var data = {
                IdComment: idComment,
                ContentCmt: $("#contentCmt").val()
            }
            fetch(url, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            }).then(function (res) {
                resetData();
                getCommentPage();
            })
        }

    }
});

$("#delComment").on("click", function() {
    if (idComment != null && idComment != "") {
        var url = "/api/Comments/" + idComment;
        fetch(url, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        }).then(function (res) {
            return res.text();
        }).then(function (item) {
            $("#" + idComment + "-" + $("#idUserCreate").val()).remove();
            resetData();
        });
    }
});

var showStatus = false;
$(".showCmt").on("click", function() {
    if (!showStatus) {
        $("#commentdiv").css("display","block");
        $(".showCmt").text("Comment: On");
    } else {
        $("#commentdiv").css("display","none");
        $(".showCmt").text("Comment: Off")
    }
    resetData();
    showStatus = !showStatus;
})

$(".fa-window-close").on("click", function() { resetData() });
$("#contentCmt").on("click", function(e) { e.preventDefault() });

//function addMultipleEventsListener(element, ...events) {
//    for (var i = 0; i < events.length; i++) {
//        element.addEventListener(events[i], function() {
//            resetData();
//        });
//    }
//}
// addMultipleEventsListener(canvas, 'click');
// addMultipleEventsListener(document.body, 'click');

function getCommentPage() {
    $("#commentdiv").html("");

    var url = "/api/Comments/" + idFilePDF + "/" + pageNum;
    fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }).then(function (res) {
        return res.json();
    }).then(function (data) {

        var html = "";
        data.forEach(item => {
            var top = item.PositionY + "px";
            var left = item.PositionX + "px";
            var id = item.IdComment + "-" + item.IdUserCreate;
            html += `<div class="comments" id="${id}" style="top: ${top}; left: ${left} ">
                            ${item.ContentCmt}
                    </div>`;
        });
        $("#commentdiv").html(html);

        addEventForCommentDiv();
        resetData();
    })
}

function addEventForCommentDiv() {
    $(".comments").on("contextmenu", function(e) {
        e.preventDefault();
        var id = this.id.split("-");
        var idCmt = id[0];
        var userCreate = id[1];
        menu.css({ "top": $(this).css("top"), "left": $(this).css("left"), "display": "block" });
        $("#contentCmt").val($(this).text().trim());
        if (userCreate == $("#idUserCreate").val()) {
            $("#addComment").css("display", "block");
            $("#delComment").css("display", "block");
            $("#contentCmt").removeAttr("readonly");
            $("#contentCmt").focus();
            $("#contenCmt").scrollTop();
            idComment = idCmt;
        } else {
            $("#addComment").css("display", "none");
            $("#delComment").css("display", "none");
            $("#contentCmt").attr("readonly", "true");
        }
    });
}

function resetData() {
    menu.css("display", "none");
    $("#contentCmt").val("");
    idComment = 0;
}

// If absolute URL from the remote server is provided, configure the CORS
// header on that server.
var url1 = 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf';

// Loaded via <script> tag, create shortcut to access PDF.js exports.
var pdfjsLib = window['pdfjs-dist/build/pdf'];

// The workerSrc property shall be specified.
pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';

var pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null,
    scale = 2,
    canvas = document.getElementById('the-canvas'),
    ctx = canvas.getContext('2d');

/**
 * Get page info from document, resize canvas accordingly, and render page.
 * param num Page number.
 */
function renderPage(num) {
    pageRendering = true;
    // Using promise to fetch the page
    pdfDoc.getPage(num).then(function(page) {
        var viewport = page.getViewport({scale: scale});
        //if (viewport > 1170) {
        //    scale = 1170 / viewport ;
        //}
        //else {
        //    scale = viewport / 1170;
        //}
        viewport = page.getViewport({scale: scale});
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        $("#wrap").css({"width":viewport.width,"height":viewport.height});

        // Render PDF page into canvas context
        var renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        var renderTask = page.render(renderContext);

        // Wait for rendering to finish
        renderTask.promise.then(function() {
            pageRendering = false;
            if (pageNumPending !== null) {
                // New page rendering is pending
                renderPage(pageNumPending);
                pageNumPending = null;
            }
        });
    });

    // Update page counters
    document.querySelectorAll('.page_num').forEach(v => {v.textContent = num });
    getCommentPage();
}

/**
 * If another page rendering in progress, waits until the rendering is
 * finised. Otherwise, executes rendering immediately.
 */
function queueRenderPage(num) {
    if (pageRendering) {
        pageNumPending = num;
    } else {
        renderPage(num);
    }
    window.scrollTo(0, 0);
}

/**
 * Displays previous page.
 */
function onPrevPage() {
    if (pageNum <= 1) {
        return;
    }
    pageNum--;
    queueRenderPage(pageNum);
}
document.querySelectorAll('.prev').forEach(v => {v.addEventListener('click', onPrevPage)});

/**
 * Displays next page.
 */
function onNextPage() {
    if (pageNum >= pdfDoc.numPages) {
        return;
    }
    pageNum++;
    queueRenderPage(pageNum);
}
document.querySelectorAll('.next').forEach(v => {v.addEventListener('click', onNextPage)});

/**
 * Asynchronously downloads PDF.
 */
pdfjsLib.getDocument(url).promise.then(function(pdfDoc_) {
    pdfDoc = pdfDoc_;
    document.querySelectorAll('.page_count').forEach(v => {v.textContent = pdfDoc.numPages});

    // Initial/first page rendering
    renderPage(pageNum);
});
