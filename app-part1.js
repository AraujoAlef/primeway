// ── CONFIG ────────────────────────────────────────────────────────────────────
var API='https://script.google.com/macros/s/AKfycbyg5qOlzM4xXv_fFj1v21AnKoQaFGlm8-kxjPb_rFKQBTcR5wtch7dboJhCMlxYOH8/exec';
var HOJE=new Date();

// ── NAVEGAÇÃO ─────────────────────────────────────────────────────────────────
var hist=['s-home'];
function ir(id){
  document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('active');});
  document.getElementById(id).classList.add('active');
  hist.push(id); window.scrollTo(0,0);
  if(id==='s-clientes') carregarCL();
  if(id==='s-financeiro'){document.getElementById('fin-mes').value=HOJE.getMonth();carregarFIN();}
  if(id==='s-marketing') renderScripts();
}
function voltar(){
  hist.pop();
  var p=hist[hist.length-1]||'s-home';
  document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('active');});
  document.getElementById(p).classList.add('active');
  window.scrollTo(0,0);
}

// ── UTILS ─────────────────────────────────────────────────────────────────────
function fmtV(el){var r=el.value.replace(/\D/g,'');if(!r){el.value='';return;}el.value=(parseInt(r)/100).toLocaleString('pt-BR',{minimumFractionDigits:2});}
function pV(s){return parseFloat((s||'0').replace(/\./g,'').replace(',','.'))||0;}
function fBRL(v){return 'R$ '+(v||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});}
function fData(s){if(!s)return '';try{var p=s.split('-');return p[2]+'/'+p[1]+'/'+p[0];}catch(e){return s;}}
function fDataC(s){if(!s)return '';try{var p=s.split('-');return p[2]+'/'+p[1];}catch(e){return s;}}
function toast(msg){var el=document.getElementById('toast');el.textContent=msg;el.classList.add('show');setTimeout(function(){el.classList.remove('show');},2200);}
function fOv(id,e){if(!e||e.target===document.getElementById(id))document.getElementById(id).classList.remove('open');}
function copiarEl(id,btn){navigator.clipboard.writeText(document.getElementById(id).textContent).then(function(){var o=btn.textContent;btn.textContent='✓ Copiado!';setTimeout(function(){btn.textContent=o;},2000);});}
function cTxt(txt,btn){
  var real=txt.replace(/\\n/g,'\n').replace(/\\'/g,"'");
  navigator.clipboard.writeText(real).then(function(){var o=btn.textContent;btn.textContent='✓ Copiado!';setTimeout(function(){btn.textContent=o;},2000);});
}
function wppEl(id){window.open('https://wa.me/?text='+encodeURIComponent(document.getElementById(id).textContent),'_blank');}
function wTxt(txt){window.open('https://wa.me/?text='+encodeURIComponent(txt.replace(/\\n/g,'\n').replace(/\\'/g,"'")),'_blank');}
function aGet(sheet){return fetch(API+'?sheet='+sheet+'&t='+Date.now()).then(function(r){return r.json();});}
function aPost(body){return fetch(API,{method:'POST',body:JSON.stringify(body)}).then(function(r){return r.json();});}
function hC(s){var h=0;for(var i=0;i<s.length;i++){h=Math.imul(31,h)+s.charCodeAt(i)|0;}return Math.abs(h);}

// HOME DATE
(function(){
  var d=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  var m=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  var el=document.getElementById('home-date');
  if(el) el.textContent=d[HOJE.getDay()]+', '+HOJE.getDate()+' de '+m[HOJE.getMonth()]+' de '+HOJE.getFullYear();
})();

// ── COTAÇÃO ───────────────────────────────────────────────────────────────────
function gerarCotacao(){
  var n=document.getElementById('cot-nome').value.trim();
  var dest=document.getElementById('cot-dest').value.trim()||'o destino';
  var dida=document.getElementById('cot-dida').value, hida=document.getElementById('cot-hida').value;
  var dvolta=document.getElementById('cot-dvolta').value, hvolta=document.getElementById('cot-hvolta').value;
  var cia=document.getElementById('cot-cia').value.trim(), voo=document.getElementById('cot-voo').value;
  var mala=document.getElementById('tog-mala').classList.contains('on');
  var hotel=document.getElementById('cot-hotel').value.trim();
  var hcat=document.getElementById('cot-hcat').value, noites=document.getElementById('cot-noites').value;
  var regime=document.getElementById('cot-regime').value;
  var transfer=document.getElementById('tog-transfer').classList.contains('on');
  var seguro=document.getElementById('tog-seguro-cot').classList.contains('on');
  var vpax=document.getElementById('cot-vpax').value.trim(), pax=document.getElementById('cot-pax').value;
  var total=document.getElementById('cot-total').value.trim(), pgto=document.getElementById('cot-pgto').value.trim();
  var add=document.getElementById('cot-add').value.trim();
  var agora=HOJE.toLocaleDateString('pt-BR')+' às '+HOJE.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
  var t='✈️ COTAÇÃO DE VIAGEM\n━━━━━━━━━━━━━━━━━━━━━\n\n';
  if(n) t+='👤 Cliente: '+n+'\n';
  t+='📍 Destino: '+dest+'\n\n';
  if(dida||hida||dvolta||hvolta||cia||voo||mala){
    t+='✈️ AÉREO\n─────────────────\n';
    if(dida||hida) t+='🛫 Ida:'+(dida?' '+fData(dida):'')+(hida?' às '+hida:'')+'\n';
    if(dvolta||hvolta) t+='🛬 Volta:'+(dvolta?' '+fData(dvolta):'')+(hvolta?' às '+hvolta:'')+'\n';
    if(cia) t+='🏷️ Cia: '+cia+'\n';
    if(voo) t+='🔄 Voo: '+voo+'\n';
    if(mala) t+='🧳 Bagagem: Despacho 23kg incluso\n';
    t+='\n';
  }
  if(hotel||hcat||noites||regime){
    t+='🏨 HOSPEDAGEM\n─────────────────\n';
    if(hotel) t+='🏩 Hotel: '+hotel+'\n';
    if(hcat) t+='⭐ Categoria: '+hcat+'\n';
    if(noites) t+='🌙 Noites: '+noites+'\n';
    if(regime) t+='🍽️ Regime: '+regime+'\n';
    t+='\n';
  }
  if(transfer||seguro){
    t+='🚐 SERVIÇOS\n─────────────────\n';
    if(transfer) t+='🚌 Transfer aeroporto ↔ hotel incluso\n';
    if(seguro) t+='🛡️ Seguro viagem incluso\n';
    t+='\n';
  }
  if(add) t+='✨ ADICIONAIS\n─────────────────\n'+add+'\n\n';
  if(vpax||total||pgto){
    t+='💰 INVESTIMENTO\n─────────────────\n';
    if(vpax&&pax&&parseInt(pax)>1) t+='👤 Por pessoa: R$ '+vpax+'\n👥 Passageiros: '+pax+'\n';
    else if(vpax) t+='💵 Valor por pessoa: R$ '+vpax+'\n';
    if(total) t+='💵 Total do pacote: R$ '+total+'\n';
    if(pgto) t+='💳 Pagamento: '+pgto+'\n';
    t+='\n';
  }
  t+='━━━━━━━━━━━━━━━━━━━━━\n⚠️ Valores sujeitos a alteração sem aviso prévio.\n\n✈️ PrimeWay Viagens\n📅 Cotação gerada em: '+agora;
  document.getElementById('cot-txt').textContent=t;
  document.getElementById('cot-output').style.display='block';
  document.getElementById('cot-output').scrollIntoView({behavior:'smooth',block:'start'});
}
function limparCot(){
  document.querySelectorAll('#s-cotacao input,#s-cotacao select,#s-cotacao textarea').forEach(function(el){el.value='';});
  ['tog-mala','tog-transfer','tog-seguro-cot'].forEach(function(id){
    var el=document.getElementById(id);
    if(el){el.classList.remove('on');el.textContent='Não';}
  });
  document.getElementById('cot-output').style.display='none';
}

// ── CLIENTES ──────────────────────────────────────────────────────────────────
var CL_DB=[], CL_F='todos';
var CL_CORES=['#e8b84b','#4af0a0','#60b4ff','#b78aff','#ff7eb3','#ff9800'];
var CL_SM={lead:{l:'Lead',c:'sb-lead'},cotado:{l:'Cotado',c:'sb-cotado'},negociando:{l:'Negociando',c:'sb-negociando'},fechado:{l:'Fechado',c:'sb-fechado'},viajou:{l:'Viajou',c:'sb-viajou'},perdido:{l:'Perdido',c:'sb-perdido'}};
var CL_ORD=['lead','cotado','negociando','fechado','viajou'];

function ssCL(s){
  var el=document.getElementById('cl-sync');
  if(!el) return;
  if(s==='ok'){el.className='sync-badge s-ok';el.textContent='✅';}
  else if(s==='err'){el.className='sync-badge s-err';el.textContent='❌';}
  else{el.className='sync-badge s-load';el.textContent='⏳';}
}
function carregarCL(){
  ssCL('load');
  aGet('Clientes').then(function(res){
    CL_DB=res.ok?res.data.filter(function(r){return r.id;}).map(function(r){
      return{id:r.id,nome:r.nome||'',wpp:r.wpp||'',dest:r.dest||'',pub:r.pub||'',
        valor:parseFloat(r.valor)||0,data:r.data||'',status:r.status||'lead',
        followup:r.followup||'',obs:r.obs||''};
    }):[];
    ssCL('ok'); rstCL(); renderCL();
  }).catch(function(){
    ssCL('err');
    document.getElementById('cl-lista').innerHTML='<div class="empty"><span>📡</span>Sem conexão. Toque em 🔄</div>';
  });
}
function rstCL(){
  var s={lead:0,cotado:0,negociando:0,fechado:0,viajou:0,perdido:0};
  CL_DB.forEach(function(c){if(s[c.status]!==undefined)s[c.status]++;});
  document.getElementById('cl-stats').innerHTML=
    '<div class="stat"><div class="stat-n" style="color:#60b4ff">'+s.lead+'</div><div class="stat-l">Leads</div></div>'+
    '<div class="stat"><div class="stat-n" style="color:#e8b84b">'+(s.cotado+s.negociando)+'</div><div class="stat-l">Andamento</div></div>'+
    '<div class="stat"><div class="stat-n" style="color:#4af0a0">'+s.fechado+'</div><div class="stat-l">Fechados</div></div>'+
    '<div class="stat"><div class="stat-n" style="color:#b78aff">'+s.viajou+'</div><div class="stat-l">Viajaram</div></div>';
}
function setFCL(f){
  CL_F=f;
  document.querySelectorAll('.ftag').forEach(function(b){b.classList.toggle('on',b.dataset.f===f);});
  renderCL();
}
function renderCL(){
  var q=(document.getElementById('cl-busca').value||'').toLowerCase();
  var lista=CL_DB.filter(function(c){
    var ok=CL_F==='todos'||c.status===CL_F;
    if(q) ok=ok&&((c.nome||'').toLowerCase().includes(q)||(c.dest||'').toLowerCase().includes(q));
    return ok;
  }).sort(function(a,b){return String(b.id).localeCompare(String(a.id));});
  if(!lista.length){
    document.getElementById('cl-lista').innerHTML='<div class="empty"><span>🗂️</span>Nenhum cliente.<br>Toque em "+ Novo"</div>';
    return;
  }
  var hoje=new Date(); hoje.setHours(0,0,0,0);
  document.getElementById('cl-lista').innerHTML=lista.map(function(c){
    var sm=CL_SM[c.status]||{l:c.status,c:'sb-lead'};
    var cor=CL_CORES[hC(c.nome||'A')%CL_CORES.length];
    var ini=(c.nome||'?').trim().split(' ').slice(0,2).map(function(w){return w[0]||'?';}).join('').toUpperCase();
    var fu='';
    if(c.followup){
      var fd=new Date(c.followup+'T00:00:00');
      var diff=Math.round((fd-hoje)/(1000*60*60*24));
      if(diff<0) fu='<div class="fu-alerta">⚠️ Follow-up atrasado!</div>';
      else if(diff===0) fu='<div class="fu-alerta">📌 Follow-up HOJE!</div>';
      else if(diff<=3) fu='<div class="fu-alerta">📅 Follow-up em '+diff+' dia(s)</div>';
    }
    return '<div class="cc"><div class="cc-hdr" onclick="tDetCL(\''+c.id+'\')">'+
      '<div class="cc-av" style="background:'+cor+'">'+ini+'</div>'+
      '<div class="cc-info"><div class="cc-nome">'+(c.nome||'—')+'</div>'+
      '<div class="cc-sub">'+(c.dest||'Destino não informado')+(c.pub?' · '+c.pub:'')+'</div></div>'+
      '<div class="cc-right"><span class="sbadge '+sm.c+'">'+sm.l+'</span>'+
      (c.valor?'<div class="cc-val">'+fBRL(c.valor)+'</div>':'')+
      '</div></div>'+
      '<div class="cc-det" id="ccd-'+c.id+'">'+
      '<div class="dg">'+
      (c.wpp?'<div class="dg-item"><div class="dg-lbl">WhatsApp</div><div class="dg-val">'+c.wpp+'</div></div>':'')+
      (c.data?'<div class="dg-item"><div class="dg-lbl">Data viagem</div><div class="dg-val">'+fData(c.data)+'</div></div>':'')+
      (c.followup?'<div class="dg-item"><div class="dg-lbl">Follow-up</div><div class="dg-val">'+fData(c.followup)+'</div></div>':'')+
      (c.valor?'<div class="dg-item"><div class="dg-lbl">Valor</div><div class="dg-val">'+fBRL(c.valor)+'</div></div>':'')+
      '</div>'+
      (c.obs?'<div class="obs-box"><div class="dg-lbl" style="margin-bottom:4px">Obs.</div><div style="font-size:12px;color:#8a9bb5">'+c.obs+'</div></div>':'')+
      fu+
      '<div class="cc-acts">'+
      (c.wpp?'<button class="act wpp" onclick="wCL(\''+c.wpp+'\')">📲 WhatsApp</button>':'')+
      '<button class="act" onclick="eCL(\''+c.id+'\')">✏️ Editar</button>'+
      '<button class="act" onclick="avCL(\''+c.id+'\')">⏩ Avançar</button>'+
      '<button class="act danger" onclick="xCL(\''+c.id+'\')">🗑️</button>'+
      '</div></div></div>';
  }).join('');
}
function tDetCL(id){var el=document.getElementById('ccd-'+id);if(el)el.classList.toggle('open');}
function abrirModalCL(d){
  document.getElementById('cl-modal-title').textContent=d?'Editar Cliente':'Novo Cliente';
  document.getElementById('cl-edit-id').value=d?d.id:'';
  document.getElementById('cl-f-nome').value=d?d.nome:'';
  document.getElementById('cl-f-wpp').value=d?d.wpp:'';
  document.getElementById('cl-f-dest').value=d?d.dest:'';
  document.getElementById('cl-f-pub').value=d?(d.pub||'Família'):'Família';
  document.getElementById('cl-f-valor').value=d&&d.valor?d.valor.toLocaleString('pt-BR',{minimumFractionDigits:2}):'';
  document.getElementById('cl-f-data').value=d?d.data:'';
  document.getElementById('cl-f-status').value=d?d.status:'lead';
  document.getElementById('cl-f-fu').value=d?d.followup:'';
  document.getElementById('cl-f-obs').value=d?d.obs:'';
  document.getElementById('ov-cl').classList.add('open');
}
function salvarCL(){
  var nome=document.getElementById('cl-f-nome').value.trim();
  if(!nome){alert('Informe o nome!');return;}
  var eid=document.getElementById('cl-edit-id').value;
  var item={id:eid||String(Date.now()),nome:nome,
    wpp:document.getElementById('cl-f-wpp').value.trim(),
    dest:document.getElementById('cl-f-dest').value.trim(),
    pub:document.getElementById('cl-f-pub').value,
    valor:pV(document.getElementById('cl-f-valor').value),
    data:document.getElementById('cl-f-data').value,
    status:document.getElementById('cl-f-status').value,
    followup:document.getElementById('cl-f-fu').value,
    obs:document.getElementById('cl-f-obs').value.trim(),
    criado:eid?'':new Date().toISOString()};
  var btn=document.getElementById('cl-save-btn');
  btn.textContent='⏳ Salvando...'; btn.disabled=true;
  aPost({action:'save',sheet:'Clientes',item:item}).then(function(res){
    btn.textContent='💾 Salvar'; btn.disabled=false;
    if(res.ok){fOv('ov-cl');toast('✅ Cliente salvo!');carregarCL();}
    else toast('❌ Erro ao salvar.');
  }).catch(function(){btn.textContent='💾 Salvar';btn.disabled=false;toast('❌ Sem conexão.');});
}
function eCL(id){var c=CL_DB.find(function(x){return String(x.id)===String(id);});if(c)abrirModalCL(c);}
function xCL(id){
  if(!confirm('Excluir este cliente?'))return;
  aPost({action:'delete',sheet:'Clientes',id:id}).then(function(res){
    if(res.ok){toast('🗑️ Excluído!');carregarCL();}else toast('❌ Erro.');
  }).catch(function(){toast('❌ Sem conexão.');});
}
function avCL(id){
  var c=CL_DB.find(function(x){return String(x.id)===String(id);});
  if(!c)return;
  var idx=CL_ORD.indexOf(c.status);
  if(idx>=CL_ORD.length-1){toast('✅ Já no status máximo!');return;}
  c.status=CL_ORD[idx+1];
  aPost({action:'save',sheet:'Clientes',item:c}).then(function(res){
    if(res.ok){toast('⏩ Status atualizado!');carregarCL();}
  }).catch(function(){toast('❌ Sem conexão.');});
}
function wCL(num){
  var n=num.replace(/\D/g,'');
  if(n.length===11) n='55'+n;
  window.open('https://wa.me/'+n,'_blank');
}
