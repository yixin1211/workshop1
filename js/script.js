
var bookDataFromLocalStorage = [];
var bookLendDataFromLocalStorage =[];

var state="";

var stateOption={
    "add":"add",
    "update":"update"
}

//e04

$(function () {
    loadBookData();
    registerRegularComponent();

    //Kendo Window reference
    //初始化：Configuration
    //初始化後、在其他時間顛要控制 Kendo 物件：Methods、key data("kendoXXXX")
    //初始化時綁定 Kendo 的事件(Ex.當 Kendo Window 關閉時要做一些事情(Call function)：Events
    //https://www.telerik.com/kendo-jquery-ui/documentation/api/javascript/ui/window#configuration
    $("#book_detail_area").kendoWindow({
        width: "1200px",
        title: "新增書籍",
        visible: false,
        modal: true,
        actions: [
            "Close"
        ]
    }).data("kendoWindow").center();

    $("#book_detail_area").kendoValidator();

    $("#book_record_area").kendoWindow({
        width: "700px",
        title: "借閱紀錄",
        visible: false,
        modal: true,
        actions: [
            "Close"
        ]
    }).data("kendoWindow").center();
    

    $("#btn_add_book").click(function (e) {
        e.preventDefault();
        state=stateOption.add;

        setStatusKeepRelation(state);

        $("#btn-save").css("display","");        
        $("#book_detail_area").data("kendoWindow").title("新增書籍");
        $("#book_detail_area").data("kendoWindow").open();
    });


    $("#btn_query").click(function (e) {
        e.preventDefault();
        queryBook();
    });

    $("#btn_clear").click(function (e) {
        e.preventDefault();

        clear();
        queryBook();
    });

    validator = $("#book_detail_area").kendoValidator({
        messages: {
            required: "此欄位為必填"
        }
    }).data("kendoValidator");

    $("#btn-save").click(function (e) {
        e.preventDefault();
        
        var validator = $("#book_detail_area").data("kendoValidator");

        // 檢查必填欄位
        if (!validator.validate()) {
            // 驗證失敗，顯示錯誤訊息並停止
            return;
        }

        switch (state) {
            case "add":
                addBook();
                break;
            case "update":
                updateBook(); 
                break;
            default:
                break;
        }
    });

    $("#book_grid").kendoGrid({
        dataSource: {
            data: bookDataFromLocalStorage,
            schema: {
                model: {
                    id:"BookId",
                    fields: {
                        BookId: { type: "int" },
                        BookClassName: { type: "string" },
                        BookName: { type: "string" },
                        BookBoughtDate: { type: "string" },
                        BookStatusName: { type: "string" },
                        BookKeeperCname: { type: "string" }
                    }
                }
            },
            pageSize: 20,
        },
        height: 550,
        sortable: true,
        pageable: {
            input: true,
            numeric: false
        },
        columns: [
            { field: "BookId", title: "書籍編號", width: "10%" },
            { field: "BookClassName", title: "圖書類別", width: "15%" },
            { field: "BookName", title: "書名", width: "30%" ,
              template: "<a style='cursor:pointer; color:blue' onclick='showBookForDetail(event,#:BookId #)'>#: BookName #</a>"
            },
            { field: "BookBoughtDate", title: "購書日期", width: "15%" },
            { field: "BookStatusName", title: "借閱狀態", width: "15%" },
            { field: "BookKeeperCname", title: "借閱人", width: "15%" },
            { command: { text: "借閱紀錄", click: showBookLendRecord }, title: " ", width: "120px" },
            { command: { text: "修改", click: showBookForUpdate }, title: " ", width: "100px" },
            { command: { text: "刪除", click: deleteBook }, title: " ", width: "100px" }
        ]

    });

    $("#book_record_grid").kendoGrid({
        dataSource: {
            data: [],
            schema: {
                model: {
                    fields: {
                        LendDate: { type: "string" },
                        BookKeeperId: { type: "string" },
                        BookKeeperEname: { type: "string" },
                        BookKeeperCname: { type: "string" }
                    }
                }
            },
            pageSize: 20,
        },
        height: 250,
        sortable: true,
        pageable: {
            input: true,
            numeric: false
        },
        columns: [
            { field: "LendDate", title: "借閱日期", width: "10%" },
            { field: "BookKeeperId", title: "借閱人編號", width: "10%" },
            { field: "BookKeeperEname", title: "借閱人英文姓名", width: "15%" },
            { field: "BookKeeperCname", title: "借閱人中文姓名", width: "15%" },
        ]
    });

})

/**
 * 初始化 localStorage 資料
 * 將 data 內的 book-data.js..bookData；book-lend-record.js..lendData 寫入 localStorage 作為"資料庫"使用
 */
