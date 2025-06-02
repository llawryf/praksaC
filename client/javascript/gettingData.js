document.addEventListener("DOMContentLoaded", () => {
    fetch("https://praksac.onrender.com/api/pdoaciZaPregled") 
        .then(res => res.json())
        .then(data => {
            const table = document.querySelector("table");
            data.forEach(row => {
                const tr = document.createElement("tr");
                const formatDate=(dateString)=>{
                    if(!dateString) return "";
                    const date=new Date(dateString);
                    return date.toLocaleDateString("hr-HR",{day:"2-digit", month:"2-digit",year:"numeric"});
                }

                tr.innerHTML = `
                    <td>${row.ID_testiranja}</td>
                    <td>${row.Naziv_apk}</td>
                    <td>${row.Vrsta_apk}</td>
                    <td>${formatDate(row.Pocetak_testiranja?.split('T')[0])}</td>
                    <td>${formatDate(row.Kraj_testiranja?.split('T')[0])}</td>
                    <td>${row.URL_servera || ''}</td>
                    <td>${row.Testeri || ''}</td>
                `;

                table.appendChild(tr);
            });
        })
        .catch(err => {
            console.error("Greška kod učitavanja podataka:", err);
        });
});

