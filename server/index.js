const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2/promise");

const app = express();
const port = 3000;

const path = require("path");
app.use(express.static(path.join(__dirname, "../client")));




app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));



const pool = mysql.createPool({
    host: 'ucka.veleri.hr',
    user: 'lcelcner',
    password: '11',
    database: 'lcelcner',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


  

//login

  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const [results] = await pool.query("SELECT Username, Lozinka FROM Korisnik WHERE Username = ?", [username]);

        if (results.length > 0) {
            const user = results[0];
            if (user.Lozinka === password) {
                res.send("Prijava uspješna! Dobrodošli!");
            } else {
                res.status(401).send("Neispravna lozinka!");
            }
        } else {
            res.status(404).send("Korisnik ne postoji!");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Greška na serveru");
    }
});
//dobivanje id-eva
app.get("/api/posljednji_id",async (req,res)=>{
    try{
        const [testResult]= await pool.query("SELECT MAX(ID_testiranja) AS maxTestID FROM Testiranje;");
        const [ranjResult]= await pool.query("SELECT MAX(ID_ranjivosti) AS maxRanjID FROM Ranjivost;");

        const nextTID=(testResult[0].maxTestID || 0)+1;
        const nextRID=(ranjResult[0].maxRanjID || 0)+1;

        res.json({
            sljedeciTestID: nextTID,
            sljedeciRanjID: nextRID
        })
    }catch(error){
        console.error(error);
        res.status(500).send("greška u dohvaćanju id-eva");
    }
})

//dobivanje imena alata
app.get("/api/alati",async (req,res)=>{
    try{
        const [results]= await pool.query("SELECT ID_alata, Naziv_alata FROM Alat;");       

        res.json(results)
    }catch(error){
        console.error(error);
        res.status(500).send("greška u dohvaćanju alata");
    }
})

//novi alati
app.post("/api/Novialati", async (req, res) => {
    const { naziv, opis } = req.body;
    if (!naziv || !opis) {
        return res.status(400).send("Naziv i opis su obavezni.");
    }

    const connection = await pool.getConnection();
    try {
        const [result] = await connection.query(`
            INSERT INTO Alat (Naziv_alata, Opis) VALUES (?, ?)
        `, [naziv, opis]);

        const id = result.insertId;
        res.status(201).json({ id, naziv, opis });
    } catch (err) {
        console.error("Greška kod unosa alata:", err);
        res.status(500).send("Greška pri dodavanju alata.");
    } finally {
        connection.release();
    }
});


//za pocetnu tablicu
app.get("/api/pdoaciZaPregled", async (req, res) => {
    const query = `
        SELECT Testiranje.ID_testiranja, 
            Testiranje.Naziv_apk, 
            Testiranje.Vrsta_apk, 
            Testiranje.Pocetak_testiranja, 
            Testiranje.Kraj_testiranja,
            ServerZ.URL_servera AS URL_servera,
            GROUP_CONCAT(Testiranje.Ime_i_prezime_testera SEPARATOR ', ') AS Testeri
        FROM Testiranje 
        LEFT JOIN ServerZ ON Testiranje.ID_testiranja = ServerZ.ID_testiranja        
        GROUP BY 
            Testiranje.ID_testiranja, 
            Testiranje.Naziv_apk, 
            Testiranje.Vrsta_apk, 
            Testiranje.Pocetak_testiranja, 
            Testiranje.Kraj_testiranja,
            Testiranje.Ime_i_prezime_testera,
            ServerZ.URL_servera
        ORDER BY Testiranje.ID_testiranja DESC;
    `;

    try {
        const [results] = await pool.query(query);
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).send("Greška u dohvaćanju testiranja");
    }
});
//podaci za testiranje
app.post("/api/testiranje", async (req, res) => {
    const {
        nazivAPK,
        vrstaAPK,
        pocetak,
        kraj,
        alatiZaBazu,
        Ime_i_prezime_testera,
        vrsteTestiranja,
        ranjivosti,
        urlsrvr
    } = req.body;

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [result] = await connection.query(`
            INSERT INTO Testiranje (Naziv_apk, Vrsta_apk, Pocetak_testiranja, Kraj_testiranja, Ime_i_prezime_testera)
            VALUES (?, ?, ?, ?,?)
        `, [nazivAPK, vrstaAPK, pocetak, kraj, Ime_i_prezime_testera,]);

        const testID = result.insertId;

        if (alatiZaBazu.length > 0) {
            const alatValues = alatiZaBazu.map(id => [testID, id]);
            await connection.query(`
                INSERT INTO Testiranje_Alat (ID_testiranja, ID_alata) VALUES ?
            `, [alatValues]);
        }

       

        if (vrsteTestiranja.length > 0) {
            const vrsteValues = vrsteTestiranja.map(id => [testID, id, 1]);
            await connection.query(`
                INSERT INTO Testiranje_Vrsta (ID_testiranja, ID_vrste, Aktivno) VALUES ?
            `, [vrsteValues]);
        }

        if (ranjivosti.length > 0) {
            const ranjValues = ranjivosti.map(r =>
                [testID, r.naziv, r.ozbiljnost, r.kategorija, r.id_vrste,r.ocjenaOzb,r.scoreCVSS]
            );
            await connection.query(`
                INSERT INTO Ranjivost (ID_testiranja, Naziv, Ozbiljnost, Kategorija, ID_vrste, ocjenaOzb, scoreRanjivosti) VALUES ?
            `, [ranjValues]);
        }
        if(urlsrvr){
            await connection.query(`INSERT INTO ServerZ (ID_Testiranja, URL_servera) VALUES (?,?)`,[testID,urlsrvr]);
        }

        await connection.commit();
        res.status(201).send("Testiranje uneseno uspješno!");

    } catch (err) {
        await connection.rollback();
        console.error("Greška:", err);
        res.status(500).send("Došlo je do greške kod unosa testiranja.");
    } finally {
        connection.release();
    }
});


