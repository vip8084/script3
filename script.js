// ==UserScript==
// @name         corsehunters.net sorting
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  highlight watched courses and courses to watch
// @include      http://coursehunters.net/archive
// @include      https://coursehunters.net/archive
// @require      http://code.jquery.com/jquery-2.2.4.min.js
// @require      https://code.jquery.com/jquery-2.2.4.min.js
// @require      http://www.gstatic.com/firebasejs/5.3.0/firebase.js
// @require      https://www.gstatic.com/firebasejs/5.3.0/firebase.js
// ==/UserScript==


// Initialize Firebase
  var config = {
    apiKey: "AIzaSyB-GQ8zgIaU4q-_ATrp2XOFq9sIq3gM8Nc",
    authDomain: "coursehunters-db.firebaseapp.com",
    databaseURL: "https://coursehunters-db.firebaseio.com",
    projectId: "coursehunters-db",
    storageBucket: "coursehunters-db.appspot.com",
    messagingSenderId: "580211956080"
  };
  firebase.initializeApp(config);
  const db = firebase.firestore();
  db.settings({ timestampsInSnapshots: true });

//--------------------

(function() {
    'use strict';


    let coursesItems = $("div.standard-block__flex > ul > li"); // list of courses (getting all Li in Ul)

    let listOfCourses = []; //// list of courses
    let listOfCoursesForSearch = []; // list of courses with dates


    let watchedCourses = []; // watched courses
    let coursesToWatch = []; // courses to watch

    let searchWords = []; // words for search
    let foundCourses = 0; // quantity of found items in search

    let totalCourses = coursesItems.length;
    let totalWatchedCourses = watchedCourses.length;
    let totalCoursesToWatch = coursesToWatch.length;

    /*
    Forbidden chars to write in docID in Firebase - /
    Acceptable chars to write in docID in Firebase - : , . () – # ! & | [] “” «» ‘ ?  \”
    */
    let forbiddenChar = "/"; // forbidden to write in docID in Firestore
    let replacedWith = "&&&"; // replace forbidden char with it

    const controlPanelStyles = {
        allElements: {
            margin: "0",
            padding: "0",
            color: "#853328",
            fontFamily: "Baskerville, 'Baskerville Old Face', 'Goudy Old Style', 'Garamond', 'Times New Roman', 'serif'",
            fontWeight: "700"
        },
        containerWrapper: {
          backgroundColor: "#EEEEEE",
          display: "flex",
          justifyContent: "center"
        },
        controlpanelContainer: {
            display: "flex",
            flexWrap: "wrap",
            minWidth: "300px",
            maxWidth: "1000px",

            background: "linear-gradient(110deg, #fdcd3b 60%, #ffed4b 60%)"
        },
        infoWrapper: {
            display: "flex",
            width: "100%",
            flexWrap: "wrap"
        },
        listWrapper: {
            display: "flex",
            flexWrap: "wrap",
            marginLeft: "10px",
            minWidth: "200px"
        },
        infoList: {
            margin: "0 10px 0 0"
        },
        status: {
            margin: "0 25px 0 0"
        },
        coursesInfo: {
            display: "flex",
            flexWrap: "wrap",
            borderTop: "1px solid #853328",
            borderBottom: "1px solid #853328",
            margin: "0 10px",
            paddingTop: "5px",
            width: "100%",
            fontSize: "1.02em",
            justifyContent: "space-between"
        },
        allCourses: {
            display: "flex",
            margin: "0 0 5px 0",
            flexGrow: "1",
            alignItems: "center"
        },
        courseCounter: {
            margin: "0 15px 0 10px",
            flexGrow: "100%",
            fontSize: "1.3em"
        },
        totalCoursesCourseCounter: {
            color: "#353984",
            backgroundColor: "white",
            padding: "1px",
            borderRadius: "7px",
            width: "60px",
            textAlign: "center"
        },
        watchedCoursesCourseCounter: {
            color: "#1ea800",
            backgroundColor: "white",
            padding: "1px",
            borderRadius: "7px",
            width: "60px",
            textAlign: "center",
            fontFamily: "Digital"
        },
        toWatchCoursesCourseCounter: {
            color: "#c10d0d",
            backgroundColor: "white",
            padding: "1px",
            borderRadius: "7px",
            width: "60px",
            textAlign: "center"
        },
        searchContainer: {
            display: "flex",
            flexWrap: "wrap",
            width: "100%"
        },
        searchHeading: {
            margin: "3px 10px 0 10px",
            width: "100%"
        },
        inputContainer: {
            margin: "3px 10px",
            width: "100%"
        },
        inputItemsContainer: {
            display: "flex",
            marginBottom: "5px",
            alignItems: "center"
        },
        searchInput: {
            width: "50%",
            marginRight: "5px",
            padding: "3px",
            letterSpacing: "2px",
            fontSize: "1.5em",
            fontWeight: "normal",
            border: "1px solid #CC9728"
        },
        addNewInputRemoveInput: {
            padding: "1px 5px 0 5px",
            width: "24px",
            height: "24px",
            fontSize: "17px"
        },
        containerFooter: {
            margin: "0 10px",
            padding: "5px 0 0 0",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            borderTop: "1px solid #853328",
            width: "100%",
            alignItems: "center"
        },
        containerBtn: {
            boxShadow: "inset 0px 1px 0px 0px #a4e271",
            background: "-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #89c403), color-stop(1, #77a809))",
            background: "-moz-linear-gradient(top, #89c403 5%, #77a809 100%)",
            background: "-webkit-linear-gradient(top, #89c403 5%, #77a809 100%)",
            background: "-o-linear-gradient(top, #89c403 5%, #77a809 100%)",
            background: "-ms-linear-gradient(top, #89c403 5%, #77a809 100%)",
            background: "linear-gradient(to bottom, #89c403 5%, #77a809 100%)",
            backgroundColor: "#89c403",
            borderRadius: "6px",
            border:  "1px solid #74b807",
            display: "inline-block",
            cursor: "pointer",
            color: "#ffffff",
            fontFamily: "Arial",
            fontWeight: "bold",
            textDecoration: "none",
            textShadow: "0px 1px 0px #528009",
            marginRight: "3px",
            outline: "0"
        },
        removeInputResetSearch: {
            boxShadow: "inset 0px 1px 0px 0px #f7c5c0",
            background: "linear-gradient(to bottom, #fc8d83 5%, #e4685d 100%)",
            backgroundColor: "#fc8d83",
            borderRadius: "6px",
            border: "1px solid #d83526",
            display: "inline-block",
            cursor: "pointer",
            color: "#ffffff",
            fontFamily: "Arial",
            fontWeight: "bold",
            textDecoration: "none",
            textShadow: "0px 1px 0px #b23e35"
        },
        buttonSearchResetSearch: {
            padding: "5px",
            borderRadius: "5px",
            fontSize: "12px"
        },
        containerButtons: {
            margin: "0 0 5px 0",
            alignItems: "center"
        },
        infoFoundCourses: {
            display: "flex",
            alignItems: "center",
            margin: "0 0 5px 0"
        },
        headingFoundCourses: {
            marginRight: "10px"
        },
        foundCoursesCounter: {
            backgroundColor: "white",
            padding: "2px",
            borderRadius: "7px",
            color: "#686803",
            width: "48px",
            textAlign: "center",
            fontSize: "1.2em"
        },
        controlWatchedButton: {
            boxShadow: "0px 7px 7px -7px #3e7327",
            background: "linear-gradient(to bottom, #95d177 5%, #70ad51 100%)",
            backgroundColor:"#95d177",
            borderRadius:"42px",
            border:"2px solid #ffffff",
            cursor:"pointer",
            color:"#ffffff",
            fontFamily:"Arial",
            fontSize:"15px",
            fontWeight:"bold",
            padding:"2px 5px 0 5px",
            textDecoration:"none",
            textShadow:"0px 1px 0px #5b8a3c",
            marginLeft: "13px",
            outline: "0"
        },
        controlToWatchButton:{
            boxShadow: "0px 7px 7px -7px #b50b0b",
            background: "linear-gradient(to bottom, #e6935c 5%, #ed3434 100%)",
            backgroundColor:"#e6935c",
            borderRadius:"42px",
            border:"2px solid #ffffff",
            cursor:"pointer",
            color:"#ffffff",
            fontFamily:"Arial",
            fontSize:"15px",
            fontWeight:"bold",
            padding:"2px 5px 0 5px",
            textDecoration:"none",
            textShadow:"0px 1px 0px #d40f0f",
            marginLeft: "-3px",
            outline: "0"
        }
    };

    let controlPanel = (totalCourses, totalWatchedCourses, totalCoursesToWatch, foundCourses) => `
        <div class="container-wrapper">

        <div class="controlpanel-container">

            <div class="info-wrapper">
            <div class="list-wrapper">
                <p class="info-list">watched : </p>
                <p class="status">connected</p>
            </div>

            <div class="list-wrapper">
                <p class="info-list">to watch : </p>
                <p class="status">connected</p>
            </div>
            </div>

        <div class="courses-info">

        <div class="total-courses">
            <p class="course-quantity">TOTAL COURSES : </p>
            <p class="course-counter">${totalCourses}</p>
        </div>
        <div class="watched-courses">
            <p class="course-quantity">WATCHED COURSES :</p>
            <p class="course-counter">${totalWatchedCourses}</p>
        </div>
        <div class="to-watch-courses">
            <p class="course-quantity">TO WATCH :</p>
            <p class="course-counter">${totalCoursesToWatch}</p>
        </div>

        </div>

        <div class="search-container">

        <p class="search-heading">search :</p>
        <div class="input-container">
            <div class="input-items-container">
            <input type="text" class="search-input-field">
            <button class="add-new-input container-btn">+</button>
            </div>

        </div>

        </div>

        <div class="container-footer">
        <div class="container-buttons">
            <button class="search container-btn">SEARCH</button>
            <button class="reset-search container-btn">RESET</button>
        </div>
        <div class="info-found-courses">
            <p class="heading-found-courses">Found courses :</p>
            <p class="found-courses-counter">${foundCourses}</p>
        </div>
        </div>

    </div>

    </div>
`;

    let controlButtons = () => `
<button class='control-watched' style="display: none;">+</button>
<button class='control-towatch' style="display: none;">+</button>
`;

//============= Init ================

    $( "body" ).prepend(controlPanel (totalCourses, totalWatchedCourses, totalCoursesToWatch, foundCourses)); //adding control panel

    controlPanelStyling(); //adding styles to control panel

    getCoursesList(); //initialize courses list

    getCoursesToWatchListFromDB();
    getWatchedListFromDB();


    addButtons();

//=========== TO DO ===================
/*
    - set connected and disconnected states
    - add login and base creastion
      - проверить если с кавычками вставлены значения
    - add tab index
    - добавить загрузку пока грузится эксперт

    - replace russian comments with english
    - arrange functions in logical order
    - убрать аутлайн инпутов
    - сделать дисейбл счетчики курсов

*/
//=========== Event Listeners =============

    $(".search").on("click", function(){
        search();
    });

    $(".reset-search").on("click", function(){
        resetSearch();

        // reset all inputs
        $('.search-input-field').val('');
    });

    //enter press
    $(document).keypress(function(e) {
        if(e.which == 13) {
            search();
        }
    });

    //adding new input block
    $(".input-container").on("click", ".add-new-input", function(){
        addInputField();
        controlPanelStyling();
    });

    //removing new input block
    $(".input-container").on("click", ".remove-input", function(){
        removeInputField($(this));
    });

//------------- Show Control Buttons On Hover-------------------------
    let timer;

    $("div.standard-block__flex ul").on("mouseenter", "li", function(){
        $(this).find(".control-watched").css(controlPanelStyles.controlWatchedButton);
        $(this).find(".control-towatch").css(controlPanelStyles.controlToWatchButton);

        let controlBtns = $(this).find("button");
       timer = setTimeout(function() {
          controlBtns.fadeIn(300);
    }, 200);


    }).on("mouseleave", "li", function(){
        let controlBtns = $(this).find("button");
        controlBtns.fadeOut(500);
        clearTimeout(timer);
    });
//----------------------------------

    $("div.standard-block__flex > ul > li").on("click", ".control-watched", function(event){
        event.preventDefault();
        event.stopPropagation();

        workWithDBLists($(this));
    });

    $("div.standard-block__flex > ul > li").on("click", ".control-towatch", function(event){
        event.preventDefault();
        event.stopPropagation();

        workWithDBLists($(this));
    });

//================== Functions ========================

//-------- Add to Watched List in DB ------------------
function addToWatchedCoursesDB(caller){

    //getting clean course text
    let itemText = caller.parent().clone().children().remove().end().text().trim();

    //if course name contains "/" then replace it with tne "&&&"
    //because "/" is borbidden to wtire in docID in firebase
    if(itemText.indexOf(forbiddenChar) != -1){
        itemText = itemText.replace(/\//g, "&&&");
    }


    let doc = db.collection('watched').doc(itemText);

    //checking if the item is already in the db
    doc.get().then((docData) => {
        if (docData.exists) {  // document exists (online/offline)
            console.log('The course is already in the "watched" list.');
        } else {  // document does not exist (only on online)

            // creacting doc, to prevent deleting empty document by system of firebase add to it any
            // property like this, now the doc is not empty and the system will keep it
            db.collection("watched").doc(itemText).set({
                exists: "true"
            }).then(function() {
                console.log("");
                console.log('Document successfully written in "Watched Courses" list!');

                getWatchedListFromDB();

            }).catch(function(error) {
                console.error("Error writing document: ", error);
            });

        }
    }).catch((fail) => {
        // Either
        // 1. failed to read due to some reason such as permission denied ( online )
        // 2. failed because document does not exists on local storage ( offline )
        console.error("Error writing document: ", fail);
    });
}
//-------- Add to CoursesToWatch List in DB -----------
function addToCoursesToWatchDB(caller){

    //getting clean course text
    let itemText = caller.parent().clone().children().remove().end().text().trim();

    //if course name contains "/" then replace it with tne "&&&"
    //because "/" is borbidden to wtire in docID in firebase
    if(itemText.indexOf(forbiddenChar) != -1){
        itemText = itemText.replace(/\//g, "&&&");
    }


    let doc = db.collection('towatch').doc(itemText);

    //checking if the item is already in the db
    doc.get().then((docData) => {
        if (docData.exists) {  // document exists (online/offline)
            console.log('The course is already in the "towatch" list.');
        } else {  // document does not exist (only on online)

            // creacting doc, to prevent deleting empty document by system of firebase add to it any
            // property like this, now the doc is not empty and the system will keep it
            db.collection("towatch").doc(itemText).set({
                exists: "true"
            }).then(function() {
                console.log("");
                console.log('Document successfully written "Courses To Watch" list!');

                getCoursesToWatchListFromDB();

            }).catch(function(error) {
                console.error("Error writing document: ", error);
            });

        }
    }).catch((fail) => {
        // Either
        // 1. failed to read due to some reason such as permission denied ( online )
        // 2. failed because document does not exists on local storage ( offline )
        console.error("Error writing document: ", fail);
    });
}
//-------- Add/Delete from DB Lists -------------------
// rewrire the function with promises
function workWithDBLists (caller){

        let parentItem = caller.parent().parent();


        if(caller.attr("class") === 'control-watched'){ //pressed control-watched btn

            if(parentItem.css('background-color') === "rgb(184, 255, 176)"){ // if bg is green then it's in watched already

                //delete from db
                //reduce counter by 1
                //delete from array
                removeCourseFromDB(caller, watchedCourses, "watched");


                //if search inputs not absent check our item and highlight it with yellow if it contains all words
                if(searchWords.length !== 0){

                    let date = parentItem.children().first().text().trim().toLowerCase();
                    let text = caller.parent().clone().children().remove().end().text().trim().toLowerCase();
                    let itemText = date + " - " + text;
                    let isEvery = searchWords.every(item => itemText.includes(item.toLowerCase().trim()));

                    if(isEvery) {

                        setTimeout(function(){
                            parentItem.css(setStyles(searchWords));
                            foundCourses++;
                            updateFoundCounter();
                        }, 1000);
                    }
                }

            }else if(parentItem.css('background-color') === "rgb(255, 201, 163)"){ // if bg is red then it's in towatch already

                //delete from towatch
                //reduce counter towatch
                //delete from array towatch
                //add to watched
                //increase counter watched
                //add to array watched

                removeCourseFromDB(caller, coursesToWatch, "towatch");
                addToWatchedCoursesDB(caller);


            }else if(parentItem.css('background-color') === "rgb(255, 239, 133)"){ //it's yellow, highlighted by search

                //add to watched
                //increase counter watched
                //update search counter

                addToWatchedCoursesDB(caller);


                foundCourses--;
                updateFoundCounter();


            }else if(parentItem.css('background-color') === "rgba(0, 0, 0, 0)"){ // then it has no bg

                // add to watched
                // increase counter
                // add to array

                addToWatchedCoursesDB(caller);
            }
        }
        else{ // pressed control-towatch btn

            if(parentItem.css('background-color') === "rgb(255, 201, 163)"){ // if bg is red then it's in towatch already

                //delete from db
                //reduce count by 1
                //delete from array

                removeCourseFromDB(caller, coursesToWatch, "towatch");


                //if search inputs not absent check our item and highlight it with yellow if it contains all words
                if(searchWords.length !== 0){

                    let date = parentItem.children().first().text().trim().toLowerCase();
                    let text = caller.parent().clone().children().remove().end().text().trim().toLowerCase();
                    let itemText = date + " - " + text;
                    let isEvery = searchWords.every(item => itemText.includes(item.toLowerCase().trim()));

                    if(isEvery) {

                        setTimeout(function(){
                            parentItem.css(setStyles(searchWords));
                            foundCourses++;
                            updateFoundCounter();
                        }, 1000);
                    }
                }

            }else if(parentItem.css('background-color') === "rgb(184, 255, 176)"){ // if bg is green then it's in watched already

                //delete from watched
                //reduce counter watched
                //delete from array watched
                //add to towatch
                //increase counter towatch
                //add to array towatch

                removeCourseFromDB(caller, watchedCourses, "watched");
                addToCoursesToWatchDB(caller);


            }else if(parentItem.css('background-color') === "rgb(255, 239, 133)"){ //it's yellow, highlighted by search

                //add to watched
                //increase counter watched
                //update search counter
                addToCoursesToWatchDB(caller);


                foundCourses--;
                updateFoundCounter();


            }else if(parentItem.css('background-color') === "rgba(0, 0, 0, 0)"){ // then it has no bg

                // add to watched
                // increase counter
                // add to array

                addToCoursesToWatchDB(caller);
            }
        }
}
//-------- Remove Course From DB ----------------------
function removeCourseFromDB(caller, coursesArray, dbList){

    //getting clean course text
    let itemText = caller.parent().clone().children().remove().end().text().trim();


    if($.inArray(itemText, coursesArray) == "-1"){   //вернет “yes” (именно два знака равно, а не три)
        //делать, если значения нет в массиве
        console.log('Not in the list');
    }else{


        let tempItemText = itemText; // need to correctly update counter
        //if course name contains "/" then replace it with the "&&&"
        //because "/" is borbidden to wtire in docID in firebase
        if(itemText.indexOf(forbiddenChar) != -1){
            tempItemText = itemText.replace(/\//g, "&&&");
        }


        db.collection(dbList).doc(tempItemText).delete().then(function() {
            console.log("");

            if(dbList === "watched"){
                console.log('Document successfully deleted from "Watched Courses" list!');
            }else{
                console.log('Document successfully deleted from "Courses To Watch" list!');
            }


            if(coursesArray === watchedCourses){

                watchedCourses = watchedCourses.filter(function(e) { return e !== itemText }); // удаляем из массива значение

                console.log(watchedCourses);
                $(".watched-courses > .course-counter").text(watchedCourses.length);

            }else{

                coursesToWatch = coursesToWatch.filter(function(e) { return e !== itemText }); // удаляем из массива значение

                console.log(coursesToWatch);
                $(".to-watch-courses > .course-counter").text(coursesToWatch.length);
            }

            caller.parent().parent().css({
                backgroundColor: "rgba(0, 0, 0, 0)",
                fontWeight: "normal"
            });

        }).catch(function(error) {
            console.error("Error removing document: ", error);
        });
    }
}
//-------- Get Courses List ---------------------------
function getCoursesList(){

    let datesOfCourses = [];

    $("div.standard-block__flex ul li a").each(function(){
        var txt = $(this).text().trim();
        listOfCourses.push(txt);
    });

    $("div.standard-block__flex ul li time[datetime]").each(function(){
        var txt = $(this).text().trim();
        datesOfCourses.push(txt);
    });

    if(listOfCourses.length === datesOfCourses.length){
        for(let i = 0; i < listOfCourses.length; i++){
            listOfCoursesForSearch[i] = datesOfCourses[i] + " - " + listOfCourses[i];
        }
    }else{
        console.log("Error in getting list of courses for search");
    }
}
//-------- Adding Input Field -------------------------
function addInputField(){

    let newInput = () => `
<div class="input-items-container">
<input type="text" class="search-input-field">
<button class="add-new-input container-btn">+</button>
<button class="remove-input container-btn">-</button>
</div>
`;

    let lastChild = $('.input-container').children().last();
    $(lastChild).after(newInput);
}
//-------- Get Watched Courses from DB-----------------
function getWatchedListFromDB(){

    db.collection("watched").get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {

            //if course in db contains "&&&" then replace it with original char "/"
            let docID = doc.id;
            if(docID.indexOf(replacedWith) != -1){
                docID = docID.replace(/\&&&/g, "/");
            }

            //if course not in array then add
            if($.inArray(docID, watchedCourses) == "-1"){
                watchedCourses.push(docID);
            }

        });
    }).then(function() {
        $(".watched-courses > .course-counter").text(watchedCourses.length);
        highlight(watchedCourses);
        console.log(watchedCourses);
  });
}
//-------- Get Courses to Watch from DB----------------
function getCoursesToWatchListFromDB(){

    db.collection("towatch").get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {

            //if course in db contains "&&&" then replace it with original char "/"
            let docID = doc.id;
            if(docID.indexOf(replacedWith) != -1){
                docID = docID.replace(/\&&&/g, "/");
            }

            //if course not in array then add
            if($.inArray(docID, coursesToWatch) == "-1"){
                coursesToWatch.push(docID);
            }
        });
    }).then(function() {
        $(".to-watch-courses > .course-counter").text(coursesToWatch.length);
        highlight(coursesToWatch);
        console.log(coursesToWatch);
  });
}
//-------- Removing Input Field -----------------------
function removeInputField(caller){

        const itemParent = caller.parent();
        const itemValue = itemParent.children().first().val();

        if(itemValue !== ""){

            if(searchWords.length !== 0){

                //getting all values of inputs
                let inputListValues = $(".search-input-field")
                .map(function(){return $(this).val();}).get();

                let foundItems = 0;

                // count the same values in another inputs
                for(let i in inputListValues){

                    if(inputListValues[i] === itemValue){
                        foundItems++;
                    }
                }

                // if more than one the same value just delete input box
                if(foundItems > 1){
                    itemParent.remove();
                // if the value is only one then delete it from searchWords array and delete input box
                }else{

                    for(let i in searchWords){

                        if(searchWords[i] === itemValue){
                            searchWords.splice(i,1);
                            break;
                        }
                    }
                    itemParent.remove();
                }
            }else{
                itemParent.remove();
            }
        }else{
            itemParent.remove();
        }

        controlPanelStyling();
        search();
    };
