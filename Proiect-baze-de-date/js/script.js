document.addEventListener("DOMContentLoaded", function () {

    console.log("Sistem spital pornit");

    const form = document.getElementById("patientForm");

    if(form){
        form.addEventListener("submit", function(e){

            let cnp = document.querySelector("input[name='cnp']").value;
            let telefon = document.querySelector("input[name='telefon']").value;

            if(cnp.length !== 13 || isNaN(cnp)){
                alert("CNP invalid (trebuie 13 cifre)");
                e.preventDefault();
            }

            if(telefon && telefon.length < 10){
                alert("Telefon invalid");
                e.preventDefault();
            }

        });
    }

});