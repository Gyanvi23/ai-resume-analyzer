document.getElementById("name").innerText = localStorage.getItem("user");

let resumeText = "";

// PDF PARSING
document.getElementById("file").addEventListener("change", function(e){

    let file = e.target.files[0];

    if(file && file.type === "application/pdf"){
        let reader = new FileReader();

        reader.onload = function(){
            let typedarray = new Uint8Array(this.result);

            pdfjsLib.getDocument(typedarray).promise.then(function(pdf){

                let textPromises = [];

                for(let i=1; i<=pdf.numPages; i++){
                    textPromises.push(
                        pdf.getPage(i).then(page =>
                            page.getTextContent().then(tc =>
                                tc.items.map(item => item.str).join(" ")
                            )
                        )
                    );
                }

                Promise.all(textPromises).then(texts => {
                    resumeText = texts.join(" ").toLowerCase();
                });
            });
        };

        reader.readAsArrayBuffer(file);
    }
});

// ANALYSIS FUNCTION
function analyze(){

let text = document.getElementById("resume").value.toLowerCase() || resumeText;

if(!text){
    alert("Please upload or paste resume");
    return;
}

// KEYWORDS
let skills = ["python","java","c++","html","css","javascript","sql","react"];
let projects = ["project","developed","built","application"];
let experience = ["internship","experience","worked","company"];

// SCORING
let skillScore = 0, projectScore = 0, expScore = 0;
let missing = [];

skills.forEach(s=>{
    if(text.includes(s)) skillScore++;
    else missing.push(s);
});

projects.forEach(p=>{
    if(text.includes(p)) projectScore++;
});

experience.forEach(e=>{
    if(text.includes(e)) expScore++;
});

// FINAL SCORE
let finalScore = Math.floor(
    (skillScore/skills.length)*50 +
    (projectScore/projects.length)*30 +
    (expScore/experience.length)*20
);

document.getElementById("score").innerText = finalScore;
document.getElementById("missing").innerText = missing.join(", ");

// CHART
new Chart(document.getElementById("chart"), {
    type: 'doughnut',
    data: {
        labels: ["Matched", "Missing"],
        datasets: [{
            data: [skillScore, skills.length - skillScore]
        }]
    }
});

// SUGGESTIONS
let suggestion = finalScore > 75
    ? "Excellent resume! Add measurable achievements."
    : "Add more technical skills, projects, and real-world experience.";

document.getElementById("suggestions").innerText = suggestion;

// HISTORY
let history = JSON.parse(localStorage.getItem("history")) || [];
history.push(finalScore);
localStorage.setItem("history", JSON.stringify(history));

let list = document.getElementById("history");
list.innerHTML = "";

history.forEach(h=>{
    let li = document.createElement("li");
    li.innerText = "Score: " + h + "%";
    list.appendChild(li);
});

}