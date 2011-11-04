//var page = new WebPage();
var page = require('webpage').create();
var fs = require('fs');

if (phantom.args.length<2) {
    console.log('usage: phantomjs <username> <passsword>');
    phantom.exit();    
}
var username=phantom.args[0];
var password=phantom.args[1];
var server = 'http://pluri.i-alex.qc.ca/pluriportail/pfr/';

page.onConsoleMessage = function(msg) {
    stamplog('>> '+msg);
};
page.onAlert = function(msg) {
    console.log('>>> '+msg);
};

stamplog('fetching portfolios for user '+username);

var done = {
  count:0
  // Felix:true,...
}

var portfolios = {}
function checkPageInfo(){
  pageInfo =  page.evaluate(function() {
    var url=''+window.location;
    var pageInfo={
      basename: url.substring(url.lastIndexOf('/') + 1)
    };
    var list = document.querySelectorAll('div.FontEnteteUsager');
    if (list.length>0){
      var u = list[0].innerHTML;
      var parent = u.substring(0,u.indexOf('&nbsp;'));
      pageInfo.parent=parent;
      var enfant=u.substring(u.lastIndexOf('(') + 1,u.length-1);// User...(enfant)
      pageInfo.enfant=enfant;
    }
    return pageInfo;
  });
  stamplog('got '+pageInfo.basename+' as '+(pageInfo.parent||'nobody')+' for '+(pageInfo.enfant||'nobody'));
  return pageInfo;
}
//page.open(server+'Login.srf', 'post', data, function (status) {
page.open(server+'Login.srf', function (status) {
  if (status !== 'success') {
    stamplog('Unable to post!');
    phantom.exit();
  } else {
    var pi = checkPageInfo();
    
    if (pi.basename==='Login.srf'){
      page.injectJs("login.js");
      var scriptName='invoke-with-creds-and-remove.js';
      var f = fs.open(scriptName, "w");
      f.write('doLogin("'+username+'","'+password+'");\n');
      f.close();
      page.injectJs(scriptName);
      fs.remove(scriptName);
    } else if (pi.basename==='Accueil.srf'){
      //console.log('reached acceuil with child: '+pi.enfant);
      if (done.count===2){
        var f = fs.open('portfolios.json', "w");
        f.write(JSON.stringify(portfolios,null,2));
        f.close();
        stamplog('wrote portfolios for '+JSON.stringify(done));
        phantom.exit();
      }
      if (done[pi.enfant]){
        page.open(server+'Enfants.srf?ChangeEnfant=2938413');
      } else {
        page.open(server+'TravauxEleve.srf');
      }
    } else if (pi.basename==='TravauxEleve.srf'){
      if (page.injectJs("jquery-1.6.4.min.js")) {}

      var portfolio = page.evaluate(function() {
          // jQuery is loaded, now manipulate the DOM, no need to wait for ready?!
          // that way we can return the value...
          //$(document).ready(extractPortfolio);
          return extractPortfolio();
          function extractPortfolio(){
            portfolio = {
              matieres:[]
            };
            var matiere=null;
            var competence=null;
            $('table.Tab_Standard > tbody > tr').each(function(i,v){
              // $(this)
              //console.log("--"+$(this).html());
              var category='travail';
              if ($(this).hasClass('CellOpaque_Orange')){
                category='matiere'
              } else if ($(this).hasClass('Cell_Orange')){
                category='competence'
              }
              var ligne = {
                category:category,
                name: $(this).find('td:eq(0)').text(),
                result: $(this).find('td:eq(1)').text(),
                max : $(this).find('td:eq(2)').text()
              }
              if (category=='matiere'){
                matiere=ligne;
                competence=null;
                portfolio.matieres.push(matiere);
              } else if (category=='competence'){
                competence=ligne;
                if (matiere) {
                  matiere.competences = matiere.competences || [];
                  matiere.competences.push(competence);
                }
              } else if (category=='travail'){
                if (competence) {
                  competence.travaux = competence.travaux || [];
                  competence.travaux.push(ligne);
                }
              }
              //console.log(JSON.stringify(ligne));
            });
            return portfolio;
           }
      });
      portfolios[pi.enfant]=portfolio;
      done[pi.enfant]=true;
      done.count++;
      page.open(server+'Accueil.srf');
    }
  }
  window.setTimeout(function () {
    //page.render(output);
    phantom.exit();
    }, 30000);
});

function stamplog(msg){
    console.log(iso8601(new Date())+' '+msg);
}
function iso8601(d){
    function pad(n){return n<10 ? '0'+n : n}
    return d.getUTCFullYear()+'-'
    + pad(d.getUTCMonth()+1)+'-'
    + pad(d.getUTCDate())+'T'
    + pad(d.getUTCHours())+':'
    + pad(d.getUTCMinutes())+':'
    + pad(d.getUTCSeconds())+'Z';
}
