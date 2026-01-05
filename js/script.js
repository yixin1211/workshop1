
var apiBaseUrl = "https://localhost:7246"; 

var state = "";
var stateOption = {
    "add": "add",
    "update": "update"
};



$(function () {
    // 1. 初始化所有元件 (下拉選單、日期、Grid)
    registerRegularComponent();

    // 2. 初始化新增/修改視窗
    $("#book_detail_area").kendoWindow({
        width: "1200px",
        title: "新增書籍",
        visible: false,
        modal: true,
        actions: ["Close"]
    }).data("kendoWindow").center();

    // 3. 初始化驗證器
    $("#book_detail_area").kendoValidator({
        messages: { required: "此欄位為必填" }
    });

    // 4. 初始化借閱紀錄視窗
    $("#book_record_area").kendoWindow({
        width: "700px",
        title: "借閱紀錄",
        visible: false,
        modal: true,
        actions: ["Close"]
    }).data("kendoWindow").center();
    

  

    // [新增按鈕]
    $("#btn_add_book").click(function (e) {
        e.preventDefault();

        // 清除紅字與紅框
        var validator = $("#book_detail_area").data("kendoValidator");
        if (validator) validator.hideMessages();
        $(".k-invalid").removeClass("k-invalid");

        state = stateOption.add;
        setStatusKeepRelation(); // 設定欄位連動

        $("#btn-save").show(); 
        
        // 解鎖所有欄位
        $(".k-textbox, .k-textarea").prop("disabled", false);
        $("#book_class_d").data("kendoDropDownList").enable(true);
        $("#book_bought_date_d").data("kendoDatePicker").enable(true); 
        $("#book_status_d").data("kendoDropDownList").enable(true);
        $("#book_keeper_d").data("kendoDropDownList").enable(true);

        // 清空欄位
        $("#book_id_d").val("");
        $("#book_name_d").val("");
        $("#book_author_d").val("");
        $("#book_publisher_d").val("");
        $("#book_note_d").val("");
        
        // 預設值
        $("#book_class_d").data("kendoDropDownList").select(0);
        $("#book_status_d").data("kendoDropDownList").value("A"); // 預設可借出
        $("#book_keeper_d").data("kendoDropDownList").value("");
        $("#book_bought_date_d").data("kendoDatePicker").value(new Date());

        // 圖片重置
        $("#book_image_d").attr("src", "image/optional.jpg");

        $("#book_detail_area").data("kendoWindow").title("新增書籍").open();
    });

    // [查詢按鈕]
    $("#btn_query").click(function (e) {
        e.preventDefault();
        queryBook();
    });

    // [清除按鈕]
    $("#btn_clear").click(function (e) {
        e.preventDefault();
        clear();
    });

    // [存檔按鈕]
    $("#btn-save").click(function (e) {
        e.preventDefault();
        
        var validator = $("#book_detail_area").data("kendoValidator");
        // 檢查必填欄位
        if (!validator.validate()) return;

        if (state === "add") {
            addBook();
        } else {
            updateBook(); 
        }
    });

    // 畫面載入後，先自動執行一次查詢，讓 Grid 有資料
    queryBook();
});



/**
 * 查詢書籍 (Call API)
 */
function queryBook() {

    var bookClassDDL  = $("#book_class_q").data("kendoDropDownList");
    var bookKeeperDDL = $("#book_keeper_q").data("kendoDropDownList");
    var bookStatusDDL = $("#book_status_q").data("kendoDropDownList");

    var payload = {
        BookName: $("#book_name_q").val() || null,
        BookClassId: bookClassDDL ? bookClassDDL.value() || null : null,
        BookKeeperId: bookKeeperDDL ? bookKeeperDDL.value() || null : null,
        BookStatusId: bookStatusDDL ? bookStatusDDL.value() || null : null
    };

    console.log("Query Payload:", payload);

    $.ajax({
        url: apiBaseUrl + "/api/bookmaintain/querybook",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(payload),
        success: function (res) {
            $("#book_grid").data("kendoGrid").dataSource.data(res);
        },
        error: function () {
            alert("查詢失敗");
        }
    });
}

