# CSA-Portail
scrape the portal to make a useful static feed (jquery-mobile)

## phantomjs: getting the page
We use [phantomjs-1.3](http://www.phantomjs.org/) to scrape-n-script the site access.
The script invocations generates the `portfolios.json` file (git ignored).

    # in 1.3 : 
    phantomjs scrape-pluriportail.js username passsword

## setting up CRON (on dirac every hour)
This produces the portfolios.json file, and copies it to appropriate folder

    15 0 0 0 0 0 0 0 0 phantomjs scrape-pluriportail.js P3101060 pluriportail-password
    
## deploying on (no.de,cloudfoundy,goedel,dirac,etc)
deploying publicly accessible (password protect data)