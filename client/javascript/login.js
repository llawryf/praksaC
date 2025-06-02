document.addEventListener("DOMContentLoaded", function () {
    const loginForma = document.getElementById("loginFroma");
    const submitBtn = document.getElementById("submitBtn");
    const pregledIzv=document.getElementById("pregledIvz");
    pregledIzv.style.display='none'; //postavial sam da nema screena za pregled svih izvjestaja, za pocetak
    if (sessionStorage.getItem("loggedIn") === "true") {  
      loginForma.style.display = 'none';
      pregledIzv.style.display = 'block';
    }
    submitBtn.addEventListener("click", function (e) {
      e.preventDefault(); 
  
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
  
      fetch("https://praksac.onrender.com/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })
        .then((res) => {
          if (!res.ok) throw res;
          return res.text();
        })
        .then(() => {
         // alert("Uspješna prijava");
          sessionStorage.setItem("loggedIn", "true"); //spremanje sesije
          //kada se ulogira, nestaje forma
          loginForma.style.display='none';
          //pikaze se pocetni screen
          pregledIzv.style.display='block';
        })
        .catch((err) => {
          err.text().then((msg) => {
           
            console.log("Neispravna lozinka");
            alert("Nesipravna lozinka");
          });
        });
    });
  });
  

  