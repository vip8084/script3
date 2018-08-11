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
            minWidth: "340px",
            maxWidth: "820px",

            background: "linear-gradient(110deg, #fdcd3b 60%, #ffed4b 60%)"
        },
        infoWrapper: {
            display: "flex",
            flexWrap: "wrap",
            paddingTop: "1px"
        },
        listWrapper: {
            display: "inline-flex",
            flexWrap: "wrap",
            marginLeft: "10px",
            minWidth: "100px"
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
            width: "96%",
            marginRight: "5px",
            padding: "3px",
            letterSpacing: "2px",
            fontSize: "1.5em",
            fontWeight: "normal",
            border: "1px solid #CC9728",
            borderRadius: "5px",
            outline: "none"
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
        },
        infoFaq:{
            display: "flex",
            margin: "0 2px 0 5px"
        },
        settings:{
            display: "flex",
            marginRight: "10px"
        },
        progressContainer:{
            display: "flex",
            flexGrow: "1",
            justifyContent: "flex-end"
        },
        progressbarContainer:{
            display: "flex",
            minWidth: "50px",
            width: "100%",
            maxWidth: "150px",
            margin: "0 5px"
        },
        controlpanelHeader:{
            display: "flex",
            width: "100%",
            alignItems: "center"
        },
        progressbar:{
            backgroundColor: "white",
            borderRadius: "5px",
            height: "16px",
            width: "100%",
            marginTop: "2px"
        },
        credentialsSection:{
            margin: "2px 10px 0 10px",
            paddingTop: "6px",
            borderTop: "1px solid #853328",
            width: "100%"
        },
        credentialsSectionFieldset:{
            border: "none",
            width: "97%"
        },
        credentialsSectionInput:{
            border: "1px solid #CC9728",
            fontWeight: "normal",
            padding: "2px 5px",
            width: "100%",
            maxWidth: "465px",
            margin: "2px 0",
            borderRadius: "3px",
            height: "20px",
            fontSize: "16px",
            letterSpacing: "1px",
            outline: "none"
        },
        submitSectionSubmit:{
            padding: "5px",
            fontFamily: "Arial",
            fontSize: "11px",
            borderRadius: "5px"
        },
        divSubmitSection:{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            height: "27px",
            margin: "3px 0"
        }
    };

    let controlPanel = (totalCourses, totalWatchedCourses, totalCoursesToWatch, foundCourses) => `
        <div class="container-wrapper">
  <div class="controlpanel-container">
  <div class="controlpanel-header">
      <div class="list-wrapper">
        <p class="info-list">Status : </p>
        <p class="status">connected</p>
    </div>
    <div class="progress-container">
      <p class="progress-label">progress: </p>
      <div class="progressbar-container">
        <div class="progressbar"></div>
      </div>
    </div>
    <div class="info-faq">
      <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
     width="19" height="19"
     viewBox="0 0 252 252"
     style="fill:#000000;"><g fill="none" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><path d="M0,252v-252h252v252z" fill="none"></path><g id="Layer_1"><g id="info-faq" fill="#2098D1"><g><g><g><g><g><g><path d="M248.11172,126c0,-67.42969 -54.68203,-122.11172 -122.11172,-122.11172c-67.42969,0 -122.11172,54.68203 -122.11172,122.11172c0,67.42969 54.68203,122.11172 122.11172,122.11172c67.42969,0 122.11172,-54.68203 122.11172,-122.11172z"></path></g></g></g></g></g></g></g><g fill="#ffffff"><path d="M71.90859,89.33203c0,-6.84141 2.21484,-13.78125 6.59531,-20.81953c4.38047,-7.03828 10.82813,-12.84609 19.24453,-17.47266c8.41641,-4.62656 18.26016,-6.93984 29.53125,-6.93984c10.43438,0 19.6875,1.91953 27.66094,5.80781c8.02266,3.83906 14.175,9.10547 18.55547,15.75c4.38047,6.64453 6.54609,13.83047 6.54609,21.60703c0,6.15234 -1.23047,11.51719 -3.74063,16.09453c-2.51016,4.62656 -5.46328,8.61328 -8.85937,11.96016c-3.44531,3.34687 -9.54844,9.00703 -18.45703,16.93125c-2.46094,2.21484 -4.42969,4.18359 -5.90625,5.90625c-1.47656,1.67344 -2.55937,3.24844 -3.29766,4.62656c-0.73828,1.42734 -1.27969,2.80547 -1.67344,4.23281c-0.39375,1.42734 -0.98437,3.88828 -1.77188,7.43203c-1.37813,7.48125 -5.66016,11.27109 -12.84609,11.27109c-3.74062,0 -6.89062,-1.23047 -9.45,-3.69141c-2.55937,-2.46094 -3.83906,-6.10312 -3.83906,-10.92656c0,-6.05391 0.93516,-11.32031 2.80547,-15.75c1.87031,-4.42969 4.38047,-8.31797 7.48125,-11.66484c3.10078,-3.34688 7.28437,-7.33359 12.55078,-11.96016c4.62656,-4.03594 7.92422,-7.0875 9.99141,-9.15469c2.06719,-2.06719 3.78984,-4.33125 5.16797,-6.89062c1.42734,-2.51016 2.11641,-5.26641 2.11641,-8.21953c0,-5.75859 -2.16562,-10.63125 -6.44766,-14.61797c-4.28203,-3.98672 -9.84375,-5.95547 -16.58672,-5.95547c-7.92422,0 -13.78125,2.01797 -17.52187,6.00469c-3.74062,3.98672 -6.93984,9.89297 -9.49922,17.66953c-2.46094,8.17031 -7.0875,12.20625 -13.92891,12.20625c-4.03594,0 -7.43203,-1.42734 -10.2375,-4.28203c-2.75625,-2.75625 -4.18359,-5.80781 -4.18359,-9.15469zM124.72031,207.85078c-4.38047,0 -8.21953,-1.42734 -11.51719,-4.28203c-3.29766,-2.85469 -4.92187,-6.84141 -4.92187,-11.96016c0,-4.52812 1.575,-8.36719 4.77422,-11.46797c3.15,-3.10078 7.0875,-4.62656 11.66484,-4.62656c4.52813,0 8.36719,1.575 11.46797,4.62656c3.10078,3.10078 4.62656,6.93984 4.62656,11.46797c0,5.06953 -1.62422,9.00703 -4.87266,11.91094c-3.24844,2.90391 -6.98906,4.33125 -11.22187,4.33125z"></path></g></g></g></svg>
    </div>
    <div class="settings">
      <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
     width="25" height="25"
     viewBox="0 0 252 252"
     style="fill:#000000;"><g fill="none" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><path d="M0,252v-252h252v252z" fill="none"></path><g id="Layer_1"><g fill="#ffffff"><path d="M210.45938,108.87187c-1.575,-5.5125 -3.54375,-10.63125 -6.3,-15.55312l17.325,-17.325l-25.00313,-24.80625l-17.325,17.325c-9.64688,-5.5125 -20.67187,-8.46562 -32.09062,-8.6625l-6.3,-23.625l-34.05937,9.05625l6.3,23.625c-9.84375,5.70937 -17.91563,13.97813 -23.42812,23.42812l-23.625,-6.3l-8.85938,34.25625l23.625,6.3c0,5.5125 0.7875,11.025 2.16563,16.5375c1.575,5.5125 3.54375,10.63125 6.3,15.55312l-17.325,17.325l25.00313,24.80625l17.325,-17.325c9.64687,5.5125 20.67188,8.46562 32.09062,8.6625l6.3,23.625l34.05937,-9.05625l-6.3,-23.625c9.84375,-5.70938 17.91563,-13.97812 23.42813,-23.42813l23.625,6.3l9.05625,-34.05937l-23.625,-6.3c0,-5.70938 -0.7875,-11.22188 -2.3625,-16.73438zM154.74375,155.72812c-16.5375,4.33125 -33.27187,-5.31562 -37.8,-21.85312c-4.52813,-16.5375 5.31563,-33.27187 21.85312,-37.8c16.5375,-4.33125 33.27187,5.31563 37.8,21.85313c4.33125,16.5375 -5.5125,33.46875 -21.85313,37.8z"></path></g><g fill="#e5a25b"><path d="M190.77188,108.87187c-1.575,-5.5125 -3.54375,-10.63125 -6.3,-15.55312l17.325,-17.325l-25.00313,-24.80625l-17.325,17.325c-9.64688,-5.5125 -20.67187,-8.46562 -32.09062,-8.6625l-6.3,-23.625l-34.05937,9.05625l6.3,23.625c-9.84375,5.70937 -17.91563,13.97813 -23.42812,23.42812l-23.625,-6.3l-8.85938,34.25625l23.625,6.3c0,5.5125 0.7875,11.025 2.16563,16.5375c1.575,5.5125 3.54375,10.63125 6.3,15.55312l-17.325,17.325l25.00313,24.80625l17.325,-17.325c9.64687,5.5125 20.67188,8.46562 32.09062,8.6625l6.3,23.625l34.05937,-9.05625l-6.3,-23.625c9.84375,-5.70938 17.91563,-13.97812 23.42813,-23.42813l23.625,6.3l9.05625,-34.05937l-23.625,-6.3c0,-5.70938 -0.7875,-11.22188 -2.3625,-16.73438zM135.05625,155.72812c-16.5375,4.33125 -33.27187,-5.31562 -37.8,-21.85312c-4.52813,-16.5375 5.31563,-33.27187 21.85313,-37.8c16.5375,-4.33125 33.27188,5.31563 37.8,21.85313c4.33125,16.5375 -5.5125,33.46875 -21.85313,37.8z"></path></g><g fill="#a66727"><path d="M132.89063,221.48438c-2.55937,0 -4.92187,-1.77188 -5.70938,-4.33125l-5.11875,-19.29375c-9.05625,-0.59062 -18.1125,-3.15 -26.38125,-7.0875l-14.175,14.175c-2.3625,2.3625 -6.10313,2.3625 -8.26875,0l-25.2,-25.00312c-2.3625,-2.3625 -2.3625,-6.10313 0,-8.26875l14.175,-14.175c-1.96875,-4.13437 -3.54375,-8.46562 -4.725,-12.79687c-1.18125,-4.52812 -1.96875,-9.05625 -2.3625,-13.58438l-19.29375,-5.11875c-1.575,-0.39375 -2.75625,-1.37813 -3.54375,-2.75625c-0.7875,-1.37812 -0.98437,-2.95312 -0.59062,-4.52813l9.05625,-34.05938c0.39375,-1.575 1.37812,-2.75625 2.75625,-3.54375c1.37812,-0.7875 2.95313,-0.98437 4.52812,-0.59063l19.29375,5.11875c5.11875,-7.67812 11.61562,-14.175 19.29375,-19.29375l-5.11875,-19.29375c-0.7875,-3.15 0.98438,-6.3 4.13438,-7.28437l34.05937,-9.05625c3.15,-0.7875 6.3,0.98437 7.28438,4.13437l5.11875,19.29375c9.05625,0.59063 18.1125,3.15 26.38125,7.0875l14.175,-14.175c2.16562,-2.16562 6.10312,-2.16562 8.26875,0l25.00312,25.00313c2.3625,2.3625 2.3625,6.10313 0,8.26875l-14.175,14.175c1.96875,4.13438 3.54375,8.46562 4.725,12.79688c1.18125,4.52812 1.96875,9.05625 2.3625,13.58437l19.29375,5.11875c3.15,0.7875 4.92188,4.13437 4.13438,7.28438l-9.05625,34.05937c-0.39375,1.575 -1.37813,2.75625 -2.75625,3.54375c-1.37813,0.7875 -2.95312,0.98438 -4.52813,0.59062l-19.29375,-5.11875c-5.11875,7.67813 -11.61562,14.175 -19.29375,19.29375l5.11875,19.29375c0.7875,3.15 -0.98437,6.3 -4.13437,7.28438l-34.05937,9.05625c-0.39375,0.19688 -0.98437,0.19688 -1.37813,0.19688zM94.5,177.58125c0.98438,0 1.96875,0.19687 2.95313,0.7875c8.85938,5.11875 18.9,7.67813 29.1375,7.875c2.55937,0 4.92188,1.77188 5.70938,4.33125l4.725,17.91563l22.64063,-6.10313l-4.725,-17.91562c-0.59062,-2.55937 0.39375,-5.31563 2.75625,-6.69375c8.85938,-5.11875 16.14375,-12.6 21.2625,-21.2625c1.37812,-2.3625 4.13437,-3.34688 6.69375,-2.75625l17.91563,4.725l6.10312,-22.64062l-17.91562,-4.725c-2.55938,-0.59062 -4.33125,-2.95312 -4.33125,-5.70937c0,-5.11875 -0.7875,-10.2375 -1.96875,-15.15938v0c-1.37813,-4.92187 -3.34688,-9.64687 -5.70938,-14.175c-1.37813,-2.3625 -0.98437,-5.11875 0.98438,-7.0875l12.99375,-12.99375l-16.5375,-16.5375l-12.99375,12.99375c-1.96875,1.96875 -4.725,2.3625 -7.0875,0.98438c-8.85937,-5.11875 -18.9,-7.67812 -29.1375,-7.875c-2.55937,0 -4.92187,-1.77187 -5.70937,-4.33125l-4.725,-17.91562l-23.03438,6.3l4.725,17.91562c0.59063,2.55938 -0.39375,5.31563 -2.75625,6.69375c-8.85937,5.11875 -16.14375,12.6 -21.2625,21.2625c-1.37813,2.3625 -4.13438,3.34688 -6.69375,2.75625l-17.91562,-4.725l-6.10312,22.64063l17.91562,4.725c2.55937,0.59063 4.33125,2.95313 4.33125,5.70937c0,5.11875 0.7875,10.2375 1.96875,15.15938c1.37813,4.92188 3.34688,9.64688 5.70937,14.175c1.37813,2.3625 0.98438,5.11875 -0.98437,7.0875l-12.99375,12.99375l16.5375,16.5375l13.19062,-12.99375c1.18125,-1.37813 2.75625,-1.96875 4.33125,-1.96875zM126.98438,162.81563c-6.3,0 -12.6,-1.575 -18.30937,-4.92187c-8.46563,-4.92187 -14.56875,-12.79687 -17.12813,-22.24687c-2.55937,-9.45 -1.18125,-19.29375 3.74062,-27.95625c4.92188,-8.46563 12.79688,-14.56875 22.24688,-17.12813c19.49062,-5.31563 39.76875,6.49687 45.08437,25.9875c2.55938,9.45 1.18125,19.29375 -3.74062,27.95625c-4.92187,8.46562 -12.79687,14.56875 -22.24687,17.12812v0c-3.34687,0.7875 -6.49688,1.18125 -9.64687,1.18125zM135.05625,155.72812v0zM126.98438,100.99687c-2.16563,0 -4.33125,0.19688 -6.49687,0.7875c-6.49688,1.77187 -11.8125,5.90625 -15.15938,11.61562c-3.34688,5.70937 -4.13438,12.40312 -2.55937,18.9c1.77187,6.49687 5.90625,11.8125 11.61562,15.15938c5.70937,3.34687 12.40313,4.13437 18.9,2.55937v0c6.49687,-1.77188 11.8125,-5.90625 15.15938,-11.61563c3.34687,-5.70937 4.13437,-12.40312 2.55937,-18.9c-2.95312,-11.025 -12.99375,-18.50625 -24.01875,-18.50625z"></path></g></g></g></svg>
    </div>
  </div>
    <div class="credentials-section">
      <fieldset>
        <input placeholder="apiKey" type="text" tabindex="1" required autofocus>
      </fieldset>
      <fieldset>
        <input placeholder="authDomain" type="text" tabindex="2" required>
      </fieldset>
      <fieldset>
        <input placeholder="databaseURL" type="text" tabindex="3" required>
      </fieldset>
      <fieldset>
        <input placeholder="projectId" type="text" tabindex="4" required>
      </fieldset>
      <fieldset>
        <input placeholder="storageBucket" type="text" tabindex="5" required>
      </fieldset>
          <fieldset>
        <input placeholder="messagingSenderId" type="text" tabindex="6" required>
      </fieldset>
      <div class="submit-section">
        <button class="submit container-btn" name="submit">SUBMIT</button>
        <div class="up-arrow">
          <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
     width="30" height="30"
     viewBox="0 0 252 252"
     style="fill:#000000;"><g fill="none" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><path d="M0,252v-252h252v252z" fill="none"></path><path d="M126,226.8c-55.6703,0 -100.8,-45.1297 -100.8,-100.8v0c0,-55.6703 45.1297,-100.8 100.8,-100.8h0c55.6703,0 100.8,45.1297 100.8,100.8v0c0,55.6703 -45.1297,100.8 -100.8,100.8z" fill="#cc7e1b"></path><g id="Layer_1"><path d="M210,126c0,46.3848 -37.6152,84 -84,84c-46.3848,0 -84,-37.6152 -84,-84c0,-46.3848 37.6152,-84 84,-84c46.3848,0 84,37.6152 84,84z" fill="#ffffff"></path><path d="M172.6284,133.9716l-13.0284,13.0284l-34.0284,-32.7642l-33.1716,32.7642l-13.0284,-13.0284l46.2,-45.7716z" fill="#cc7e1b"></path></g></g></svg>
        </div>
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
        <div class="input-items-container">
          <input type="text" class="search-input-field">
          <button class="add-new-input container-btn">+</button>
          <button class="remove-input container-btn">-</button>
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

    $(".up-arrow svg").on("click", function(){
        $(".credentials-section").animate({height: 0, opacity: 0},200);
        $(".credentials-section").hide(200);
    });
    $(".settings svg").on("click", function(){
        $(".credentials-section").animate({height: "184px", opacity: 1},200);
        $(".credentials-section").show(200);
    });


    // settings rotation
    $(".settings svg").hover(
        function(){
            $(this).css({
                'transform' : 'rotate(7200deg)',
                "transition" : "all 30s linear"
            });
        }, function(){
            $(this).css({
                'transform' : '',
                "transition" : "1s"
            });
        }
    );

    // change color faq
    $(".info-faq").on({
        mouseenter: function () {
            $(this).css({
                fill: '#ff4845',
              "transition" : "0.3s"
            });
        },
        mouseleave:function () {
            $(this).css({
                fill: '#2098D1',
              "transition" : "0.7s",
            });
        }
    },'g#info-faq');

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
    $('.info-faq').css(controlPanelStyles.infoFaq);
    $('.settings').css(controlPanelStyles.settings);
    $('.progress-container').css(controlPanelStyles.progressContainer);
    $('.progressbar-container').css(controlPanelStyles.progressbarContainer);
    $('.controlpanel-header').css(controlPanelStyles.controlpanelHeader);
    $('.progressbar').css(controlPanelStyles.progressbar);
    $('.credentials-section').css(controlPanelStyles.credentialsSection);
    $('.credentials-section fieldset').css(controlPanelStyles.credentialsSectionFieldset);
    $('.credentials-section input').css(controlPanelStyles.credentialsSectionInput);
    $('.submit-section .submit').css(controlPanelStyles.submitSectionSubmit);
    $('div.submit-section').css(controlPanelStyles.divSubmitSection);

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
    $(".container-btn, .remove-input, .reset-search, .info-faq svg, .settings svg, .credentials-section svg").mousedown(function(){
        $(this).css({
            position: "relative",
            top: "1px"
        });
    });
    $(".container-btn, .remove-input, .reset-search, .info-faq svg, .settings svg, .credentials-section svg").mouseup(function(){
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