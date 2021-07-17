
const usp = new URLSearchParams(window.location.search);

let allowAdd = false, front, back;

document.getElementById("selected").innerText = usp.get("text");

let formData = new FormData();
formData.append("info", usp.get("text"));
formData.append("filename", usp.get("filename"));

const domain = "https://api.cardly.srg.id.au/"

fetch(domain + "generate_flashcard", {

    method: "POST",
    headers: {
        "X-Cardly-App": "cardz-alpha-native-143349.prod.iam.cardly.srg.id.au"
    },
    body: new URLSearchParams(formData)

}).then(r => r.json()).then(data => {

    if (data.success) {

        front = data.cards[0].question;
        back = data.cards[0].answer;

        document.getElementById("front").innerHTML = data.cards[0].question;
        document.getElementById("back").innerHTML = data.cards[0].answer;

        allowAdd = true;
        document.getElementById("addToAnki").disabled = false;

    } else {
        document.getElementById("error").innerText = `There was an error creating a flashcard for this prompt. ${data.message || "[General error]"}`;
        document.getElementById("error").style.display = "block";
    }

}).catch(e => {
    document.getElementById("error").style.display = "block";
});

// Connect to Anki
fetch("http://localhost:8765", {
    method: "POST",
    body: JSON.stringify({
        action: "deckNames",
        version: 6
    })
}).then(r => r.json()).then(data => {

    const deckopts = document.getElementById("decks");

    for (const deck of data.result) {

        const opt = document.createElement("option");
        opt.value = deck;
        opt.name = deck;
        opt.innerText = deck;

        deckopts.appendChild(opt);

    }

    if (localStorage.getItem("lastDeck") && data.result.includes(localStorage.getItem("lastDeck"))) {
        deckopts.value = localStorage.getItem("lastDeck");
    }

    deckopts.onchange = function(e) {
        localStorage.setItem("lastDeck", e.target.value);
    }
    
}).catch(e => {
    document.getElementById("anki").classList.add("disabled");
});

document.getElementById("addToAnki").onclick = function(e) {

    if (!allowAdd) {
        return alert("Please wait for the flashcard to finish loading.");
    }

    const deck = document.getElementById("decks").value;
    
    fetch("http://localhost:8765", {
        method: "POST",
        body: JSON.stringify({
            "action": "addNote",
            "version": 6,
            "params": {
                "note": {
                    "deckName": deck,
                    "modelName": "Basic",
                    "fields": {
                        "Front": front,
                        "Back": back,
                        "Extra": `Flashcard created from this text: "${ usp.get("text") }"`
                    },
                    "tags": [
                        "from-cardz"
                    ]
                }
            }
        })
    }).then(r => r.json()).then(data => {

        e.target.innerText = "Added!";
        setTimeout(() => {
            e.target.innerText = "Add to Anki";
        }, 1000);

    }).catch((e) => {
        e.target.innerText = "ERROR";
        setTimeout(() => {
            e.target.innerText = "Add to Anki";
        }, 1000);
    })

}