/**
 * 新增書籍 (Call API)
 */
function addBook() { 
    // 整理要傳給後端的物件
    var bookData = {
        "BookName": $("#book_name_d").val(),
        "BookClassId": $("#book_class_d").data("kendoDropDownList").value(),
        "BookAuthor": $("#book_author_d").val(),
        "BookBoughtDate": kendo.toString($("#book_bought_date_d").data("kendoDatePicker").value(), "yyyy-MM-dd"),
        "BookPublisher": $("#book_publisher_d").val(),
        "BookNote": $("#book_note_d").val(),
        "BookStatusId": $("#book_status_d").data("kendoDropDownList").value(),
        "BookKeeperId": $("#book_keeper_d").data("kendoDropDownList").value()
    };

    $.ajax({
        url: apiBaseUrl + "/api/bookmaintain/addbook",
        type: "POST",
        contentType: "application/json", // Controller 使用 [FromBody] 接收 JSON
        data: JSON.stringify(bookData),
        success: function(res){
            if(res.status){
                alert("新增成功！");
                $("#book_detail_area").data("kendoWindow").close();
                queryBook(); // 重新查詢更新列表
            } else {
                alert("新增失敗：" + res.message);
            }
        },
        error: function(err){
            alert("新增發生錯誤");
        }
    });
 }

 /**
  * 更新書籍 (Call API)
  */
function updateBook() {
    var bookId = $("#book_id_d").val();
    
    var bookData = {
        "BookId": parseInt(bookId),
        "BookName": $("#book_name_d").val(),
        "BookClassId": $("#book_class_d").data("kendoDropDownList").value(),
        "BookAuthor": $("#book_author_d").val(),
        "BookBoughtDate": kendo.toString($("#book_bought_date_d").data("kendoDatePicker").value(), "yyyy-MM-dd"),
        "BookPublisher": $("#book_publisher_d").val(),
        "BookNote": $("#book_note_d").val(),
        "BookStatusId": $("#book_status_d").data("kendoDropDownList").value(),
        "BookKeeperId": $("#book_keeper_d").data("kendoDropDownList").value()
    };

    $.ajax({
        url: apiBaseUrl + "/api/bookmaintain/updatebook",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(bookData),
        success: function(res){
            if(res.status){
                alert("更新成功！");
                $("#book_detail_area").data("kendoWindow").close();
                queryBook(); // 重新查詢更新列表
            } else {
                alert("更新失敗：" + res.message);
            }
        },
        error: function(err){
            alert("更新發生錯誤");
        }
    });
}

/**
 * 刪除書籍 (Call API)
 */
function deleteBook(e) {
    e.preventDefault();

    var grid = $("#book_grid").data("kendoGrid");
    var row = $(e.target).closest("tr");
    var dataItem = grid.dataItem(row);

    // ✅ 正確：使用 bookStatusId
    if (dataItem.bookStatusId === "B" || dataItem.bookStatusId === "C") {
        alert("已借出的書籍無法刪除！");
        return;
    }

    // ✅ 正確：使用 bookName
    if (!confirm("確定要刪除【" + dataItem.bookName + "】嗎？")) return;

    $.ajax({
        url: apiBaseUrl + "/api/bookmaintain/deletebook",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(dataItem.bookId), // ✅ 正確
        success: function (res) {
            if (res.status) {
                alert("刪除成功");
                queryBook();
            } else {
                alert(res.message);
            }
        },
        error: function () {
            alert("刪除發生錯誤");
        }
    });
}

/**
 * 顯示修改畫面 (需先 Call API 取得最新單筆資料)
 */
function showBookForUpdate(e) {
    e.preventDefault();
    
    // 清除紅字與紅框
    var validator = $("#book_detail_area").data("kendoValidator");
    if (validator) validator.hideMessages();
    $(".k-invalid").removeClass("k-invalid");

    state = stateOption.update;
    
    // 取得 Grid 選中的那筆 BookId
    var grid = $("#book_grid").data("kendoGrid");
    var row = $(e.target).closest("tr");
    var dataItem = grid.dataItem(row);

    // 呼叫綁定函式 (會去 Call API)
    bindBookData(dataItem.bookId, false);
}

