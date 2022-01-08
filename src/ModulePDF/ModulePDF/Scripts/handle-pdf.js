var pdfjsLib = window['pdfjs-dist/build/pdf'];

pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';

var pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null,
    scale = 1,
    canvas = $('#the-canvas')[0]
    ctx = canvas.getContext('2d'),
    pdfWidthFixed = 1170;

function renderPage(num) {
    pageRendering = true;

    pdfDoc.getPage(num).then(function(page) {
        var viewport = page.getViewport({ scale: scale });
        var reScale = viewport.width / pdfWidthFixed;
        if (viewport.width < pdfWidthFixed) {
            reScale = pdfWidthFixed / viewport.width;
        }
        viewport = page.getViewport({ scale: reScale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        $("#wrap-pdf").css({"width" : viewport.width, "height" : viewport.height });

        var renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        var renderTask = page.render(renderContext);

        renderTask.promise.then(function() {
            pageRendering = false;
            if (pageNumPending !== null) {

                renderPage(pageNumPending);
                pageNumPending = null;
            }
        });
    });

    $('.page-num').text(num);
    $('#the-canvas').css({ "border": "1px solid black" });
    getCommentPage();
}

function queueRenderPage(num) {
    if (pageRendering) {
        pageNumPending = num;
    } else {
        renderPage(num);
    }
    window.scrollTo(0, 0);
}

function onPrevPage() {
    if (pageNum <= 1) {
        return;
    }
    pageNum--;
    queueRenderPage(pageNum);
}

function onNextPage() {
    if (pageNum >= pdfDoc.numPages) {
        return;
    }
    pageNum++;
    queueRenderPage(pageNum);
}

pdfjsLib.getDocument(url).promise.then(function(pdfDoc_) {
    pdfDoc = pdfDoc_;
    $('.page-count').text(pdfDoc.numPages);

    renderPage(pageNum);
});

$(".btn-next").on("click", onNextPage);
$(".btn-prev").on("click", onPrevPage);

var posX = 0, posY = 0;
var idComment = 0;
var isAddNew = false;
var canSave = false;
var oldContent = null;
var showStatus = false;

$("#the-canvas").on("contextmenu", function (e) {
    e.preventDefault();

    if (!canSave) {
        posX = e.offsetX;
        posY = e.offsetY;
        $("#btn-add-comment").css("display", "block");
        $("#btn-del-comment").css("display", "none");
        $("#content-cmt").removeAttr("readonly");
        $("#content-cmt").val("");
        $("#content-cmt").focus();
        $("#btn-add-comment").attr("disabled", "true");
        $("#btn-del-comment").attr("disabled", "true");
        $("#context-menu").css({ "top": e.offsetY + "px", "left": e.offsetX + "px", "display": "block" });
        isAddNew = true;
    } else {
        warningEditting();
    }
});
$("body").on("keyup", function (e) {
    if (e.keyCode == 27) {
        if (!canSave) resetData();
        else warningEditting();
    }
});
$("#the-canvas").on("click", function (e) {
    if (!canSave) resetData();
    else warningEditting();
});
$("body").on("click", function (e) {
    if (!canSave) resetData();
    else warningEditting();
});
$("#btn-add-comment").on("click", function () {
    if ($("#content-cmt").val().length > 0) {
        if (idComment != 0 && canSave) {
            var url = "/api/Comments/" + idComment;
            var data = {
                IdComment: idComment,
                ContentCmt: $("#content-cmt").val(),
                IdUserCreate: $("#id-user-create").val()
            }
            fetch(url, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            }).then(function (res) {
                if (res.status == 200) {
                    resetData();
                    getCommentPage();
                }
            });
        }
        else if (isAddNew && canSave) {
            var url = "/api/Comments";
            var data = {
                ContentCmt: $("#content-cmt").val(),
                IdFilePDF: idFilePDF,
                IdUserCreate: $("#id-user-create").val(),
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
                $("#comment-wrap").append(html);
                addEventForCommentDiv();

                $("#comment-wrap").css("display", "block");
                $(".btn-show-cmt").text("Comment: On");
            })
        }
    }
});
$("#btn-del-comment").on("click", function () {
    if (idComment != 0 && !isAddNew) {
        var userCreate = $("#id-user-create").val();
        var url = "/api/Comments/" + idComment;
        var data = {
            IdUserCreate: userCreate
        }
        fetch(url, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }).then(function (res) {
            if (res.status == 200) {
                $("#" + idComment + "-" + userCreate).remove();
                resetData();
            }
        });
    } else {
        resetData();
    }
});
$(".btn-show-cmt").on("click", function () {
    if (!showStatus) {
        $("#comment-wrap").css("display", "block");
        $(this).text("Comment: On");
    } else {
        $("#comment-wrap").css("display", "none");
        $(this).text("Comment: Off")
    }
    resetData();
    showStatus = !showStatus;
})
$(".fa-window-close").on("click", function () { resetData() });
$("#context-menu").on("click", function (e) {
    e.stopPropagation();
});
function getCommentPage() {
    $("#comment-wrap").html("");

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
        $("#comment-wrap").html(html);

        addEventForCommentDiv();
        resetData();
    })
}
function addEventForCommentDiv() {
    $(".comments").on("contextmenu", function (e) {
        e.preventDefault();
        eventForCommentDiv(this);
    });
    $(".comments").on("click", function (e) {
        e.stopPropagation();
        eventForCommentDiv(this);
    });
}
function eventForCommentDiv(el) {
    if (!canSave) {
        var id = el.id.split("-");
        var idCmt = id[0];
        var userCreate = id[1];
        $("#content-cmt").val($(el).text().trim());
        isAddNew = false;
        if (userCreate == $("#id-user-create").val()) {
            $("#btn-add-comment").css("display", "block");
            $("#btn-del-comment").css("display", "block");
            $("#content-cmt").removeAttr("readonly");
            $("#content-cmt").focus();
            $("#btn-add-comment").attr("disabled", "true");
            $("#btn-del-comment").removeAttr("disabled");
            oldContent = $("#content-cmt").val();
            idComment = idCmt;
        } else {
            idComment = 0;
            oldContent = $("#content-cmt").val();
            $("#btn-add-comment").attr("disabled", "true")
            $("#btn-del-comment").attr("disabled", "true")
            $("#btn-add-comment").css("display", "none");
            $("#btn-del-comment").css("display", "none");
            $("#content-cmt").attr("readonly", "true");
        }
        $("#context-menu").css({ "top": $(el).css("top"), "left": $(el).css("left"), "display": "block" });
    } else {
        warningEditting();
    }
}
$("#content-cmt").on("keyup", function () {
    if ($(this).val() != oldContent) {
        canSave = true;
        $("#btn-add-comment").removeAttr("disabled");
    } else {
        canSave = false;
        $("#btn-add-comment").attr("disabled", "disabled");
    }
});
function warningEditting() {
    $("#context-menu").css({
        "animation": "blink 1s linear infinite"
    });
    setTimeout(function () {
        $("#context-menu").css("animation", "none");
    }, 600);
}
function resetData() {
    $("#context-menu").css("display", "none");
    $("#content-cmt").val("");
    idComment = 0;
    canSave = false;
    oldContent = null;
}
