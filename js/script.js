// --- Onglets ---
function ouvrirOnglet(evt, nomOnglet){
  const tabcontent = document.getElementsByClassName("tabcontent");
  for (let i=0;i<tabcontent.length;i++) tabcontent[i].style.display="none";
  const tablinks = document.getElementsByClassName("tablink");
  for (let i=0;i<tablinks.length;i++) tablinks[i].classList.remove("active");
  document.getElementById(nomOnglet).style.display="block";
  evt.currentTarget.classList.add("active");
}

// --- Liste des piges ---
const pigesDisponibles = [
  {nom:"0.018", diam:0.454, pas:[0.5,0.6,0.7,0.75]},
  {nom:"0.024", diam:0.606, pas:[0.8,1]},
  {nom:"0.029", diam:0.734, pas:[1.25]},
  {nom:"0.032", diam:0.808, pas:[]},
  {nom:"0.040", diam:1.012, pas:[1.5,1.75]},
  {nom:"0.045", diam:1.140, pas:[2]},
  {nom:"0.055", diam:1.397, pas:[2.5]},
  {nom:"0.063", diam:1.600, pas:[3]},
  {nom:"0.072", diam:1.826, pas:[]},
  {nom:"0.081", diam:2.056, pas:[3.5]},
  {nom:"0.092", diam:2.336, pas:[4]},
  {nom:"0.108", diam:2.742, pas:[4.5,5]},
  {nom:"0.120", diam:3.048, pas:[5.5]},
  {nom:"0.127", diam:3.228, pas:[6]},
  {nom:"0.143", diam:3.629, pas:[]},
  {nom:"0.185", diam:4.696, pas:[]}
];

