(function(){
const config=SubjectAtlas.current;
const heading=document.getElementById("subject-heading");
heading.textContent=config.name;heading.appendChild(document.createElement("br"));
const line=document.createElement("span");line.textContent="主題研習。";heading.appendChild(line);
document.title=config.name+" 歷年主題題庫";
document.querySelector(".hero .eyebrow").textContent=config.english+" / STUDY ATLAS";
document.querySelector(".drawing-label").textContent=config.name+" / "+config.code;
document.getElementById("subject-name").textContent=config.name;
document.getElementById("footer-subject-name").textContent=config.name+" 主題研習";
document.getElementById("subject-description").textContent=config.description;
document.getElementById("subject-handouts").href="subject-handouts.html?subject="+config.id;
if(config.notice){const note=document.createElement("p");note.className="note";note.textContent=config.notice;document.querySelector("#catalog .filters").before(note);}
})();