//-------- Set Styles for Highlighting ----------------
function setStyles (data) {

    let styles = {
        fontWeight: "bold",
        backgroundColor: ""
    };

    switch (data) {
        case watchedCourses:
            styles.backgroundColor = "rgb(184, 255, 176)";
            break;
        case coursesToWatch:
            styles.backgroundColor = "rgb(255, 201, 163)";
            break;
        case searchWords:
            styles.backgroundColor = "rgb(255, 239, 133)";
            break;
    }

    return styles;
}
//-------- Set Styles to Controlpanel------------------
function controlPanelStyling () {

    $('.container-wrapper *').css(controlPanelStyles.allElements);
    $('.container-wrapper').css(controlPanelStyles.containerWrapper);
    $('.controlpanel-container').css(controlPanelStyles.controlpanelContainer);
    $('.info-wrapper').css(controlPanelStyles.infoWrapper);
    $('.list-wrapper').css(controlPanelStyles.listWrapper);
    $('.info-list').css(controlPanelStyles.infoList);
    $('.status').css(controlPanelStyles.status);
    $('.courses-info').css(controlPanelStyles.coursesInfo);
    $('.total-courses, .watched-courses, .to-watch-courses').css(controlPanelStyles.allCourses);
    $('.course-counter').css(controlPanelStyles.courseCounter);
    $('.total-courses .course-counter').css(controlPanelStyles.totalCoursesCourseCounter);
    $('.watched-courses .course-counter').css(controlPanelStyles.watchedCoursesCourseCounter);
    $('.to-watch-courses .course-counter').css(controlPanelStyles.toWatchCoursesCourseCounter);
    $('.search-container').css(controlPanelStyles.searchContainer);
    $('.search-heading').css(controlPanelStyles.searchHeading);
    $('.input-container').css(controlPanelStyles.inputContainer);
    $('.input-items-container').css(controlPanelStyles.inputItemsContainer);
    $('.search-input-field').css(controlPanelStyles.searchInput);
    $('.add-new-input, .remove-input').css(controlPanelStyles.addNewInputRemoveInput);
    $('.container-footer').css(controlPanelStyles.containerFooter);
    $('.container-btn').css(controlPanelStyles.containerBtn);
    $('.remove-input, .reset-search').css(controlPanelStyles.removeInputResetSearch);
    $('button.search, .reset-search').css(controlPanelStyles.buttonSearchResetSearch);
    $('.container-buttons').css(controlPanelStyles.containerButtons);
    $('.info-found-courses').css(controlPanelStyles.infoFoundCourses);
    $('.heading-found-courses').css(controlPanelStyles.headingFoundCourses);
    $('.found-courses-counter').css(controlPanelStyles.foundCoursesCounter);

//------------ :hover -------------
     $('.container-btn').hover(
         function(){
             $(this).css({
                 background: "linear-gradient(to bottom, #77a809 5%, #89c403 100%)",
                 backgroundColor: "#77a809"
             });
         }, function(){
             $(this).css(controlPanelStyles.containerBtn);
         }
     );

//---------- control-watched hover ------------------
    $("a").on({
        mouseenter: function () {
            $(this).css({
                background: "linear-gradient(to bottom, #70ad51 5%, #95d177 100%)",
                backgroundColor: "#70ad51"
            });
        },
        mouseleave:function () {
            $(this).css(controlPanelStyles.controlWatchedButton)
        }
    },'.control-watched');

//---------- control-towatch hover ------------------
    $("a").on({
        mouseenter: function () {
            $(this).css({
                background: "linear-gradient(to bottom, #ed3434 5%, #e6935c 100%)",
                backgroundColor: "#ed3434"
            });
        },
        mouseleave:function () {
            $(this).css(controlPanelStyles.controlToWatchButton)
        }
    },'.control-towatch');

    $('.remove-input, .reset-search').hover(
         function(){
             $(this).css({
                 background: "linear-gradient(to bottom, #e4685d 5%, #fc8d83 100%)",
                 backgroundColor: "#e4685d"
             });
         }, function(){
             $(this).css(controlPanelStyles.removeInputResetSearch);
         }
     );

    $('button.search').hover(
         function(){
             $(this).css({
                 background: "linear-gradient(to bottom, #77a809 5%, #89c403 100%)",
                 backgroundColor: "#77a809"
             });
         }, function(){
             $(this).css({padding: "5px"});
         }
     );

    $('.reset-search').hover(
         function(){
             $(this).css({
                 background: "linear-gradient(to bottom, #e4685d 5%, #fc8d83 100%)",
                 backgroundColor: "#e4685d"
             });
         }, function(){
             $(this).css({padding: "5px"});
         }
     );

//------------ :active -------------
    $(".container-btn, .remove-input, .reset-search").mousedown(function(){
        $(this).css({
            position: "relative",
            top: "1px"
        });
    });
    $(".container-btn, .remove-input, .reset-search").mouseup(function(){
       $(this).css({
           position: "inline-block",
            top: "0"
       });
    });

//------------ control-watched :active -------------
    $("a").on({
        mousedown: function () {
            $(this).css({
            position: "relative",
            top: "1px"
        });
        },
        mouseup:function () {
            $(this).css({
           position: "inline-block",
            top: "0"
       });
        }
    },'.control-watched');

//------------ control-towatch :active -------------
   $("a").on({
        mousedown: function () {
            $(this).css({
            position: "relative",
            top: "1px"
        });
        },
        mouseup:function () {
            $(this).css({
           position: "inline-block",
            top: "0"
       });
        }
    },'.control-towatch');
//----------------------------------

}
//-------- Highlight Courses --------------------------
function highlight (data) {

    let styles = setStyles(data);

    // if we search courses then checking if the course containing all values from all inputs
    if (data === searchWords){

        if(searchWords.length === 0){
            return;
        }

        $.each(coursesItems, (function(index, element){

            let elementText = listOfCoursesForSearch[index].toLowerCase().trim();

            // is the name of course containning every value from every input field
            var isEvery = searchWords.every(item => elementText.includes(item.toLowerCase().trim()));

            if(isEvery) {
                // check if the element is not highlighted by other functions (=has transparent bg)
                if($(this).css('background-color') === 'rgba(0, 0, 0, 0)'){
                    $(this).css(styles);
                     foundCourses++;
                }
            }
        }));

    updateFoundCounter();
    //else check and highlight watched courses and courses to watch by full matching
    }else {

        $.each(data, (function(index, item){

            $.each(coursesItems, (function(index, element){

                let elementText = $(this).text().toLowerCase().trim(); // convert text to Lowercase

                // check whether the element's text contain the searching phrase or not
                if(elementText.indexOf(item.toLowerCase().trim()) != -1){
                    $(this).css(styles);
                }
            }));
        }));
    }
}
//-------- Update Found Counter -----------------------
function updateFoundCounter(){
    $(".found-courses-counter").text(foundCourses);
}
//-------- Search -------------------------------------
function search (){

    resetSearch();

     //getting all values of inputs
     let inputListValues = $(".search-input-field")
              .map(function(){return $(this).val();}).get();

     // checking if the value in the array already, if not then add it
     for (let i = 0; i < inputListValues.length; i++){

         let inputValue = inputListValues[i].toLowerCase().trim();

         if(searchWords.length === 0 && inputValue !== ""){
             searchWords.push(inputListValues[i]);
         }

         for(let index = 0; index < searchWords.length; index++){

             if (inputValue === "" || searchWords[index].toLowerCase().trim() === inputValue){
                 break;
             }else{
                 if(index === searchWords.length-1){
                     searchWords.push(inputListValues[i]);
                 }
             }
         }
    }

    highlight(searchWords);

}
//-------- Reset Search -------------------------------
function resetSearch(){

    $.each(coursesItems, (function(index, item){

        // if bg is yellow remove styles
        if($(this).css('background-color') === 'rgb(255, 239, 133)'){ // yellow

            $(this).css({
                backgroundColor: "rgba(0, 0, 0, 0)", // trasparent
                fontWeight: "normal"
            });
        }
    }));

    // temp var for checking uncleared the list
    let leftFoundCourses = 0;

    // if anything has yellow bg the list is not cleared correctly
    $.each(coursesItems, (function(index, item){
        if($(this).css('background-color') === 'rgb(255, 239, 133)'){ // yellow
            leftFoundCourses++;
        }
    }));

    if(leftFoundCourses === 0){
       foundCourses = 0;
    }else{
       foundCourses = NaN;
    }

    // clear the array
    while(searchWords.length > 0){
        searchWords.pop();
    }

    updateFoundCounter();
}
//-------- Add Control Buttons ------------------------
function addButtons(){
        $.each (coursesItems, function (index, item) {
            let lastChild = $(this).children().last();
            lastChild.append(controlButtons);
        });
    }
//-----------------------------------------------------
})();