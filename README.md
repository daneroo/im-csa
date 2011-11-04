# CSA-Portail
scrape the portal to make a useful static feed (jquery-mobile)

## phantomjs: getting the page
We use [phantomjs-1.3](http://www.phantomjs.org/) to scrape-n-script the site access.
The script invocations generates the `portfolios.json` file (git ignored).

    # in 1.3 : 
    phantomjs scrape-pluriportail.js username passsword

## setting up CRON (on dirac every hour)
This produces the portfolios.json file. it is meant to be deployed in a static web-served folder.

    # crontab -e # on dirac
    15 * * * * cd /Users/daniel/Sites/im-csa; /usr/local/bin/phantomjs scrape-pluriportail.js P3101060 pluriportail-password >> scrape.log 2>&1
    
## deploying on (no.de,cloudfoundy,goedel,dirac,etc)
deploying publicly accessible (password protect data)