function afficherListePiges(){
  const ul = document.getElementById("listePiges");
  ul.innerHTML="";
  pigesDisponibles.forEach(p=>{
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="pige-nom">Pige ${p.nom} - Diamètre: ${p.diam} mm</div>
      <div class="pige-pas">
        <span class="label">Pas de:</span>
        <span class="values">${p.pas.length ? p.pas.join(' / ') : 'N/A'}</span>
      </div>
    `;
    ul.appendChild(li);
  });
}

// --- Ajustement texte fullscreen ---
function ajusterTailleTexte(el){
  let parentWidth = el.parentElement.offsetWidth - 40;
  let fontSize=10; el.style.fontSize = fontSize + "px";
  while(el.scrollWidth < parentWidth && fontSize < 500){
    fontSize+=2; el.style.fontSize = fontSize+"px";
  }
  if(el.scrollWidth > parentWidth){
    fontSize -=2; el.style.fontSize = fontSize+"px";
  }
}

// --- Calcul pige ---
function calculerPige(){
  const P=parseFloat(document.getElementById('P').value);
  if(isNaN(P)){
    alert("Veuillez renseigner le pas P avant de calculer la pige.");
    return;
  }
  const w=(0.57735*P).toFixed(3);
  document.getElementById('w').value=w;
  return parseFloat(w);
}

// --- Calcul principal ---
function calculer(){
  const M=parseFloat(document.getElementById('M').value);
  const P=parseFloat(document.getElementById('P').value);
  const Emax=parseFloat(document.getElementById('Emax').value);
  const Emin=parseFloat(document.getElementById('Emin').value);
  const nb=parseInt(document.getElementById('nb_pige').value);
  let wInput=document.getElementById('w').value;
  let w; let wAuto=false;
  if(isNaN(M)||isNaN(P)||isNaN(Emax)||isNaN(Emin)||isNaN(nb)){
    alert("Veuillez remplir tous les champs obligatoires !");
    return;
  }
  if(!wInput){ w=calculerPige(); wAuto=true;} else { w=parseFloat(wInput);}
  const constante=nb*w-0.8660254*P;
  const Mmax=(Emax+constante).toFixed(3);
  const Mmin=(Emin+constante).toFixed(3);
  let dmajmax=document.getElementById('dmajmax').value;
  let dmajmin=document.getElementById('dmajmin').value;
  dmajmax=dmajmax?parseFloat(dmajmax).toFixed(3):M.toFixed(3);
  dmajmin=dmajmin?parseFloat(dmajmin).toFixed(3):(M-0.072).toFixed(3);

  document.getElementById('result').innerHTML=
    `<div class="big">Mmax: ${Mmax} mm</div><div class="big">Mmin: ${Mmin} mm</div>
    <strong>Diamètre de fil de pige ≈</strong> ${w} mm ${wAuto?'(calculé automatiquement)':''}<br>
    <strong>Diamètre majeur max ≈</strong> ${dmajmax} mm<br>
    <strong>Diamètre majeur min ≈</strong> ${dmajmin} mm<br>
    <strong>Nombre de fils de pige :</strong> ${nb}`;

  document.getElementById('MmaxDisplay').innerText="Mmax : "+Mmax+" mm";
  document.getElementById('MminDisplay').innerText="Mmin : "+Mmin+" mm";
  document.getElementById('overlayInfo').innerHTML=
    `<strong>Diamètre de fil de pige ≈</strong> ${w} mm ${wAuto?'(calculé automatiquement)':''}<br>
    <strong>Diamètre majeur max ≈</strong> ${dmajmax} mm<br>
    <strong>Diamètre majeur min ≈</strong> ${dmajmin} mm<br>
    <strong>Nombre de fils de pige :</strong> ${nb}`;

  const item={M,P,w,nb,Emax,Emin,dmajmax,dmajmin,Mmax,Mmin,wAuto};
  ajouterHistoriqueDOM(item,true);
}

// --- Historique ---
function chargerHistorique(){
  const data=JSON.parse(localStorage.getItem('historique'))||[];
  data.forEach(item=>ajouterHistoriqueDOM(item,false));
}

function sauvegarderHistorique(item){
  const data=JSON.parse(localStorage.getItem('historique'))||[];
  data.unshift(item);
  localStorage.setItem('historique',JSON.stringify(data));
}

function supprimerHistorique(){
  if(confirm("Supprimer tout l'historique ?")){
    localStorage.removeItem('historique');
    document.getElementById('history').innerHTML='';
  }
}

function supprimerUneEntree(item){
  let data=JSON.parse(localStorage.getItem('historique'))||[];
  data=data.filter(h=>!(h.M===item.M&&h.P===item.P&&h.w===item.w&&h.nb===item.nb&&h.Emax===item.Emax&&h.Emin===item.Emin&&h.dmajmax===item.dmajmax&&h.dmajmin===item.dmajmin));
  localStorage.setItem('historique',JSON.stringify(data));
}

function ajouterHistoriqueDOM(item,sauvegarder=true){
  const historyDiv=document.getElementById('history');
  const data=JSON.parse(localStorage.getItem('historique'))||[];
  const existe=data.some(h=>h.M===item.M&&h.P===item.P&&h.w===item.w&&h.nb===item.nb&&h.Emax===item.Emax&&h.Emin===item.Emin&&h.dmajmax===item.dmajmax&&h.dmajmin===item.dmajmin);
  if(existe && sauvegarder) return;

  const entry=document.createElement('div');
  entry.dataset.info=JSON.stringify(item);

  const textSpan=document.createElement('span');
  textSpan.className='entry-text';
  textSpan.innerHTML=`M${item.M} P: ${item.P} → w≈ ${item.w} ${item.wAuto?'(auto)':''} | Mmax: ${item.Mmax} / Mmin: ${item.Mmin}`;
  textSpan.onclick=function(){
    const data=JSON.parse(entry.dataset.info);
    document.getElementById('M').value=data.M;
    document.getElementById('P').value=data.P;
    document.getElementById('w').value=data.w;
    document.getElementById('nb_pige').value=data.nb;
    document.getElementById('Emax').value=data.Emax;
    document.getElementById('Emin').value=data.Emin;
    document.getElementById('dmajmax').value=data.dmajmax;
    document.getElementById('dmajmin').value=data.dmajmin;
    calculer();
  };

  const deleteBtn=document.createElement('span');
  deleteBtn.innerHTML="❌";
  deleteBtn.className="delete-btn";
  deleteBtn.onclick=function(e){e.stopPropagation(); supprimerUneEntree(item); entry.remove();}

  entry.appendChild(textSpan);
  entry.appendChild(deleteBtn);
  historyDiv.prepend(entry);
  if(sauvegarder) sauvegarderHistorique(item);
}

// --- Reset ---
function resetForm(){
  document.getElementById('M').value='';
  document.getElementById('P').value='';
  document.getElementById('Emax').value='';
  document.getElementById('Emin').value='';
  document.getElementById('dmajmax').value='';
  document.getElementById('dmajmin').value='';
  document.getElementById('w').value='';
  document.getElementById('nb_pige').value=3;
  document.getElementById('result').innerHTML='Entrez les valeurs pour calculer.';
}

// --- Fullscreen ---
function fermerResult(){
  const fs=document.getElementById('fullscreenResult');
  fs.style.opacity=1;
  const fadeOut=setInterval(()=>{
    fs.style.opacity-=0.05;
    if(fs.style.opacity<=0){
      fs.style.display='none';
      clearInterval(fadeOut);
    }
  },15);
}

// --- Presets ---
const presets = {
  "M6":  {M:6,P:1,dmajmax:5.974,dmajmin:5.794,Emax:5.324,Emin:5.212,W:0.606},
  "M8":  {M:8,P:1.25,dmajmax:7.972,dmajmin:7.760,Emax:7.160,Emin:7.042,W:0.734},
  "M10": {M:10,P:1.5,dmajmax:9.968,dmajmin:9.732,Emax:8.994,Emin:8.862,W:1.012},
  "M12": {M:12,P:1.75,dmajmax:11.966,dmajmin:11.701,Emax:10.829,Emin:10.679,W:1.012},
  "M14": {M:14,P:2,dmajmax:13.962,dmajmin:13.682,Emax:12.663,Emin:12.503,W:1.140},
  "M16": {M:16,P:2,dmajmax:15.962,dmajmin:15.682,Emax:14.663,Emin:14.503,W:1.140},
  "M20": {M:20,P:2.5,dmajmax:19.958,dmajmin:19.623,Emax:18.334,Emin:18.164,W:1.397},
};

function appliquerPreset(){
  const presetKey=document.getElementById('presetM').value;
  if(presetKey && presets[presetKey]){
    const p=presets[presetKey];
    document.getElementById('M').value=p.M;
    document.getElementById('P').value=p.P;
    document.getElementById('dmajmax').value=p.dmajmax;
    document.getElementById('dmajmin').value=p.dmajmin;
    document.getElementById('Emax').value=p.Emax;
    document.getElementById('Emin').value=p.Emin;
    document.getElementById('w').value=p.W;
  }
}

// --- Fullscreen result click ---
document.getElementById('result').onclick=function(){
  const fs=document.getElementById('fullscreenResult');
  fs.style.display='flex';
  fs.style.opacity=1;
  setTimeout(()=>{
    ajusterTailleTexte(document.getElementById("MmaxDisplay"));
    ajusterTailleTexte(document.getElementById("MminDisplay"));
  },50);
}

// --- Initialisation ---
window.onload=function(){
  chargerHistorique();
  afficherListePiges();
}
window.addEventListener("resize",()=>{
  ajusterTailleTexte(document.getElementById("MmaxDisplay"));
  ajusterTailleTexte(document.getElementById("MminDisplay"));
});

// --- Service Worker ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('Service Worker enregistré:', reg))
      .catch(err => console.error('Erreur SW:', err));
  });
}