function loadBookData() {
    bookDataFromLocalStorage = JSON.parse(localStorage.getItem("bookData"));
    if (bookDataFromLocalStorage == null) {
        bookDataFromLocalStorage = bookData;
        localStorage.setItem("bookData", JSON.stringify(bookDataFromLocalStorage));
    }

    bookLendDataFromLocalStorage = JSON.parse(localStorage.getItem("lendData"));
    if (bookLendDataFromLocalStorage == null) {
        bookLendDataFromLocalStorage = lendData;
        localStorage.setItem("lendData", JSON.stringify(bookLendDataFromLocalStorage));
    }
}

function onChange() {

    // 取得當前下拉選單選中的值
    var selectedValue = $("#book_class_d").data("kendoDropDownList").value();
    
    // 根據選擇的值切換圖片
    if(selectedValue === ""){
        $("#book_image_d").attr("src", "image/optional.jpg");
    } else {
        $("#book_image_d").attr("src", "image/" + selectedValue + ".jpg");

 
    }
}


/**
 * 新增書籍
 */
function addBook() { 

    //TODO：請完成新增書籍的相關功能
    var grid=$("#book_grid").data("kendoGrid");
    
    var newBookId = 1;
    if (bookDataFromLocalStorage.length > 0) {
        newBookId = Math.max(...bookDataFromLocalStorage.map(b => b.BookId)) + 1;  //找出最大編號，新書籍編號+1
    }

    //將代碼轉成顯示文字
    var bookClassId = $("#book_class_d").data("kendoDropDownList").value();
    var bookClassName = classData.find(c => c.value === bookClassId)?.text || ""; 

    var bookStatusId = "A";
    var bookStatusName = bookStatusData.find(s => s.StatusId === "A").StatusText; 


    var book = {
        "BookId": newBookId,
        "BookName": $("#book_name_d").val(),
        "BookClassId": $("#book_class_d").data("kendoDropDownList").value(),
        "BookClassName": bookClassName,
        "BookBoughtDate": kendo.toString($("#book_bought_date_d").data("kendoDatePicker").value(),"yyyy-MM-dd"),
        "BookStatusId": bookStatusId,
        "BookStatusName": bookStatusName,
        "BookKeeperId": "",
        "BookKeeperCname": "",
        "BookKeeperEname": "",
        "BookAuthor": $("#book_author_d").val(),
        "BookPublisher": $("#book_publisher_d").val(),
        "BookNote": $("#book_note_d").val()
    };
    
    bookDataFromLocalStorage.push(book);
    localStorage.setItem("bookData", JSON.stringify(bookDataFromLocalStorage)); //將資料寫入localStorage

    grid.dataSource.add(book); //更新Grid

    //關閉 Window
    $("#book_detail_area").data("kendoWindow").close();
 }

 /**
  * 更新書籍
  * @param {} bookId 
  */
function updateBook() {
    // 1. 從隱藏欄位取得 ID
    var bookId = $("#book_id_d").val();
    var book = bookDataFromLocalStorage.find(m => m.BookId == bookId);

    // 2. 更新基本欄位
    book.BookName = $("#book_name_d").val();
    book.BookAuthor = $("#book_author_d").val();
    book.BookPublisher = $("#book_publisher_d").val();
    book.BookNote = $("#book_note_d").val();

    // 3. 更新日期 (需轉為字串)
    var rawDate = $("#book_bought_date_d").data("kendoDatePicker").value();
    book.BookBoughtDate = kendo.toString(rawDate, "yyyy-MM-dd");

    // 4. 更新類別 (需同時存 ID 和 中文名稱)
    var classId = $("#book_class_d").data("kendoDropDownList").value();
    book.BookClassId = classId;
    book.BookClassName = classData.find(c => c.value == classId).text;

    // 5. 更新借閱狀態
    var statusId = $("#book_status_d").data("kendoDropDownList").value();
    book.BookStatusId = statusId;
    book.BookStatusName = bookStatusData.find(s => s.StatusId == statusId).StatusText;

    // 6. 更新借閱人
    var keeperId = $("#book_keeper_d").data("kendoDropDownList").value();
    book.BookKeeperId = keeperId;
    if (keeperId) {
        var member = memberData.find(m => m.UserId == keeperId);
        book.BookKeeperCname = member.UserCname;
        book.BookKeeperEname = member.UserEname;
    } else {
        book.BookKeeperCname = "";
        book.BookKeeperEname = "";
    }

    // 7. 寫入 LocalStorage (這行是資料能保存的關鍵)
    localStorage.setItem("bookData", JSON.stringify(bookDataFromLocalStorage));

    // 8. 更新畫面 Grid
    var grid = $("#book_grid").data("kendoGrid");
    grid.dataSource.pushUpdate(book);

    // 9. 處理借閱紀錄 (若變成已借出)
    if (statusId == "B" || statusId == "C") {
        addBookLendRecord();
    }

    // 10. 關閉視窗
    $("#book_detail_area").data("kendoWindow").close();
}

 /**
  * 新增借閱紀錄
  */
 function addBookLendRecord() {  
    // 1. 從修改視窗取得目前這本書的資訊
    var bookId = $("#book_id_d").val();
    var keeperId = $("#book_keeper_d").data("kendoDropDownList").value();

    //如果沒選人，就不存紀錄
    if (!keeperId) { 
        return; 
    }

    // 2. 取得借閱人詳細資料 (中文/英文名)
    var member = memberData.find(m => m.UserId == keeperId);

    // 3. 建立一筆新的借閱紀錄物件
    var newRecord = {
        "BookId": parseInt(bookId), // 確保轉為數字
        "BookKeeperId": keeperId,
        "BookKeeperCname": member.UserCname,
        "BookKeeperEname": member.UserEname,
        "LendDate": kendo.toString(new Date(), "yyyy-MM-dd") // 借閱日期設為「今天」
    };

    // 4. 存入陣列與 LocalStorage
    bookLendDataFromLocalStorage.push(newRecord);
    localStorage.setItem("lendData", JSON.stringify(bookLendDataFromLocalStorage));
 }


