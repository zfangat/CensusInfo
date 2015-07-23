# CensusInfo
Mobile Apps to explore census public information on interactive map available on Android and iOS
You may check censusinfo.html first, there have a brief information about the application and install links for Google Play Store and Apple iTune Store.

The www folder is the core component of Cordova project. After you create the Cordova project, you may replace the www folder with this one.

The www folder strcture:

  index.html --the start page
  css folder -- style sheet
  lib folder for ionic css & js
      ionic   (include both regular and min)
          css
          font
          js    (ionic.bundle.js include core angular.js)
  scripts (inside index.js you need to provide your own Google Developer Key for Google Map JavaScript API)
    controllers
    frameworks (additional directive beyond ionic or angularjs)
    services