app.get("/api/alatiZaWord",async (req,res)=>{
    const connection = await pool.getConnection();
    try{
        const [rows]=await connection.execute("SELECT ID_alata, Naziv_alata, Opis FROM Alat;");
        res.json(rows);
    }catch(error)
    {
        console.error("greska u dohvaćanju alata: ",error);
        res.status(500).json({error:"greška u bazi"});
    }
});


//STATISTIKA
// 1. Broj testiranja u rasponu
app.post("/api/broj-testiranja", async (req, res) => {
    const { pocetak, kraj } = req.body;
    const query = `SELECT COUNT(ID_testiranja) AS rezultat FROM Testiranje WHERE Pocetak_testiranja >= ? AND Kraj_testiranja <= ?`;

    try {
        const [rows] = await pool.execute(query, [pocetak, kraj]);
        res.json({ rezultat: rows[0].rezultat });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Greška u bazi." });
    }
});

// 2. Broj testiranja + vrsta apk
app.post("/api/broj-testiranja-apk", async (req, res) => {
    const { pocetak, kraj, vrstaApk } = req.body;
    const query = `SELECT COUNT(ID_testiranja) AS rezultat FROM Testiranje WHERE Pocetak_testiranja >= ? AND Kraj_testiranja <= ? AND Vrsta_apk = ?`;

    try {
        const [rows] = await pool.execute(query, [pocetak, kraj, vrstaApk]);
        res.json({ rezultat: rows[0].rezultat });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Greška u bazi." });
    }
});

// 3. Broj ranjivosti u vremenskom rasponu
app.post("/api/broj-ranjivosti", async (req, res) => {
    const { pocetak, kraj } = req.body;
    const query = `
        SELECT COUNT(Ranjivost.ID_ranjivosti) AS rezultat
        FROM Ranjivost
        LEFT JOIN Testiranje ON Testiranje.ID_testiranja = Ranjivost.ID_testiranja
        WHERE Pocetak_testiranja >= ? AND Kraj_testiranja <= ?
    `;

    try {
        const [rows] = await pool.execute(query, [pocetak, kraj]);
        res.json({ rezultat: rows[0].rezultat });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Greška u bazi." });
    }
});

// 4. Broj ranjivosti po ozbiljnosti
app.post("/api/ranjivosti-ozbiljnost", async (req, res) => {
    const { pocetak, kraj, ozbiljnost } = req.body;
    const query = `
        SELECT COUNT(Ranjivost.ID_ranjivosti) AS rezultat
        FROM Ranjivost
        LEFT JOIN Testiranje ON Testiranje.ID_testiranja = Ranjivost.ID_testiranja
        WHERE Pocetak_testiranja >= ? AND Kraj_testiranja <= ? AND Ranjivost.Ozbiljnost = ?
    `;

    try {
        const [rows] = await pool.execute(query, [pocetak, kraj, ozbiljnost]);
        res.json({ rezultat: rows[0].rezultat });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Greška u bazi." });
    }
});

// 5. Broj ranjivosti po kategoriji
app.post("/api/ranjivosti-kategorija", async (req, res) => {
    const { pocetak, kraj, kategorija } = req.body;
    const query = `
        SELECT COUNT(Ranjivost.ID_ranjivosti) AS rezultat
        FROM Ranjivost
        LEFT JOIN Testiranje ON Testiranje.ID_testiranja = Ranjivost.ID_testiranja
        WHERE Pocetak_testiranja >= ? AND Kraj_testiranja <= ? AND Ranjivost.Kategorija = ?
    `;

    try {
        const [rows] = await pool.execute(query, [pocetak, kraj, kategorija]);
        res.json({ rezultat: rows[0].rezultat });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Greška u bazi." });
    }
});

// 6. Broj ranjivosti po vrsti testiranja (ID_vrste)
app.post("/api/ranjivosti-vrsta", async (req, res) => {
    const { pocetak, kraj, vrstaTestiranja } = req.body;

    // Mapa kao prije
    const vrsteMap = {
        "Automatizirana provjera izvornog koda s pregledom ranjivosti i kategorizacijom istih": 1,
        "Ručna provjera pronađenih problema u izvornom kodu": 2,
        "Penetracijsko ispitivanje": 3,
        "Sigurnosni pregled frontend-a": 4,
        "Sigurnosni pregled backend-a": 5
    };

    const id_vrste = vrsteMap[vrstaTestiranja.trim()];

    if (!id_vrste) {
        return res.status(400).json({ error: "Nepoznata vrsta testiranja." });
    }

    const query = `
        SELECT COUNT(Ranjivost.ID_ranjivosti) AS rezultat
        FROM Ranjivost
        LEFT JOIN Testiranje ON Testiranje.ID_testiranja = Ranjivost.ID_testiranja
        WHERE Pocetak_testiranja >= ? AND Kraj_testiranja <= ? AND Ranjivost.ID_vrste = ?
    `;

    try {
        const [rows] = await pool.execute(query, [pocetak, kraj, id_vrste]);
        res.json({ rezultat: rows[0].rezultat });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Greška u bazi." });
    }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

app.listen(port, () => {
    console.log("Server running at port: " + port);
});

