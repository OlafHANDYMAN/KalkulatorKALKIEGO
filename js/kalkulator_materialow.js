function obliczMaterialy() {
    const szerokosc = parseFloat(document.getElementById('szerokosc').value);
    const glebokosc = parseFloat(document.getElementById('glebokosc').value);
    const wymiarSZewn = parseFloat(document.getElementById('wymiar_s_zewn').value);
    const iloscSZewn = parseInt(document.getElementById('ilosc_s_zewn').value);
    const wymiarSSciana = parseFloat(document.getElementById('wymiar_s_sciana').value);
    const iloscSSciana = parseInt(document.getElementById('ilosc_s_sciana').value);
    const wypustBoczny = parseFloat(document.getElementById('wypust_boczny').value);
    const wypustOkapowy = parseFloat(document.getElementById('wypust_okapowy').value);

    // Pobranie przekrojów i konwersja na metry
    const przekrojS = document.getElementById('przekroj_s').value.split("x").map(x => parseFloat(x) / 100);
    const przekrojK = document.getElementById('przekroj_k').value.split("x").map(x => parseFloat(x) / 100);

    const platwieDlugosc = szerokosc + (wypustBoczny * 2);
    const platwieBoczneDlugosc = glebokosc;

    const rozstawKrokwi = Math.min(70, szerokosc / Math.ceil(szerokosc / 70));
    const iloscKrokwi = Math.ceil(szerokosc / rozstawKrokwi) + 1;
    const dlugoscKrokwi = Math.sqrt(Math.pow(glebokosc + wypustOkapowy, 2) + Math.pow(wymiarSSciana - wymiarSZewn, 2));

    // Objętość krokwi w m³
    const objKrokwi = iloscKrokwi * przekrojK[0] * przekrojK[1] * (dlugoscKrokwi / 100);
    const cenaKrokwi = objKrokwi * 1970;

    // Objętość słupów/płatwi w m³
    const objBelki = (
        (iloscSZewn * przekrojS[0] * przekrojS[1] * (wymiarSZewn / 100)) +
        (iloscSSciana * przekrojS[0] * przekrojS[1] * (wymiarSSciana / 100)) +
        (2 * przekrojS[0] * przekrojS[1] * (platwieDlugosc / 100)) +
        (2 * przekrojS[0] * przekrojS[1] * (platwieBoczneDlugosc / 100))
    );
    const cenaBelki = objBelki * 2530;

    // Podział belek na 13m odcinki
    function podzielBelki(dlugosci) {
        let odcinki = [];
        let aktualnaBelka = [];
        let pozostalaDlugosc = 1300;
        
        dlugosci.forEach(dlugosc => {
            let zDodatkiem = dlugosc + 10;
            if (pozostalaDlugosc >= zDodatkiem) {
                aktualnaBelka.push(`<span style="color: white;">${zDodatkiem} cm</span>`);
                pozostalaDlugosc -= zDodatkiem;
            } else {
                odcinki.push([...aktualnaBelka, `<span style="color:red;">Odpad: ${pozostalaDlugosc} cm</span>`]);
                aktualnaBelka = [`<span style="color: white;">${zDodatkiem} cm</span>`];
                pozostalaDlugosc = 1300 - zDodatkiem;
            }
        });
        if (aktualnaBelka.length > 0) {
            odcinki.push([...aktualnaBelka, `<span style="color:red;">Odpad: ${pozostalaDlugosc} cm</span>`]);
        }
        return odcinki;
    }

    let belkiKVH = podzielBelki([
        ...Array(iloscSZewn).fill(wymiarSZewn),
        ...Array(iloscSSciana).fill(wymiarSSciana),
        platwieDlugosc, platwieDlugosc,
        platwieBoczneDlugosc, platwieBoczneDlugosc
    ]);

    let podzialHTML = belkiKVH.map((belka, index) => `<p><strong>Belka ${index + 1}:</strong> ${belka.join(' / ')}</p>`).join('');
    
    document.getElementById('wynik').innerHTML = `
        <p><strong>Ilość słupów frontowych:</strong> <span style="color: white;">${iloscSZewn} szt. o długości ${wymiarSZewn} cm</span></p>
        <p><strong>Ilość słupów przyściennych:</strong> <span style="color: white;">${iloscSSciana} szt. o długości ${wymiarSSciana} cm</span></p>
        <p><strong>Płatwie:</strong> <span style="color: white;">2 szt. o długości ${platwieDlugosc} cm</span></p>
        <p><strong>Płatwie boczne:</strong> <span style="color: white;">2 szt. o długości ${platwieBoczneDlugosc} cm</span></p>
        <p><strong>Ilość krokwi:</strong> <span style="color: white;">${iloscKrokwi} szt. o długości ${dlugoscKrokwi.toFixed(2)} cm</span></p>
        <p><strong>Objętość krokwi:</strong> <span style="color: white;">${objKrokwi.toFixed(3)} m³</span></p>
        <p><strong>Koszt krokwi:</strong> <span style="color: white;">${cenaKrokwi.toFixed(2)} zł</span></p>
        <p><strong>Objętość belek:</strong> <span style="color: white;">${objBelki.toFixed(3)} m³</span></p>
        <p><strong>Koszt belek:</strong> <span style="color: white;">${cenaBelki.toFixed(2)} zł</span></p>
        <p><strong>Koszt całkowity:</strong> <span style="color: white;">${(cenaKrokwi + cenaBelki).toFixed(2)} zł</span></p>
        <h3>Podział belek KVH (13m):</h3>
        ${podzialHTML}
        <button id="generate-pdf">Wygeneruj PDF</button>
    `;

    document.getElementById('generate-pdf').addEventListener('click', generatePDF);
}

// Funkcja do generowania PDF
function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ lang: "pl" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Wynik obliczeń - Kalkulator Materiałów", 20, 20, { align: "left" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    let y = 40;
    const lines = document.getElementById('wynik').innerText.split("\n");

    lines.forEach((line, index) => {
        if (line.includes("Wygeneruj PDF")) return;
        if (y > 280) { 
            doc.addPage();
            y = 20; 
        }

        if (index % 2 === 0) {
            doc.setFont("helvetica", "bold");
            doc.setTextColor(255, 140, 0);
        } else {
            doc.setFont("helvetica", "normal");
            doc.setTextColor(0, 0, 0);
        }
        
        doc.text(decodeURIComponent(escape(line.trim())), 20, y); // Poprawka na polskie znaki
        y += 6;
    });

    doc.save("Kalkulator_Materialow.pdf");
}