/**
 * 查詢
 */
function queryBook(){
    
    // 1. 取得 Grid 元件
    var grid = $("#book_grid").data("kendoGrid");

    // 2. 抓取畫面上的查詢條件值
    var bookName = $("#book_name_q").val();
    var bookClassId = $("#book_class_q").data("kendoDropDownList").value();
    var bookKeeperId = $("#book_keeper_q").data("kendoDropDownList").value();
    var bookStatusId = $("#book_status_q").data("kendoDropDownList").value();

    // 3. 建立篩選條件陣列 (Filter Array)
    var filtersCondition = [];

    // 條件 A: 書名 (使用 'contains' 包含/模糊搜尋)
    if(bookName != ""){
        filtersCondition.push({ field: "BookName", operator: "contains", value: bookName });
    }

    // 條件 B: 圖書類別 (使用 'eq' 等於/精確比對)
    if(bookClassId != ""){
        filtersCondition.push({ field: "BookClassId", operator: "eq", value: bookClassId });
    }

    // 條件 C: 借閱人
    if(bookKeeperId != ""){
        filtersCondition.push({ field: "BookKeeperId", operator: "eq", value: bookKeeperId });
    }

    // 條件 D: 借閱狀態
    if(bookStatusId != ""){
        filtersCondition.push({ field: "BookStatusId", operator: "eq", value: bookStatusId });
    }

    // 4. 將條件應用到 Grid 的 DataSource
    // logic: "and" 代表所有條件都要符合 (例如：要是 Networking 類別 "且" 是 Peter 借的)
    grid.dataSource.filter({
        logic: "and",
        filters: filtersCondition
    });
}

function deleteBook(e) {
    
    var grid = $("#book_grid").data("kendoGrid");    
    var row = grid.dataItem(e.target.closest("tr"));

    grid.dataSource.remove(row);    
    alert("刪除成功");

}


/**
 * 顯示圖書編輯畫面
 * @param {} e 
 */
function showBookForUpdate(e) {
    e.preventDefault();

    state=stateOption.update;
    $("#book_detail_area").data("kendoWindow").title("修改書籍");
    $("#btn-save").css("display","");

    var grid = getBooGrid();
    var bookId = grid.dataItem(e.target.closest("tr")).BookId;

    bindBook(bookId);
    
    setStatusKeepRelation();
    $("#book_detail_area").data("kendoWindow").open();
}

/**
 * 顯示圖書明細畫面
 * @param {} e 
 * @param {*} bookId 
 */
function showBookForDetail(e,bookId) {
    e.preventDefault();
    //TODO : 請補齊未完成的功能
    $("#book_detail_area").data("kendoWindow").title("書籍明細");

}

/**
 * 繫結圖書資料
 * @param {*} bookId 
 */
function bindBook(bookId){
    var book = bookDataFromLocalStorage.find(m => m.BookId == bookId);
    
    // 1. 基本欄位
    $("#book_id_d").val(bookId);
    $("#book_name_d").val(book.BookName);
    $("#book_author_d").val(book.BookAuthor);
    $("#book_publisher_d").val(book.BookPublisher);
    
    // 2. 缺漏的欄位
    $("#book_note_d").val(book.BookNote); // 內容簡介
    $("#book_class_d").data("kendoDropDownList").value(book.BookClassId); // 圖書類別
    $("#book_bought_date_d").data("kendoDatePicker").value(book.BookBoughtDate); // 購買日期
    $("#book_status_d").data("kendoDropDownList").value(book.BookStatusId); // 借閱狀態
    $("#book_keeper_d").data("kendoDropDownList").value(book.BookKeeperId); // 借閱人

    // 3. 設定圖片 (根據類別代碼顯示對應圖片)
    var imageSrc = book.BookClassId ? "image/" + book.BookClassId + ".jpg" : "image/optional.jpg";
    $("#book_image_d").attr("src", imageSrc);
}

