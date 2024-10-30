var consentToggle = document.getElementById("consentToggle");
var submitButton = document.getElementById("submitButton");

consentToggle.addEventListener("click", function(){
    if (consentToggle.checked){
        submitButton.disabled = false;
    } else {
        submitButton.disabled = true;
    }
});