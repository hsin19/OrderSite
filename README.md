## Order Site

Use google sheet as the server side, a small but complete ordering website.

## DEMO

Welcome to do any test.

-   Front end: [https://hsin19.github.io/orderSite](https://hsin19.github.io/orderSite)
-   Back end: [Google Sheets](https://docs.google.com/spreadsheets/d/1FVqxeygKUQh3-hr0ESbJOhcVo_mYfj1L07dclFuizUs/edit#gid=1734984684)

## How to build

There are two parts that need to be built: Google sheets and front end

### Google sheets

1. Create a empty [Google Sheets](https://docs.google.com/spreadsheets)
2. Tools > Script editor
3. Add all script and html from [folder GoogleAppsScript](GoogleAppsScript)
4. Deploy Web app and record the <span id="url">web app URL</span>
5. Go back to google sheets and reorganize, The menu will have a new item `Order Site`, and then select `Create System` and the system will automatically build.

### front end

1.  Host all file in [folder docs](docs > Recommended platform: Netlify, github page, etc.
    . Host all file in [folder docs](docs > Recommended platform: Netlify, github page, etc.
2.  Edit setting.json
    -   url: [web app URL](#url)
        > https://script.google.com/macros/s/YOUR_Deployment_ID/exec
    -   brand(Optional): Website Name
    -   title(Optional): Website Title Tag
3.  (Optional)Modify the favicon.ico, img/logo.png.
4.  (Optional)Modify html such as contact information, footer , etc.

## How to use

### Backend (Google sheets)

`If`
