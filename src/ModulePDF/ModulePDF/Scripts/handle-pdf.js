var posX = 0, posY = 0;
var idComment = 0;
var isAddNew = false;
var canSave = false;
var oldContent = "";
var showStatus = false;

$("body").on("keyup", function (e) {
    if (e.keyCode == 27) {
        if (!canSave) resetData();
        else warningEditting();
    }
});
$("body").on("click", function (e) {
    if (!canSave) resetData();
    else warningEditting();
});
$(".btn-show-cmt").on("click", function () {
    console.log("btn-show-cmt click");
    if (!showStatus) {
        $(".comment-wrap").css("display", "block");
        $(this).addClass("toggled");
        $("#pageRotateCw")[0].disabled = true;
        $("#pageRotateCcw")[0].disabled = true;
    } else {
        $(".comment-wrap").css("display", "none");
        $(this).removeClass("toggled");
        $("#pageRotateCw")[0].disabled = false;
        $("#pageRotateCcw")[0].disabled = false;
    }
    resetData();
    showStatus = !showStatus;
})
function addContextMenu(parent) {
    $("#context-menu").remove();
    var menu = `<div id="context-menu">
                    <textarea id="content-cmt"></textarea>
                    <i class="fas fa-window-close"></i>
                    <div class="action-btn">
                        <button id="btn-add-comment"><i class="fas fa-save"></i></button>
                        <button id="btn-del-comment"><i class="fas fa-trash"></i></button>
                    </div>
                </div>`;
    parent.append(menu);

    // add event for contextmenu
    $(".fa-window-close").on("click", function () {
        console.log(".fa-window-close click");
        resetData()
    });
    $("#context-menu").on("click", function (e) {
        console.log("#context-menu click");
        e.stopPropagation();
    });
    $("#content-cmt").on("keyup", function () {
        console.log("#content-cmt keyup");
        if ($(this).val() != oldContent) {
            canSave = true;
            $("#btn-add-comment").removeAttr("disabled");
        } else {
            canSave = false;
            $("#btn-add-comment").attr("disabled", "disabled");
        }
    });
    $("#btn-add-comment").on("click", function () {
        console.log("#btn-add-comment");
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
                var pageNum = parseInt($("#pageNumber").val());
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
                    getCommentPage();
                })
            }
        }
    });
    $("#btn-del-comment").on("click", function () {
        console.log("#btn-del-comment");
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
}

function addEventForCanvas() {
    console.log("add event");
    $(".comment-wrap").unbind("contextmenu");
    $(".comment-wrap").on("contextmenu", function (e) {
        e.preventDefault();

        if (!canSave) {

            addContextMenu($(this));

            var computeStyle = getComputedStyle(document.documentElement);
            var scale = computeStyle.getPropertyValue("--zoom-factor");
            console.log('scale', scale);
            posX = Math.round(e.offsetX / scale);
            posY = Math.round(e.offsetY / scale);
            var hColor = (parseInt($("#id-user-create").val()) % 1000 + 1) * 36;
            var bgColor = 'hsl(' + hColor + 'deg 81% 55%);'
            console.log(bgColor);
            $("#context-menu").css({
                "top": e.offsetY + "px",
                "left": e.offsetX + "px",
                "display": "block",
                "border": "1px solid " + bgColor
            });
            $("#btn-add-comment").css("display", "block");
            $("#btn-del-comment").css("display", "none");
            $("#content-cmt").removeAttr("readonly");
            $("#content-cmt").val("");
            $("#content-cmt").focus();
            $("#btn-add-comment").attr("disabled", "true");
            $("#btn-del-comment").attr("disabled", "true");
            console.log(e);
            isAddNew = true;
            idComment = 0;
        } else {
            warningEditting();
        }
    });

    $(".comment-wrap").unbind("click");
    $(".comment-wrap").on("click", function (e) {
        if (!canSave) resetData();
        else warningEditting();
    });
}

function getCommentPage(...num) {
    var page = parseInt($("#pageNumber").val());
    if (num.length > 0) {
        page = num[0];
    }
    console.log(page);
    $("#comment-wrap-" + page).html("");

    var url = "/api/Comments/" + idFilePDF + "/" + page;
    fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }).then(function (res) {
        return res.json();
    }).then(function (data) {

        var html = "";
        var computeStyle = getComputedStyle(document.documentElement);
        var scale = computeStyle.getPropertyValue("--zoom-factor");
        console.log('scale', scale);
        data.forEach(item => {
            var top = (scale * parseInt(item.PositionY)) + "px";
            var left = (scale * parseInt(item.PositionX)) + "px";
            var id = item.IdComment + "-" + item.IdUserCreate;
            var hColor = ((item.IdUserCreate%1000 + 1)*36);
            var bgColor = 'hsl('+ hColor  +'deg 81% 55%);'
            html += `<div class="comments" id="${id}" style="top: ${top}; left: ${left}; background-color: ${bgColor} ">
                            ${item.ContentCmt}
                    </div>`;
        });
        var show = showStatus ? "block" : "none";
        $("#comment-wrap-" + page).css("display", show);
        $("#comment-wrap-" + page).html(html);

        addEventForCommentDiv();
        resetData();
    })
}
$("#next").on("click", function () { getCommentPage(parseInt($("#pageNumber").val()) + 1);  });
$("#previous").on("click", function () { getCommentPage(parseInt($("#pageNumber").val()) - 1); });
$("#pageNumber").on("change", function () {
    console.log("pagenum: change");
    getCommentPage($(this).val());
});
function addEventForCommentDiv() {
    $(".comments").unbind("contextmenu");
    $(".comments").on("contextmenu", function (e) {
        console.log("contextmenu comment");
        e.preventDefault();
        e.stopPropagation();
        eventForCommentDiv(this);
    });
    $(".comments").unbind("click");
    $(".comments").on("click", function (e) {
        console.log("click comment");
        e.stopPropagation();
        eventForCommentDiv(this);
    });
}
function eventForCommentDiv(el) {
    if (!canSave) {
        var id = el.id.split("-");
        var idCmt = id[0];
        var userCreate = id[1];

        addContextMenu($(el).parent(".comment-wrap"));

        var computeStyle = getComputedStyle(el);
        var hColor = computeStyle.getPropertyValue("background-color");
        $("#context-menu").css({
            "top": $(el).css("top"),
            "left": $(el).css("left"),
            "display": "block",
            "border-color": hColor
        });
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
    } else {
        warningEditting();
    }
}

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
    oldContent = "";
}
