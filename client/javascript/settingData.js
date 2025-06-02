



    const spremiBtn = document.getElementById("spremiBtn");
    const dodajBtn = document.getElementById("dodajBtn")

    const ranjivosti = [];
    let FrK = 0, FrV = 0, FrS = 0, FrN = 0;
    let BcK = 0, BcV = 0, BcS = 0, BcN = 0;
    let KodK = 0, KodV = 0, KodS = 0, KodN = 0;     
    let kritUk=0, visUk=0, sredUk=0, nisUk=0;
    let sveUku=0;

    function dohvatiVrstuTestiranja(id) {
    switch (id) {
        case "vrstaTest11":
        case "vrstaTest12":
            return "Kod"; // Izvorni kod
        case "vrstaTest13":
            return "Bc"; // Penetracijsko ispitivanje
        case "vrstaTest14":
            return "Fr"; // Frontend
        case "vrstaTest15":
            return "Bc"; // Backend
        default:
            return null;
    }
}

    dodajBtn.addEventListener("click", () => {
        const naziv = document.getElementById("NazivRanjivosti").value;
        const kategorija = document.getElementById("Kategorija").value;

        const ozbiljnost = ["Ozb1", "Ozb2", "Ozb3", "Ozb4", "Ozb5"].find(id => document.getElementById(id).checked);
        const vrstaTest = ["vrstaTest11", "vrstaTest12", "vrstaTest13", "vrstaTest14", "vrstaTest15"].find(id => document.getElementById(id).checked);
        const id_vrste = 1; 
        const ocjenaOzb=document.getElementById("ocjneaOzb").value;
        const scoreCVSS=document.getElementById("scoreCVSS").value;
        




        if (naziv && ozbiljnost && kategorija) {
            const testVrsta = dohvatiVrstuTestiranja(vrstaTest);
            const ozb = document.getElementById(ozbiljnost).value;
            if (testVrsta && ozb) {
    switch (testVrsta) {
        case "Fr":
            switch (ozb) {
                case "Kritična": FrK++;  kritUk++; sveUku++; break;
                case "Visoka": FrV++; visUk++; sveUku++; break;
                case "Srednja": FrS++; sredUk++; sveUku++; break;
                case "Niska": FrN++; nisUk++; sveUku++; break;
            }
            break;
        case "Bc":
            switch (ozb) {
                case "Kritična": BcK++;  kritUk++; sveUku++; break;
                case "Visoka": BcV++; visUk++; sveUku++; break;
                case "Srednja": BcS++;  sredUk++; sveUku++; break;
                case "Niska": BcN++; nisUk++; sveUku++; break;
            }
            break;
        case "Kod":
            switch (ozb) {
                case "Kritična": KodK++; kritUk++; sveUku++; break;
                case "Visoka": KodV++; visUk++; sveUku++; break;
                case "Srednja": KodS++;  sredUk++; sveUku++; break;
                case "Niska": KodN++; nisUk++; sveUku++; break;
            }
            break;
    }
    
}





            ranjivosti.push({
                naziv,
                ozbiljnost: document.getElementById(ozbiljnost).value,
                vrstaTest: document.getElementById(vrstaTest).value,
                kategorija,
                id_vrste,
                ocjenaOzb,
                scoreCVSS
               });
            alert("Ranjivost dodana!");
            //brisanje inputa
            document.getElementById("NazivRanjivosti").value="";
            document.getElementById("Kategorija").value="";
            document.getElementById("ocjneaOzb").value="";
            document.getElementById("scoreCVSS").value="";

            ["Ozb1", "Ozb2", "Ozb3", "Ozb4", "Ozb5"].forEach(id=>{
                document.getElementById(id).checked=false
            });

            ["vrstaTest11", "vrstaTest12", "vrstaTest13", "vrstaTest14", "vrstaTest15"].forEach(id=>{
                document.getElementById(id).checked=false
            });

        } else {
            alert("Molimo unesite sve podatke o ranjivosti.");
        }
    });

    spremiBtn.addEventListener("click", async () => {
        const nazivAPK = document.getElementById("NazivAPK").value;
        const url = document.getElementById("URLServera").value;
        const pocetak = document.getElementById("pocetak").value;
        const kraj = document.getElementById("kraj").value;

         
        const vrstaAPK = document.getElementById("vrstaApkNovoTest").value;


        const alatiZaBazu = Array.from(document.querySelectorAll('input[type="checkbox"][id^="alat"]:checked'))
                            .map(cb => parseInt(cb.id.replace("alat", "")));


        const vrsteTestiranja = [];
        for (let i = 1; i <= 5; i++) {
            if (document.getElementById(`vrstaTe${i}`)?.checked) {
                vrsteTestiranja.push(i);
            }
        }


// Za word dokument tablica sa ranjivostima Zadnja tablica
 const ranjivostiPoOzbiljnosti = {
    Kritična: [],
    Visoka: [],
    Srednja: [],
    Niska: []
};

const ranjivostiZaTablicuSideHeader = [];

ranjivosti.forEach((r, index) => {
    
    const ozbiljnostKey = r.ozbiljnost.trim();
    cvssLink=" https://www.first.org/cvss/calculator/3-1#";
    cvss_link=cvssLink+r.scoreCVSS;

    if (ranjivostiPoOzbiljnosti.hasOwnProperty(ozbiljnostKey)) {
        ranjivostiPoOzbiljnosti[ozbiljnostKey].push({
            id_ranjivosti: index + 1,
            ozbiljnost_detalji: r.ozbiljnost,
            naziv_ranjivosti: r.naziv,
            kategorija: r.kategorija,
            cvss_score: r.scoreCVSS,
            ocjenaOzb: r.ocjenaOzb,
            cvss_link: cvss_link
        });
    }
});

// Priprema podataka za zadnju tablicu
Object.entries(ranjivostiPoOzbiljnosti).forEach(([ozbiljnost, lista]) => {
    lista.forEach((r, index) => {
        ranjivostiZaTablicuSideHeader.push({
            id_ranjivosti: r.id_ranjivosti,
            ozbiljnost_detalji: r.ozbiljnost_detalji,
            naziv_ranjivosti: r.naziv_ranjivosti,
            kategorija: r.kategorija,
            razina: ozbiljnost,
            ocjenaOzb: r.ocjenaOzb,
            cvss_link: cvss_link
        });
    });
});
  

  

//za word dokument tablica glavne vrste ispitivanja
let automatDaNe = "ne";
let rucnoDaNe = "ne";
let pentDaNe = "ne";
let frontDaNe = "ne";
let backDaNe = "ne";

for (let i = 1; i <= 5; i++) {
           const checkbox=document.getElementById(`vrstaTe${i}`);
if( checkbox?.checked){
    switch(i)
    {
        case 1:
             automatDaNe = "da";
            break;
        case 2:
            rucnoDaNe = "da";
            break;
        case 3:
            pentDaNe = "da";
            break;
        case 4:
            frontDaNe = "da";
            break;
        case 5:
            backDaNe = "da";
            break;
    }
}
}
//do ovdje


//za word tablicu sa rnajivostima i ocjenama
const ranjivostiZaTablicu = ranjivosti.map((r, index) => ({
    id_ranjivosti: index + 1,
    naziv_ranjivosti: r.naziv,
    ocjena_ozbiljnosti: r.ocjenaOzb
}));
//do ovdje






//da mi stavlja samo prvu osobu u wordu
        const osobeUnos = document.getElementById("imeIPrezimeTestera").value;
const osoba = osobeUnos
  .split(",")
  .map(o => o.trim())
  .filter(o => o.length > 0)

const urlsrvr=document.getElementById("URLServera").value
const osobeString = osoba.join(", ");
const payload = {
    nazivAPK,
    url,
    pocetak,
    kraj,
    vrstaAPK,
    alatiZaBazu,
    vrsteTestiranja,
    Ime_i_prezime_testera: osobeString, 
    ranjivosti,
    urlsrvr
};



console.log(JSON.stringify(payload, null, 2));
async function AlatiZaWordPriprema() {
    console.log("Funkcija AlatiZaWordPriprema pozvana!");

    // Dohvati sve alate iz baze
    const response = await fetch("https://praksac.onrender.com/api/alatiZaWord");
    const sviAlatiIzBaze = await response.json(); // [{ id, naziv, opis }, ...]
            
    // Stvori mapu za lakši pristup
    const sviAlati = {};
    sviAlatiIzBaze.forEach(alat => {
    
    if (alat.ID_alata) {
        sviAlati[alat.ID_alata] = { naziv: alat.Naziv_alata, opis: alat.Opis };
    } else {
        console.warn("Problem s ID alata:", alat);
    }
});
    console.log(sviAlati);
    // Pronađi ID-jeve checkiranih alata u HTML-u
    const checkiraniIdjevi = Array.from(document.querySelectorAll('input[type="checkbox"][id^="alat"]:checked'))
        .map(cb => parseInt(cb.id.replace("alat", "")));
console.log("Checkirani ID-jevi:", checkiraniIdjevi);
    // Pripremi podatke za Word tablicu
    const alate = checkiraniIdjevi.map(id => ({
    naziv: sviAlati[id]?.naziv || "N/A",
    inacica: "", 
    opis: sviAlati[id]?.opis || "N/A"
}));

    console.log("Generirani alati za Word:", alate);
    return alate;
}
const alatiZaWord = await AlatiZaWordPriprema(); 
console.log("Provjera alata za Word:", alatiZaWord);

        try {
            const res = await fetch("https://praksac.onrender.com/api/testiranje", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const msg = await res.text();
            alert(msg);

            if (res.ok) {
        // tek sada kad je server sve primio - radi Word
        const response = await fetch("javascript/template-generiranog-dokumenta.docx");
        const arrayBuffer = await response.arrayBuffer();
        console.log(arrayBuffer);



        // Prvo učitavamo ZIP datoteku
const zip = new PizZip(arrayBuffer);


// Inicijalizacija Docxtemplater instance
const template = new window.Docxtemplater(zip, {
      paragraphLoop: true,
    linebreaks: true,
});
//pretvaranje datuma iz mm-dd-yyyy u dd-mm-yyyy
const formatDate=(dateString)=>{
                    if(!dateString) return "";
                    const date=new Date(dateString);
                    return date.toLocaleDateString("hr-HR",{day:"2-digit", month:"2-digit",year:"numeric"});
                }
console.log(alatiZaWord);



// Popunjavanje predloška s dinamičkim podacima
template.render({
    nazivAPK, 
    url, 
    pocetak: formatDate(pocetak), 
    kraj:formatDate(kraj), 
    vrstaAPK, 
    alati: alatiZaWord, 
    automatDaNe,
    rucnoDaNe ,
    pentDaNe ,
    frontDaNe ,
    backDaNe,  
    osoba: osoba[0] || "", 
    ranjivosti: ranjivostiZaTablicu, 
    urlsrvr,
    FrK, FrV, FrS, FrN,
    BcK, BcV, BcS, BcN,
    KodK, KodV, KodS, KodN,
    kritUk,visUk,sredUk,nisUk,sveUku,
    ranjivostiKritična: ranjivostiPoOzbiljnosti["Kritična"],
    ranjivostiVisoka: ranjivostiPoOzbiljnosti["Visoka"],
    ranjivostiSrednja: ranjivostiPoOzbiljnosti["Srednja"],
    ranjivostiNiska: ranjivostiPoOzbiljnosti["Niska"],
    owaspKategorija: "OWASP"
});

// Generiranje i preuzimanje Word dokumenta
const out = template.getZip().generate({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
});

// Automatski preuzmi generirani dokument
saveAs(out, "GeneriraniDokument.docx");
    } else {
        alert("Server vratio grešku, Word dokument nije generiran.");
    }

        } catch (err) {
             console.error("Greška kod popunjavanja templatea:", err);
    console.error("Greške u templateu:", err.properties?.errors);
    
        }


    });


   //dobivanje id-eva 
window.addEventListener("DOMContentLoaded", async() =>{
    try{
        const res= await fetch("https://praksac.onrender.com/api/posljednji_id");
        const data=await res.json();

        document.getElementById("IDTestiranja").textContent=data.sljedeciTestID;
        document.getElementById("IDRanjivosti").textContent=data.sljedeciRanjID;
    }catch(err){
        console.error("id ne valja: ",err);
        document.getElementById("IDTestiranja").textContent="gr";
        document.getElementById("IDRanjivosti").textContent="gr";
    }
})


//stvaranje dugmica za alate
document.addEventListener("DOMContentLoaded", () => {
    fetch("https://praksac.onrender.com/api/alati")
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById("alatContainer");

            // Sort po ID_alata
            data.sort((a, b) => a.ID_alata - b.ID_alata);

            data.forEach((alat, index) => {
                const label = document.createElement("label");
                label.setAttribute("for", `alat${index + 1}`);
                label.textContent = alat.Naziv_alata;

                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.id = `alat${index + 1}`;
                checkbox.name = alat.Naziv_alata;
                checkbox.value = alat.ID_alata;

                container.appendChild(label);
                container.appendChild(checkbox);
            });
        })
        .catch(error => console.error("Greška kod dohvaćanja alata:", error));
});



//novi alat
document.getElementById("DodavanjeAlataModal").addEventListener("click", async()=>{
    const naziv=document.getElementById("imeAlata").value.trim();
    const opis=document.getElementById("opisAlata").value.trim();
    const nazivIOpisAlata={
        naziv,
        opis
    };
    if(!opis || !naziv)
    {
        return alert("upišite sve podatke");
    }
    try{
        const res=await fetch("https://praksac.onrender.com/api/Novialati", {
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify(nazivIOpisAlata)
        });
        if(res.ok){
            const noviAlat=await res.json();

            const noviCheckBox=document.createElement("div");
            noviCheckBox.innerHTML=`
                <label for="alat${noviAlat.id}">${noviAlat.opis}</label>
                <input type="checkbox" id="alat${noviAlat.id}" />
            `;
            document.getElementById("alatContainer").appendChild(noviCheckBox);
            document.getElementById("imeAlata").value="";
            document.getElementById("opisAlata").value="";

        }else{
            alert("greška pri dodavanju novog alata");
        }
    }catch(err){
        console.error(err);
        alert("greška pri komunikaciji sa serverom");
    }
})