/**
 * 顯示明細畫面 (唯讀)
 */
function showBookForDetail(e, bookId) {
    e.preventDefault();

    // 清除紅字與紅框
    var validator = $("#book_detail_area").data("kendoValidator");
    if (validator) validator.hideMessages();
    $(".k-invalid").removeClass("k-invalid");

    // 呼叫綁定函式 (會去 Call API)
    bindBookData(bookId, true);
}

/**
 * 透過 API 取得單筆資料並填入視窗
 * @param {int} bookId 書籍編號
 * @param {bool} isReadOnly 是否為唯讀(明細)模式
 */
function bindBookData(bookId, isReadOnly){
    $.ajax({
        url: apiBaseUrl + "/api/bookmaintain/loadbook",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(bookId),
        success: function(book){
            if(!book) { alert("找不到資料"); return; }

            // 1. 填入資料（全部改成 camelCase）
            $("#book_id_d").val(book.bookId);
            $("#book_name_d").val(book.bookName);
            $("#book_author_d").val(book.bookAuthor);
            $("#book_publisher_d").val(book.bookPublisher);
            $("#book_note_d").val(book.bookNote);

            $("#book_class_d").data("kendoDropDownList").value(book.bookClassId);
            $("#book_status_d").data("kendoDropDownList").value(book.bookStatusId);
            $("#book_keeper_d").data("kendoDropDownList").value(book.bookKeeperId);

            // 日期轉 Date
            $("#book_bought_date_d")
            .data("kendoDatePicker")
            .value(new Date(book.bookBoughtDate));

            // 觸發圖片更新
            onChange(); 

            // 設定唯讀或可編輯
            if(isReadOnly){
                $("#book_detail_area").data("kendoWindow").title("書籍明細");
                $("#btn-save").hide();
                // 鎖定所有欄位
                $(".k-textbox, .k-textarea").prop("disabled", true);
                $("#book_class_d").data("kendoDropDownList").enable(false);
                $("#book_bought_date_d").data("kendoDatePicker").enable(false);
                $("#book_status_d").data("kendoDropDownList").enable(false);
                $("#book_keeper_d").data("kendoDropDownList").enable(false);
                
                // 顯示欄位
                $("#book_status_d_col").show();
                $("#book_keeper_d_col").show();
            } else {
                $("#book_detail_area").data("kendoWindow").title("修改書籍");
                $("#btn-save").show();
                // 解鎖所有欄位
                $(".k-textbox, .k-textarea").prop("disabled", false);
                $("#book_class_d").data("kendoDropDownList").enable(true);
                $("#book_bought_date_d").data("kendoDatePicker").enable(true);
                $("#book_status_d").data("kendoDropDownList").enable(true);
                $("#book_keeper_d").data("kendoDropDownList").enable(true);
                
                // 觸發連動 (依狀態決定是否鎖定借閱人)
                setStatusKeepRelation();
            }

            $("#book_detail_area").data("kendoWindow").open();
        },
        error: function(err){
            alert("載入資料失敗");
        }
    });
}


function onChange() {
    var selectedValue = $("#book_class_d").data("kendoDropDownList").value();
    if(selectedValue === ""){
        $("#book_image_d").attr("src", "image/optional.jpg");
    } else {
        $("#book_image_d").attr("src", "image/" + selectedValue + ".jpg");
    }
}

function clear() {
    $("#book_name_q").val("");
    $("#book_class_q").data("kendoDropDownList").value("");
    $("#book_keeper_q").data("kendoDropDownList").value("");
    $("#book_status_q").data("kendoDropDownList").value("");
    queryBook(); // 清除後自動查全部
}

