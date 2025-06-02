async function dohvatiStatistiku() {
    const pocetak = document.getElementById("pocetak").value;
    const kraj = document.getElementById("kraj").value;
    const vrstaApk = document.getElementById("vrstaApkStat").value;
    const ozbiljnost = document.getElementById("Ozbiljnost").value;
    const kategorija = document.getElementById("Kategorija").value;
    const vrstaTestiranja = document.getElementById("VrstTestiranja").value;

    if (!pocetak || !kraj) {
        alert("Unesi početni i krajnji datum.");
        return;
    }

    const headers = { "Content-Type": "application/json" };

    const rezultatMapa = {}; // Ključevi: uvijek isti
    const promises = [];

    // 1. Broj testiranja
    if (vrstaApk !== "Odaberi") {
        promises.push(fetch("https://praksac.onrender.com/api/broj-testiranja-apk", {
            method: "POST",
            headers,
            body: JSON.stringify({ pocetak, kraj, vrstaApk })
        }).then(res => res.json()).then(data => {
            rezultatMapa["broj_testiranja"] = `Broj testiranja (apk ${vrstaApk}) = ${data.rezultat}`;
        }));
    } else {
        promises.push(fetch("https://praksac.onrender.com/api/broj-testiranja", {
            method: "POST",
            headers,
            body: JSON.stringify({ pocetak, kraj })
        }).then(res => res.json()).then(data => {
            rezultatMapa["broj_testiranja"] = `Broj testiranja = ${data.rezultat}`;
        }));
    }


    promises.push(fetch("https://praksac.onrender.com/api/broj-ranjivosti",{
        method:"POST",
        headers,
        body:JSON.stringify({pocetak,kraj})
    })
    .then( res=> res.json()
.then(data=>{
    rezultatMapa["ukupno_ranjivosti"]=`Ukupno ranjivosti = ${data.rezultat}`
}))
)

    // 2. Ranjivosti po ozbiljnosti
    if (ozbiljnost !== "Odaberi") {
        promises.push(fetch("https://praksac.onrender.com/api/ranjivosti-ozbiljnost", {
            method: "POST",
            headers,
            body: JSON.stringify({ pocetak, kraj, ozbiljnost })
        }).then(res => res.json()).then(data => {
            rezultatMapa["ozbiljnost"] = `Ranjivosti (${ozbiljnost}) = ${data.rezultat}`;
        }));
    }

    // 3. Ranjivosti po kategoriji
    if (kategorija !== "Odaberi") {
        promises.push(fetch("https://praksac.onrender.com/api/ranjivosti-kategorija", {
            method: "POST",
            headers,
            body: JSON.stringify({ pocetak, kraj, kategorija })
        }).then(res => res.json()).then(data => {
            rezultatMapa["kategorija"] = `Ranjivosti (${kategorija}) = ${data.rezultat}`;
        }));
    }

    // 4. Ranjivosti po vrsti testiranja
    if (vrstaTestiranja !== "Odaberi") {
        promises.push(fetch("https://praksac.onrender.com/api/ranjivosti-vrsta", {
            method: "POST",
            headers,
            body: JSON.stringify({ pocetak, kraj, vrstaTestiranja })
        }).then(res => res.json()).then(data => {
            rezultatMapa["testiranje"] = `Ranjivosti (${vrstaTestiranja}) = ${data.rezultat}`;
        }));
    }

    try {
        await Promise.all(promises);

        const container = document.getElementById("rezultat");
        container.innerHTML = "";

        // Prikaz u fiksnom redoslijedu
        const redoslijed = ["ukupno_ranjivosti","broj_testiranja", "ozbiljnost", "kategorija", "testiranje"];

        redoslijed.forEach(kljuc => {
            if (rezultatMapa[kljuc]) {
                const el = document.createElement("p");
                el.textContent = rezultatMapa[kljuc];
                container.appendChild(el);
            }
        });

    } catch (err) {
        console.error("Greška pri dohvaćanju podataka", err);
        alert("Dogodila se greška.");
    }
}
