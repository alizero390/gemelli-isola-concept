/* Gemelli Isola — concept prototype v2
   No dependencies, no tracking, no data collection. */
(function () {
  "use strict";

  var OFF = "https://www.ospedaleisolatiberina.it";
  var PORTALE = "https://portalepaziente.ospedaleisolatiberina.it/";
  var ONLINE = "https://serviziprenotazioni.fatebenefratelli-isolatiberina.it/#/";

  /* ---------- Language ---------- */
  var lang = "it";
  try { lang = localStorage.getItem("gi-lang") || "it"; } catch (e) {}
  var listeners = [];

  function t(it, en) { return lang === "en" ? en : it; }

  function applyLang() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-en]").forEach(function (el) {
      var isText = el.tagName === "TITLE" || el instanceof SVGElement;
      if (!el.hasAttribute("data-it")) el.setAttribute("data-it", isText ? el.textContent : el.innerHTML);
      var v = lang === "en" ? el.getAttribute("data-en") : el.getAttribute("data-it");
      if (isText) el.textContent = v; else el.innerHTML = v;
    });
    ["placeholder", "aria-label"].forEach(function (attr) {
      document.querySelectorAll("[data-en-" + attr + "]").forEach(function (el) {
        if (!el.hasAttribute("data-it-" + attr)) el.setAttribute("data-it-" + attr, el.getAttribute(attr) || "");
        el.setAttribute(attr, lang === "en" ? el.getAttribute("data-en-" + attr) : el.getAttribute("data-it-" + attr));
      });
    });
    document.querySelectorAll("[data-lang-toggle]").forEach(function (b) { b.textContent = lang === "en" ? "IT" : "EN"; });
    listeners.forEach(function (fn) { fn(); });
  }

  document.querySelectorAll("[data-lang-toggle]").forEach(function (b) {
    b.addEventListener("click", function () {
      lang = lang === "en" ? "it" : "en";
      try { localStorage.setItem("gi-lang", lang); } catch (e) {}
      applyLang();
    });
  });

  /* ---------- Mobile menu ---------- */
  var mnav = document.getElementById("mobileNav");
  var menuBtns = document.querySelectorAll(".menu-btn, .menu-btn-bb");
  function setMenu(open) {
    if (!mnav) return;
    mnav.setAttribute("data-open", open ? "true" : "false");
    menuBtns.forEach(function (b) { b.setAttribute("aria-expanded", open ? "true" : "false"); });
    document.body.style.overflow = open ? "hidden" : "";
    if (open) { var f = mnav.querySelector("a,button"); if (f) f.focus(); }
  }
  menuBtns.forEach(function (b) { b.addEventListener("click", function () { setMenu(mnav.getAttribute("data-open") !== "true"); }); });
  document.querySelectorAll("[data-close-menu]").forEach(function (b) { b.addEventListener("click", function () { setMenu(false); }); });
  if (mnav) mnav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && mnav && mnav.getAttribute("data-open") === "true") setMenu(false); });

  /* ---------- Dialogs ---------- */
  function openDialog(name) {
    var d = document.getElementById("dlg-" + name);
    if (!d || typeof d.showModal !== "function") return false;
    setMenu(false);
    if (!d.open) d.showModal();
    if (name === "search") { var i = document.getElementById("searchInput"); if (i) { i.focus(); i.select(); renderResults(i.value); } }
    return true;
  }
  document.addEventListener("click", function (e) {
    var trg = e.target.closest("[data-open]");
    if (trg && openDialog(trg.getAttribute("data-open"))) { e.preventDefault(); return; }
    var c = e.target.closest("[data-close]");
    if (c) { var dl = c.closest("dialog"); if (dl) dl.close(); }
  });
  document.querySelectorAll("dialog").forEach(function (d) {
    d.addEventListener("click", function (e) { if (e.target === d) d.close(); });
  });

  /* ---------- Search ---------- */
  var INDEX = [
    ["calendar", "Prenotare una visita o un esame", "Book a visit or test", "Guida in 2 domande, numeri e orari", "2-question guide, numbers and hours", "bookings.html#guida", "prenota prenotazione visita esame cup book booking appointment"],
    ["phone", "Prima visita con ricetta SSR – ReCUP 06 99 39", "First visit with NHS prescription – ReCUP 06 99 39", "Lun–Ven 07.30–19.30 · Sab 07.30–13.00", "Mon–Fri 07:30–19:30 · Sat 07:30–13:00", "tel:+39069939", "recup ricetta impegnativa ssr ssn prima visita prescription first"],
    ["phone", "Visita di controllo – CUP SSN 06 6813 6911", "Follow-up visit – CUP NHS 06 6813 6911", "Lun–Ven 09.00–12.00 / 14.00–17.00", "Mon–Fri 09:00–12:00 / 14:00–17:00", "tel:+390668136911", "controllo cup ssn follow up"],
    ["calendar", "Privato Sociale (tariffa agevolata)", "Social Private (reduced fee)", "Senza ricetta, senza scelta del medico", "No prescription, no choice of doctor", "bookings.html#sociale", "privato sociale tariffa agevolata pagamento reduced fee paid"],
    ["user", "Libera Professione – scegli il medico", "Private Practice – choose your doctor", "CUP Attività Privata 06 6923 4242", "CUP Private Practice 06 6923 4242", "bookings.html#libera", "libera professione privato medico intramoenia private doctor choose specialist"],
    ["laptop", "Prenotazione online (a pagamento)", "Online booking (private)", "Privato Sociale e Libera Professione", "Social Private and Private Practice", ONLINE, "online prenota internet web booking"],
    ["calendar", "Disdire un appuntamento", "Cancel an appointment", "Almeno 3 giorni prima: 06 6813 6911", "At least 3 days before: 06 6813 6911", "bookings.html#day-title", "disdetta disdire annullare cancel cancellation"],
    ["clock", "Orari di accettazione e prelievi", "Check-in and blood test hours", "Sala Assunta, Piano Terra, Scala B", "Sala Assunta, Ground floor, Staircase B", "bookings.html#day-title", "orari accettazione prelievi prelievo sangue sabato blood test saturday hours check-in analisi"],
    ["file", "Ritiro referti online", "Get test results online", "Portale Paziente: codice fiscale e cellulare", "Patient Portal: tax code and mobile phone", "patient-services.html#referti", "referti referto risultati analisi radiologia results report download"],
    ["user", "Portale Paziente", "Patient Portal", "Il tuo spazio personale", "Your personal space", PORTALE, "portale paziente account login accesso portal"],
    ["file", "Copia della cartella clinica", "Copy of medical records", "Digitale o cartacea", "Digital or paper", "patient-services.html#documentazione", "cartella clinica documentazione copia medical records documents"],
    ["bed", "Ricoveri programmati e preospedalizzazione", "Planned admissions and pre-admission", "Sportello Ricoveri, Sala Assunta", "Admissions desk, Sala Assunta", "patient-services.html#ricoveri", "ricovero ricoveri preospedalizzazione degenza admission hospital stay"],
    ["info", "Preparazione a visite ed esami", "Preparing for visits and tests", "Digiuno, farmaci, moduli", "Fasting, medication, forms", "patient-services.html#preparazione", "preparazione digiuno esame colonscopia preparation fasting"],
    ["laptop", "Teleconsulto e servizi digitali", "Teleconsultation and digital services", "Portale, teleconsulto, download referti", "Portal, teleconsultation, results download", "patient-services.html#digitali", "teleconsulto digitale online telemedicina teleconsultation digital"],
    ["globe", "Pazienti stranieri", "International patients", "Documenti per l’accesso alle cure", "Documents to access care", "patient-services.html#stranieri", "stranieri straniero team stp eni foreign international tourist ehic"],
    ["alert", "Pronto Soccorso (24 ore)", "Emergency Department (24/7)", "Accesso veicoli da Ponte Cestio · emergenza 112", "Vehicle access via Ponte Cestio · emergency 112", "contacts.html#pronto-soccorso", "pronto soccorso emergenza urgenza 112 118 emergency er a&e urgent"],
    ["phone", "Numeri utili", "Useful numbers", "CUP, ReCUP, URP, centralino", "CUP, ReCUP, URP, switchboard", "contacts.html#numeri", "numeri telefono contatti centralino phone numbers contact switchboard"],
    ["map", "Come raggiungerci", "Getting here", "Autobus 8, 23, 63, 280, H", "Buses 8, 23, 63, 280, H", "contacts.html#come-arrivare", "come arrivare raggiungere autobus bus indirizzo mappa directions address map"],
    ["map", "Parcheggi e posti riservati", "Parking and reserved spaces", "Circo Massimo, Lungotevere degli Anguillara…", "Circo Massimo, Lungotevere degli Anguillara…", "contacts.html#come-arrivare", "parcheggio parcheggi auto scooter disabili parking car disabled"],
    ["phone", "URP – Relazioni con il pubblico", "Patient relations (URP)", "06 6837 843 · gm.urp@fbf-isola.it", "06 6837 843 · gm.urp@fbf-isola.it", "contacts.html#urp", "urp reclamo reclami segnalazione complaint feedback"],
    ["heart", "Donna e Bambino Nascente – Maternità", "Women & Newborn Care – Maternity", "Ostetricia, sala parto, neonatologia", "Obstetrics, delivery suite, neonatology", OFF + "/centri/donna-bambino-nascente/", "maternita parto gravidanza ostetricia ginecologia neonatologia senologia maternity birth pregnancy gynaecology"],
    ["pulse", "Scienze Cardiovascolari", "Cardiovascular Sciences", "Cardiologia e aritmologia", "Cardiology and arrhythmology", OFF + "/centri/scienze-cardiovascolari/", "cardiologia cuore aritmia cardiology heart"],
    ["bone", "Chirurgia protesica di ginocchio e anca, traumatologia", "Knee & hip replacement, trauma", "Ortopedia", "Orthopaedics", OFF + "/centri/chirurgia-protesica-ginocchio-anca/", "ortopedia protesi ginocchio anca traumatologia orthopaedics knee hip"],
    ["stomach", "Malattie gastrointestinali ed endocrino-metaboliche", "Gastrointestinal & endocrine diseases", "Endoscopia, colon-retto, tiroide", "Endoscopy, colorectal, thyroid", OFF + "/centri/malattie-gastrointestinali-endocrino-metaboliche/", "gastroenterologia endoscopia colonscopia colon tiroide endocrina gastro endoscopy thyroid mici ibd"],
    ["ribbon", "Oncologia, radioterapia e diagnostica per immagini", "Oncology, radiotherapy & imaging", "Urologia, otorino, radiologia", "Urology, ENT, radiology", OFF + "/centri/oncologia-radiologia/", "oncologia tumore radioterapia radiologia tac risonanza urologia otorino oncology cancer imaging mri ct"],
    ["eye", "Patologie della Vista", "Eye Diseases", "Oculistica e chirurgia vitreoretinica", "Ophthalmology and vitreoretinal surgery", OFF + "/centri/patologie-vista/", "oculistica occhi vista cataratta retina eye ophthalmology"],
    ["lab", "Laboratorio analisi e sala prelievi", "Laboratory and blood tests", "Scienze di Laboratorio", "Laboratory Sciences", OFF + "/dipartimenti/scienze-laboratorio/", "laboratorio analisi prelievi sangue lab blood"],
    ["heart", "Sostieni l’ospedale", "Support the hospital", "Donazioni", "Donations", "https://donaora.ospedaleisolatiberina.it/", "dona donazione donate donation"],
  ];

  function norm(s) { return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  var POPULAR = [0, 8, 15, 16, 17];

  function renderResults(q) {
    var ul = document.getElementById("searchResults");
    if (!ul) return;
    var terms = norm(q).split(/\s+/).filter(Boolean);
    var list;
    if (!terms.length) list = POPULAR.map(function (i) { return INDEX[i]; });
    else {
      list = INDEX.map(function (r) {
        var hay = norm(r[1] + " " + r[2] + " " + r[3] + " " + r[4] + " " + r[6]);
        var title = norm(r[1] + " " + r[2]);
        var score = 0;
        for (var i = 0; i < terms.length; i++) {
          if (hay.indexOf(terms[i]) === -1) return null;
          score += title.indexOf(terms[i]) !== -1 ? 2 : 1;
        }
        return { r: r, s: score };
      }).filter(Boolean).sort(function (a, b) { return b.s - a.s; }).slice(0, 8).map(function (x) { return x.r; });
    }
    if (!list.length) {
      ul.innerHTML = '<li class="results-empty">' + t("Nessun risultato. Prova con “referti”, “prelievi” o chiama il centralino 06 68 371.", "No results. Try “results”, “blood test” or call the switchboard 06 68 371.") + "</li>";
      return;
    }
    var head = terms.length ? "" : '<li class="results-empty" style="padding-top:0">' + t("Ricerche frequenti", "Popular searches") + "</li>";
    ul.innerHTML = head + list.map(function (r) {
      var ext = /^https?:/.test(r[5]);
      return '<li><a href="' + r[5] + '"' + (ext ? ' target="_blank" rel="noopener"' : "") + '><svg class="icon" aria-hidden="true"><use href="#i-' + r[0] + '"/></svg><span>' + t(r[1], r[2]) + "<small>" + t(r[3], r[4]) + (ext && r[5].indexOf("tel:") !== 0 ? " ↗" : "") + "</small></span></a></li>";
    }).join("");
  }
  var sIn = document.getElementById("searchInput");
  if (sIn) sIn.addEventListener("input", function () { renderResults(sIn.value); });
  document.addEventListener("click", function (e) {
    var a = e.target.closest("#searchResults a");
    if (a) { var d = a.closest("dialog"); if (d && a.getAttribute("href").charAt(0) !== "h") d.close(); }
  });
  document.querySelectorAll("[data-hero-search]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = f.querySelector("input").value;
      if (sIn) sIn.value = v;
      openDialog("search");
    });
  });
  listeners.push(function () { if (sIn) renderResults(sIn.value); });

  /* ---------- Booking guide ---------- */
  var box = document.getElementById("bookingGuide");
  if (box) {
    var state = { step: 1, a1: null, a2: null };

    var RESULTS = {
      ssrFirst: {
        h: ["Prima visita con ricetta: chiama il ReCUP", "First visit with a prescription: call ReCUP"],
        tel: "+39069939", num: "06 99 39",
        hours: ["ReCUP Regione Lazio · Lun–Ven 07.30–19.30 · Sab 07.30–13.00", "ReCUP Lazio Region · Mon–Fri 07:30–19:30 · Sat 07:30–13:00"],
        list: [["Porta impegnativa (ricetta) e tessera sanitaria", "Bring your prescription and health card"], ["Puoi prenotare anche di persona presso le segreterie degli ambulatori (Lun–Ven 07.30–19.30, Sab 07.30–13.00)", "You can also book in person at the clinic front desks (Mon–Fri 07:30–19:30, Sat 07:30–13:00)"], ["Se l’esame richiede preparazione, leggila prima di prenotare", "If the test needs preparation, read it before booking"]],
        links: [["#ssr", "Vedi il percorso SSR", "See the NHS route", false], [OFF + "/prenotazioni/ssr/", "Pagina ufficiale", "Official page", true]]
      },
      ssrControl: {
        h: ["Visita di controllo: chiama il CUP SSN", "Follow-up visit: call CUP NHS"],
        tel: "+390668136911", num: "06 6813 6911",
        hours: ["CUP SSN · Lun–Ven 09.00–12.00 / 14.00–17.00", "CUP NHS · Mon–Fri 09:00–12:00 / 14:00–17:00"],
        list: [["Se il medico ti ha chiesto un nuovo appuntamento, puoi prenotarlo subito alla segreteria dell’ambulatorio", "If the doctor asked you to come back, you can book directly at the clinic front desk"], ["Porta impegnativa e tessera sanitaria", "Bring your prescription and health card"]],
        links: [["#ssr", "Vedi il percorso SSR", "See the NHS route", false], [OFF + "/prenotazioni/ssr/", "Pagina ufficiale", "Official page", true]]
      },
      ssrUnsure: {
        h: ["Con ricetta SSR: due numeri, a seconda del tipo di visita", "With an NHS prescription: two numbers, depending on the visit"],
        tel: "+39069939", num: "06 99 39",
        hours: ["ReCUP per prime visite · CUP SSN 06 6813 6911 per i controlli", "ReCUP for first visits · CUP NHS 06 6813 6911 for follow-ups"],
        list: [["Prima visita = non sei mai stato visitato per questo problema in ospedale", "First visit = you have not been seen for this problem at the hospital before"], ["Controllo = un medico dell’ospedale ti ha chiesto di tornare", "Follow-up = a hospital doctor asked you to come back"]],
        links: [["#ssr", "Vedi il percorso SSR", "See the NHS route", false]]
      },
      sociale: {
        h: ["Privato Sociale: tariffa agevolata", "Social Private: reduced fee"],
        tel: "+390668136911", num: "06 6813 6911",
        hours: ["CUP · Lun–Ven 09.00–12.00 / 14.00–17.00 · di persona Lun–Ven 07.00–20.00, Sab 07.00–13.00", "CUP · Mon–Fri 09:00–12:00 / 14:00–17:00 · in person Mon–Fri 07:00–20:00, Sat 07:00–13:00"],
        list: [["Non serve la ricetta; il medico viene assegnato dall’ospedale", "No prescription needed; the doctor is assigned by the hospital"], ["Tariffa inferiore alla Libera Professione, di poco superiore al ticket", "Fee lower than Private Practice, slightly above the co-payment"], ["Il sabato i prelievi sono disponibili solo in Privato Sociale", "On Saturdays blood tests are available only as Social Private"]],
        links: [[ONLINE, "Prenota online", "Book online", true, true], ["#sociale", "Vedi il percorso", "See the route", false]]
      },
      libera: {
        h: ["Libera Professione: scegli tu il medico", "Private Practice: choose your doctor"],
        tel: "+390669234242", num: "06 6923 4242",
        hours: ["CUP Attività Privata · Lun–Ven 09.00–12.00 / 14.00–18.00 · Sab 09.00–12.00", "CUP Private Practice · Mon–Fri 09:00–12:00 / 14:00–18:00 · Sat 09:00–12:00"],
        list: [["Indica all’operatore il medico desiderato: scegli il giorno, non l’orario", "Tell the operator which doctor you want: you choose the day, not the time"], ["Non tutti i medici svolgono attività privata", "Not all doctors offer private practice"], ["Con una polizza sanitaria, verifica le convenzioni dirette", "If you have health insurance, check the direct-billing agreements"]],
        links: [[ONLINE, "Prenota online", "Book online", true, true], [OFF + "/attivita-privata/fondi-assicurazioni/", "Fondi e assicurazioni", "Funds & insurers", true]]
      },
      privUnsure: {
        h: ["Senza ricetta: due opzioni a pagamento", "Without a prescription: two paid options"],
        tel: "+390668136911", num: "06 6813 6911",
        hours: ["Privato Sociale (tariffa agevolata) · Libera Professione: 06 6923 4242", "Social Private (reduced fee) · Private Practice: 06 6923 4242"],
        list: [["Privato Sociale costa meno, ma il medico è assegnato dall’ospedale", "Social Private costs less, but the doctor is assigned by the hospital"], ["Libera Professione costa di più e ti permette di scegliere il medico", "Private Practice costs more and lets you choose the doctor"]],
        links: [["#sociale", "Privato Sociale", "Social Private", false], ["#libera", "Libera Professione", "Private Practice", false]]
      },
      unsure: {
        h: ["Nessun problema: ecco come capirlo", "No problem: here is how to tell"],
        tel: "+390668371", num: "06 68 371",
        hours: ["Centralino: ti indirizza all’ufficio giusto", "Switchboard: will direct you to the right office"],
        list: [["Hai una ricetta SSR se il tuo medico di famiglia o uno specialista ti ha prescritto la prestazione (ricetta rossa o elettronica con codice NRE)", "You have an NHS prescription if your GP or a specialist prescribed the service (red or electronic prescription with an NRE code)"], ["Senza ricetta puoi scegliere tra Privato Sociale e Libera Professione", "Without a prescription you can choose Social Private or Private Practice"]],
        links: [["#paths-title", "Confronta le tre modalità", "Compare the three options", false]]
      }
    };

    function choice(val, icon, it, en, subIt, subEn) {
      return '<button class="choice" type="button" data-val="' + val + '"><svg class="icon" aria-hidden="true"><use href="#i-' + icon + '"/></svg><span>' + t(it, en) + (subIt ? "<small>" + t(subIt, subEn) + "</small>" : "") + "</span></button>";
    }
    function progress(n) {
      return '<div class="progress" aria-hidden="true"><span class="on"></span><span' + (n >= 2 ? ' class="on"' : "") + "></span><span" + (n >= 3 ? ' class="on"' : "") + "></span></div>";
    }
    function backBtn() {
      return '<button class="back-btn" type="button" data-back><svg class="icon" aria-hidden="true"><use href="#i-back"/></svg>' + t("Indietro", "Back") + "</button>";
    }

    function resultKey() {
      if (state.a1 === "unsure") return "unsure";
      if (state.a1 === "yes") return state.a2 === "first" ? "ssrFirst" : state.a2 === "control" ? "ssrControl" : "ssrUnsure";
      return state.a2 === "yes" ? "libera" : state.a2 === "no" ? "sociale" : "privUnsure";
    }

    function render(focus) {
      var h = "";
      if (state.step === 1) {
        h = progress(1) + '<span class="step-label">' + t("Domanda 1 di 2", "Question 1 of 2") + "</span><h3>" + t("Hai una ricetta del medico (SSR) per questa prestazione?", "Do you have a doctor’s prescription (NHS) for this service?") + '</h3><div class="choices">' +
          choice("yes", "file", "Sì, ho la ricetta", "Yes, I have a prescription", "Ricetta rossa o elettronica", "Red or electronic prescription") +
          choice("no", "user", "No, pago la prestazione", "No, I will pay privately", "Privato Sociale o Libera Professione", "Social Private or Private Practice") +
          choice("unsure", "info", "Non sono sicuro", "I’m not sure") + "</div>";
      } else if (state.step === 2) {
        if (state.a1 === "yes") {
          h = progress(2) + '<span class="step-label">' + t("Domanda 2 di 2", "Question 2 of 2") + "</span><h3>" + t("È una prima visita o un controllo?", "Is it a first visit or a follow-up?") + '</h3><div class="choices">' +
            choice("first", "calendar", "Prima visita o primo esame", "First visit or first test") +
            choice("control", "check", "Controllo richiesto da un medico dell’ospedale", "Follow-up requested by a hospital doctor") +
            choice("unsure", "info", "Non lo so", "I don’t know") + "</div>";
        } else {
          h = progress(2) + '<span class="step-label">' + t("Domanda 2 di 2", "Question 2 of 2") + "</span><h3>" + t("Vuoi scegliere il medico?", "Do you want to choose your doctor?") + '</h3><div class="choices">' +
            choice("yes", "user", "Sì, voglio scegliere il medico", "Yes, I want to choose", "Libera Professione", "Private Practice") +
            choice("no", "check", "No, va bene qualsiasi medico", "No, any doctor is fine", "Privato Sociale, tariffa agevolata", "Social Private, reduced fee") +
            choice("unsure", "info", "Non lo so", "I don’t know") + "</div>";
        }
        h += backBtn();
      } else {
        var r = RESULTS[resultKey()];
        h = progress(3) + '<div class="result"><div class="result-head"><span class="ok"><svg class="icon" aria-hidden="true"><use href="#i-check"/></svg></span><div><span class="step-label">' + t("Il tuo percorso", "Your route") + "</span><h3 tabindex=\"-1\">" + t(r.h[0], r.h[1]) + "</h3></div></div>" +
          '<a class="phone" href="tel:' + r.tel + '"><svg class="icon" aria-hidden="true"><use href="#i-phone"/></svg><span><b>' + r.num + "</b><small>" + t(r.hours[0], r.hours[1]) + "</small></span></a>" +
          "<ul>" + r.list.map(function (l) { return "<li>" + t(l[0], l[1]) + "</li>"; }).join("") + "</ul>" +
          '<div class="actions">' + r.links.map(function (l) {
            var ext = l[3];
            return '<a class="btn ' + (l[4] ? "btn-primary" : "btn-outline") + ' btn-sm" href="' + l[0] + '"' + (ext ? ' target="_blank" rel="noopener"' : "") + ">" + t(l[1], l[2]) + (ext ? " ↗" : "") + "</a>";
          }).join("") + "</div>" +
          '<button class="back-btn" type="button" data-restart><svg class="icon" aria-hidden="true"><use href="#i-back"/></svg>' + t("Ricomincia", "Start again") + "</button>" +
          '<p class="disclaimer-sm">' + t("Informazione orientativa: non verifica requisiti, esenzioni o disponibilità.", "Guidance only: it does not check eligibility, exemptions or availability.") + "</p></div>";
      }
      box.innerHTML = h;
      if (focus) { var f = box.querySelector("h3[tabindex], .choice"); if (f) f.focus(); }
      if (state.step === 3) {
        var key = resultKey();
        var target = { ssrFirst: "ssr", ssrControl: "ssr", ssrUnsure: "ssr", sociale: "sociale", libera: "libera" }[key];
        document.querySelectorAll(".path").forEach(function (p) { p.classList.toggle("highlight", p.id === target); });
      }
    }

    box.addEventListener("click", function (e) {
      var c = e.target.closest(".choice");
      if (c) {
        var v = c.getAttribute("data-val");
        if (state.step === 1) { state.a1 = v; state.step = v === "unsure" ? 3 : 2; }
        else if (state.step === 2) { state.a2 = v; state.step = 3; }
        render(true); return;
      }
      if (e.target.closest("[data-back]")) { state.step = 1; state.a2 = null; render(true); return; }
      if (e.target.closest("[data-restart]")) { state = { step: 1, a1: null, a2: null }; render(true); }
    });
    listeners.push(function () { render(false); });
  }

  applyLang();
})();