function setStatusKeepRelation() { 
    var bookStatusId = $("#book_status_d").data("kendoDropDownList").value();
    var keeper = $("#book_keeper_d").data("kendoDropDownList");

    // A:可借出, U:不可借出 -> 隱藏並清空借閱人
    if (bookStatusId === "A" || bookStatusId === "U") {
        $("#book_keeper_d_col").hide();
        $("#book_keeper_d").prop('required', false);
        keeper.value("");
        // keeper.enable(false); // 視需求決定要不要 disable，hide 其實就夠了
    } else {
        // B:已借出, C:已借出未領 -> 顯示並設為必填
        $("#book_keeper_d_col").show();
        $("#book_keeper_d").prop('required', true);
        keeper.enable(true);
    }
}

function registerRegularComponent(){

    // ===== 查詢區 =====
    $("#book_class_q").kendoDropDownList({
        dataTextField: "text",
        dataValueField: "value",
        dataSource: classData,
        optionLabel: "請選擇"
    });

    $("#book_keeper_q").kendoDropDownList({
        dataTextField: "UserCname",
        dataValueField: "UserId",
        dataSource: memberData,
        optionLabel: "請選擇"
    });

    $("#book_status_q").kendoDropDownList({
        dataTextField: "StatusText",
        dataValueField: "StatusId",
        dataSource: bookStatusData,
        optionLabel: "請選擇"
    });

        // ===== 新增 / 修改：圖書類別 =====
    $("#book_class_d").kendoDropDownList({
        dataTextField: "text",
        dataValueField: "value",
        dataSource: classData,
        optionLabel: "請選擇",
        change: onChange   // 圖片切換用
    });

    // ===== 新增 / 修改：借閱狀態 =====
    $("#book_status_d").kendoDropDownList({
        dataTextField: "StatusText",
        dataValueField: "StatusId",
        dataSource: bookStatusData,
        optionLabel: "請選擇"
    });

    // ===== 新增 / 修改：借閱人 =====
    $("#book_keeper_d").kendoDropDownList({
        dataTextField: "UserCname",
        dataValueField: "UserId",
        dataSource: memberData,
        optionLabel: "請選擇"
    });

    // ===== 新增 / 修改：購書日期 =====
    $("#book_bought_date_d").kendoDatePicker({
        format: "yyyy/MM/dd"
    });

    // ===== Grid（只建一次）=====
    $("#book_grid").kendoGrid({
        dataSource: {
            data: [],
            schema: {
                model: {
                    id: "bookId",
                    fields: {
                        bookId: { type: "number" },
                        bookName: { type: "string" },
                        bookClassName: { type: "string" },
                        bookBoughtDate: { type: "string" },
                        bookStatusName: { type: "string" },
                        bookKeeperId: { type: "string" }
                    }
                }
            },
            pageSize: 10
        },
        pageable: true,
        sortable: true,
        columns: [
            { field: "bookId", title: "編號", width: "8%" },
            { field: "bookClassName", title: "圖書類別", width: "15%" },
            {
                field: "bookName",
                title: "書名",
                width: "30%",
                template: "<a style='cursor:pointer;color:blue' onclick='showBookForDetail(event,#:bookId#)'>#:bookName#</a>"
            },
            { field: "bookBoughtDate", title: "購書日期", width: "15%" },
            { field: "bookStatusName", title: "狀態", width: "15%" },
            {
              title: "借閱人",                       //將借閱人從ID轉為名字
              width: "12%", 
              template: function (dataItem) {
                if (!dataItem.bookKeeperId) return "";

                var member = memberData.find(m => m.UserId === dataItem.bookKeeperId);
                return member ? member.UserCname : dataItem.bookKeeperId;
            }
            },
            { command: { text: "借閱紀錄", click: showBookLendRecord}, title:" ", width: "120px"},
            { command: { text: "修改", click: showBookForUpdate }, width: "8%" },
            { command: { text: "刪除", click: deleteBook }, width: "8%" }
        ]
    });
}

function showBookLendRecord(e) {
    e.preventDefault();
    alert("目前系統尚未開放查詢 API 端的借閱紀錄功能");
   
}