/**
 * 顯示借閱紀錄視窗
 */
function showBookLendRecord(e) {
    e.preventDefault(); // 防止連結跳轉

    // 1. 取得目前點擊的那本書
    var grid = $("#book_grid").data("kendoGrid");
    var row = $(e.target).closest("tr");
    var dataItem = grid.dataItem(row);
    
    // 2. 從所有借閱紀錄中，篩選出「這本書 (BookId)」的紀錄
    var bookLendRecordData = bookLendDataFromLocalStorage.filter(r => r.BookId == dataItem.BookId);
    
    // 3. 將篩選後的資料倒進「紀錄表格 (#book_record_grid)」
    $("#book_record_grid").data("kendoGrid").dataSource.data(bookLendRecordData);
    
    // 4. 設定視窗標題並開啟
    $("#book_record_area").data("kendoWindow").title("借閱紀錄 - " + dataItem.BookName).open();
}

/**
 * 清畫面
 * @param {*} area 
 */
/**
 * 清除查詢條件
 */
function clear() {
    // 1. 清空文字輸入框
    $("#book_name_q").val("");

    // 2. 重置所有下拉選單 (設為空字串，即回到 "請選擇" 的狀態)
    $("#book_class_q").data("kendoDropDownList").value("");
    $("#book_keeper_q").data("kendoDropDownList").value("");
    $("#book_status_q").data("kendoDropDownList").value("");
    
    // 3. 清除後，重新載入所有書籍 (也就是做一次沒有條件的查詢)
    // 這樣使用者按清除後，表格會自動顯示全部資料，體驗較好
    queryBook(); 
}

/**
 * 設定借閱狀態與借閱人關聯
 */
function setStatusKeepRelation() { 
    //TODO : 請補齊借閱人與借閱狀態相關邏輯(完成)
    switch (state) {
        case "add"://新增狀態
            $("#book_status_d_col").css("display","none");
            $("#book_keeper_d_col").css("display","none");
        
            $("#book_status_d").prop('required',false);
            $("#book_keeper_d").prop('required',false);            
            break;
        case "update"://修改狀態

            $("#book_status_d_col").show();
            $("#book_keeper_d_col").show();

            $("#book_status_d").prop('required',true);

            var bookStatusId=$("#book_status_d").data("kendoDropDownList").value();

            if(bookStatusId=="A" || bookStatusId=="U"){
                $("#book_keeper_d").prop('required',false);
                $("#book_keeper_d").data("kendoDropDownList").value("");
                $("#book_detail_area").data("kendoValidator").validateInput($("#book_keeper_d"));
                     
            }else{
                $("#book_keeper_d").prop('required',true);
            }
            break;
        default:
            break;
    }
    
 }

 /**
  * 生成畫面所需的 Kendo 控制項
  */
function registerRegularComponent(){
    $("#book_class_q").kendoDropDownList({
        dataTextField: "text",
        dataValueField: "value",
        dataSource: classData,
        optionLabel: "請選擇",
        index: 0
    });

    $("#book_class_d").kendoDropDownList({
        dataTextField: "text",
        dataValueField: "value",
        dataSource: classData,
        optionLabel: "請選擇",
        index: 0,
        change: onChange
    });

    $("#book_keeper_q").kendoDropDownList({
        dataTextField: "UserCname",
        dataValueField: "UserId",
        dataSource: memberData,
        optionLabel: "請選擇",
        index: 0
    });

    $("#book_keeper_d").kendoDropDownList({
        dataTextField: "UserCname",
        dataValueField: "UserId",
        dataSource: memberData,
        optionLabel: "請選擇",
        index: 0
    });

    $("#book_status_q").kendoDropDownList({
        dataTextField: "StatusText",
        dataValueField: "StatusId",
        dataSource: bookStatusData,
        optionLabel: "請選擇",
        index: 0
    });

    $("#book_status_d").kendoDropDownList({
        dataTextField: "StatusText",
        dataValueField: "StatusId",
        dataSource: bookStatusData,
        optionLabel: "請選擇",
        change:setStatusKeepRelation,
        index: 0
    });


    $("#book_bought_date_d").kendoDatePicker({
        value: new Date()
    });
}

/**
 * 取得畫面上的 BookGrid
 * @returns 
 */
function getBooGrid(){
    return $("#book_grid").data("kendoGrid");
}