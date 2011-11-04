console.log('define doLogin');
function doLogin(username,password){
  console.log('invoke doLogin: '+username);
  if(document.querySelector('input[name=Login]')){
    document.querySelector('input[name=Login]').value = username;
    document.querySelector('input[name=Password]').value = password
    document.querySelector('form').submit();
  }  
}
