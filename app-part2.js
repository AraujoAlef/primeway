// ── FINANCEIRO ────────────────────────────────────────────────────────────────
var FIN_V=[], FIN_D=[], FIN_M={};

function ssFIN(s){
  var el=document.getElementById('fin-sync');
  if(!el)return;
  if(s==='ok'){el.className='sync-badge s-ok';el.textContent='✅';}
  else if(s==='err'){el.className='sync-badge s-err';el.textContent='❌';}
  else{el.className='sync-badge s-load';el.textContent='⏳';}
}
function getMesFIN(){return parseInt(document.getElementById('fin-mes').value);}
function filtMes(arr){
  var m=getMesFIN();
  return arr.filter(function(x){
    if(!x.data)return true;
    try{return parseInt(String(x.data).split('-')[1])-1===m;}catch(e){return true;}
  });
}
function carregarFIN(){
  ssFIN('load');
  Promise.all([aGet('Vendas'),aGet('Despesas'),aGet('Metas')]).then(function(res){
    FIN_V=res[0].ok?res[0].data.filter(function(r){return r.id;}).map(function(r){
      return{id:r.id,nome:r.nome||'',tipo:r.tipo||'avulso',
        hotel:parseFloat(r.hotel)||0,mhotel:r.mhotel||'10',
        voo:parseFloat(r.voo)||0,embarque:parseFloat(r.embarque)||0,
        mvoo:r.mvoo||'5',outros:parseFloat(r.outros)||0,
        moutros:r.moutros||'0',seguro:parseFloat(r.seguro)||0,
        comissao:parseFloat(r.comissao)||0,totalPacote:parseFloat(r.totalPacote)||0,
        data:r.data||''};
    }):[];
    FIN_D=res[1].ok?res[1].data.filter(function(r){return r.id;}).map(function(r){
      return{id:r.id,nome:r.nome||'',valor:parseFloat(r.valor)||0,cat:r.cat||'',data:r.data||''};
    }):[];
    FIN_M={};
    if(res[2].ok) res[2].data.forEach(function(m){if(m.chave)FIN_M[m.chave]=parseFloat(m.valor)||0;});
    ssFIN('ok'); renderFIN();
  }).catch(function(){ssFIN('err');toast('❌ Sem conexão com a planilha');});
}
function setTabFIN(i){[0,1].forEach(function(k){document.getElementById('fin-tab-'+k).className='tab'+(k===i?' on':'');document.getElementById('fin-pane-'+k).style.display=k===i?'block':'none';});}
function renderFIN(){
  var v=filtMes(FIN_V), d=filtMes(FIN_D);
  var chave=getMesFIN()+'-'+HOJE.getFullYear();
  var meta=FIN_M[chave]||0;
  var tCom=v.reduce(function(s,x){return s+x.comissao;},0);
  var tVol=v.reduce(function(s,x){return s+x.totalPacote;},0);
  var tDesp=d.reduce(function(s,x){return s+x.valor;},0);
  var liq=tCom-tDesp; var qtd=v.length;
  document.getElementById('fin-kpis-top').innerHTML=
    '<div class="kcard"><div class="kcard-lbl">💰 Comissão</div><div class="kcard-val" style="color:#4af0a0">'+fBRL(tCom)+'</div><div class="kcard-sub">'+qtd+' venda(s)</div></div>'+
    '<div class="kcard"><div class="kcard-lbl">📤 Despesas</div><div class="kcard-val" style="color:#ff6b6b">'+fBRL(tDesp)+'</div></div>';
  document.getElementById('fin-kpis-bot').innerHTML=
    '<div class="kcard"><div class="kcard-lbl">💵 Líquido</div><div class="kcard-val" style="color:'+(liq>=0?'#4af0a0':'#ff6b6b')+'">'+fBRL(liq)+'</div></div>'+
    '<div class="kcard"><div class="kcard-lbl">📦 Volume</div><div class="kcard-val" style="color:#60b4ff">'+fBRL(tVol)+'</div></div>'+
    '<div class="kcard"><div class="kcard-lbl">🏆 Ticket</div><div class="kcard-val" style="color:#e8b84b">'+(qtd?fBRL(tCom/qtd):'R$ 0')+'</div></div>';
  var pct=meta>0?Math.min(100,Math.round(tCom/meta*100)):0;
  document.getElementById('fin-prog').style.width=pct+'%';
  document.getElementById('fin-meta-info').innerHTML=
    '<span>'+pct+'% atingido'+(meta?' de '+fBRL(meta):'')+'</span>'+
    (meta>0?'<span>Falta: <b>'+fBRL(Math.max(0,meta-tCom))+'</b></span>':'<span style="color:#e8b84b">Defina uma meta ↑</span>');
  renderVendasFIN(v); renderDespFIN(d);
}
function renderVendasFIN(vs){
  if(!vs.length){document.getElementById('fin-vendas').innerHTML='<div class="empty"><span>💰</span>Nenhuma venda neste mês.</div>';return;}
  document.getElementById('fin-vendas').innerHTML=vs.sort(function(a,b){return String(b.id).localeCompare(String(a.id));}).map(function(v){
    var tipoLabel=v.tipo==='operadora'?'🏢 Operadora':'✈️ Avulso';
    return '<div class="vc"><div class="vc-hdr" onclick="tVF(\''+v.id+'\')">'+
      '<div class="vc-ico">'+(v.tipo==='operadora'?'🏢':'✈️')+'</div>'+
      '<div class="vc-info"><div class="vc-nome">'+(v.nome||'Venda')+'</div><div class="vc-sub">'+fDataC(v.data)+' · '+tipoLabel+'</div></div>'+
      '<div class="vc-right"><div class="vc-com">+'+fBRL(v.comissao)+'</div><div class="vc-tot">'+fBRL(v.totalPacote)+'</div></div>'+
      '</div><div class="vc-det" id="vfd-'+v.id+'"><div class="vg">'+
      (v.hotel?'<div class="vg-item"><div class="vg-lbl">Hotel</div><div class="vg-val">'+fBRL(v.hotel)+'</div></div>':'')+
      (v.voo?'<div class="vg-item"><div class="vg-lbl">Passagem</div><div class="vg-val">'+fBRL(v.voo)+'</div></div>':'')+
      (v.embarque?'<div class="vg-item"><div class="vg-lbl">Tx.Embarque</div><div class="vg-val" style="color:#8a9bb5">'+fBRL(v.embarque)+'</div></div>':'')+
      (v.seguro?'<div class="vg-item"><div class="vg-lbl">Seguro</div><div class="vg-val">'+fBRL(v.seguro)+'</div></div>':'')+
      (v.outros?'<div class="vg-item"><div class="vg-lbl">Outros</div><div class="vg-val">'+fBRL(v.outros)+'</div></div>':'')+
      '<div class="vg-item"><div class="vg-lbl">Comissão</div><div class="vg-val" style="color:#4af0a0">'+fBRL(v.comissao)+'</div></div>'+
      '</div><div class="cc-acts"><button class="act" onclick="eVF(\''+v.id+'\')">✏️ Editar</button><button class="act danger" onclick="xVF(\''+v.id+'\')">🗑️ Excluir</button></div></div></div>';
  }).join('');
}
function renderDespFIN(ds){
  var IC={'📱 Marketing':'📱','🛠️ Ferramentas':'🛠️','📦 Operacional':'📦','💼 Outros':'💼'};
  if(!ds.length){document.getElementById('fin-despesas').innerHTML='<div class="empty"><span>📤</span>Nenhuma despesa.</div>';return;}
  document.getElementById('fin-despesas').innerHTML=ds.sort(function(a,b){return String(b.id).localeCompare(String(a.id));}).map(function(d){
    return '<div class="dc"><div class="dc-ico">'+(IC[d.cat]||'💼')+'</div>'+
      '<div class="dc-info"><div class="dc-nome">'+(d.nome||'Despesa')+'</div><div class="dc-sub">'+(d.cat||'')+(d.data?' · '+fDataC(d.data):'')+'</div></div>'+
      '<div class="dc-val">-'+fBRL(d.valor)+'</div>'+
      '<button class="dc-del" onclick="xDF(\''+d.id+'\')">🗑️</button></div>';
  }).join('');
}
function tVF(id){var el=document.getElementById('vfd-'+id);if(el)el.classList.toggle('open');}

var FIN_TIPO_VENDA='avulso';
function setTipoVenda(tipo){
  FIN_TIPO_VENDA=tipo;
  document.getElementById('fin-tipo-avulso').className='tab'+(tipo==='avulso'?' on':'');
  document.getElementById('fin-tipo-op').className='tab'+(tipo==='operadora'?' on':'');
  document.getElementById('fin-campos-avulso').style.display=tipo==='avulso'?'block':'none';
  document.getElementById('fin-campos-op').style.display=tipo==='operadora'?'block':'none';
  calcComFIN();
}
function calcComFIN(){
  if(FIN_TIPO_VENDA==='operadora'){
    var total=pV(document.getElementById('fin-v-total-op').value);
    var com=pV(document.getElementById('fin-v-com-op').value);
    var el=document.getElementById('fin-v-prev');
    if(!total&&!com){el.textContent='Preencha os valores';return;}
    el.textContent='💰 Comissão: '+fBRL(com)+' | Total: '+fBRL(total);
    return;
  }
  var h=pV(document.getElementById('fin-v-hotel').value),mh=parseInt(document.getElementById('fin-v-mh').value)/100;
  var voo=pV(document.getElementById('fin-v-voo').value),mv=parseInt(document.getElementById('fin-v-mv').value)/100;
  var emb=pV(document.getElementById('fin-v-embarque').value);
  var o=pV(document.getElementById('fin-v-out').value),mo=parseInt(document.getElementById('fin-v-mo').value)/100;
  var s=pV(document.getElementById('fin-v-seg').value);
  var com=(h*mh)+(voo*mv)+(o*mo)+(s*0.15);
  var tot=h+voo+emb+o+s;
  var el=document.getElementById('fin-v-prev');
  if(tot===0){el.textContent='Preencha os valores';return;}
  el.textContent='💰 Comissão: '+fBRL(com)+' | Total: '+fBRL(tot);
}
function abrirVendaFIN(d){
  document.getElementById('fin-v-title').textContent=d?'Editar Venda':'Registrar Venda';
  document.getElementById('fin-v-id').value=d?d.id:'';
  document.getElementById('fin-v-nome').value=d?d.nome:'';
  document.getElementById('fin-v-data').value=d?d.data:HOJE.toISOString().split('T')[0];
  var tipo=d?(d.tipo||'avulso'):'avulso';
  FIN_TIPO_VENDA=tipo; setTipoVenda(tipo);
  if(tipo==='operadora'){
    document.getElementById('fin-v-total-op').value=d&&d.totalPacote?d.totalPacote.toLocaleString('pt-BR',{minimumFractionDigits:2}):'';
    document.getElementById('fin-v-com-op').value=d&&d.comissao?d.comissao.toLocaleString('pt-BR',{minimumFractionDigits:2}):'';
  } else {
    document.getElementById('fin-v-hotel').value=d&&d.hotel?d.hotel.toLocaleString('pt-BR',{minimumFractionDigits:2}):'';
    document.getElementById('fin-v-mh').value=d?d.mhotel:'10';
    document.getElementById('fin-v-voo').value=d&&d.voo?d.voo.toLocaleString('pt-BR',{minimumFractionDigits:2}):'';
    document.getElementById('fin-v-mv').value=d?d.mvoo:'5';
    document.getElementById('fin-v-embarque').value=d&&d.embarque?d.embarque.toLocaleString('pt-BR',{minimumFractionDigits:2}):'';
    document.getElementById('fin-v-out').value=d&&d.outros?d.outros.toLocaleString('pt-BR',{minimumFractionDigits:2}):'';
    document.getElementById('fin-v-mo').value=d?d.moutros:'0';
    document.getElementById('fin-v-seg').value=d&&d.seguro?d.seguro.toLocaleString('pt-BR',{minimumFractionDigits:2}):'';
  }
  document.getElementById('fin-v-prev').textContent='Preencha os valores';
  if(d) calcComFIN();
  document.getElementById('ov-fin-v').classList.add('open');
}
function salvarVendaFIN(){
  var nome=document.getElementById('fin-v-nome').value.trim();
  if(!nome){alert('Informe o cliente!');return;}
  var eid=document.getElementById('fin-v-id').value;
  var data=document.getElementById('fin-v-data').value;
  var item;
  if(FIN_TIPO_VENDA==='operadora'){
    var total=pV(document.getElementById('fin-v-total-op').value);
    var com=pV(document.getElementById('fin-v-com-op').value);
    item={id:eid||String(Date.now()),nome:nome,tipo:'operadora',hotel:0,mhotel:'0',voo:0,embarque:0,mvoo:'0',outros:0,moutros:'0',seguro:0,comissao:com,totalPacote:total,data:data};
  } else {
    var h=pV(document.getElementById('fin-v-hotel').value),mh=parseInt(document.getElementById('fin-v-mh').value)/100;
    var voo=pV(document.getElementById('fin-v-voo').value),mv=parseInt(document.getElementById('fin-v-mv').value)/100;
    var emb=pV(document.getElementById('fin-v-embarque').value);
    var o=pV(document.getElementById('fin-v-out').value),mo=parseInt(document.getElementById('fin-v-mo').value)/100;
    var s=pV(document.getElementById('fin-v-seg').value);
    var com=(h*mh)+(voo*mv)+(o*mo)+(s*0.15);
    item={id:eid||String(Date.now()),nome:nome,tipo:'avulso',hotel:h,mhotel:String(Math.round(mh*100)),voo:voo,embarque:emb,mvoo:String(Math.round(mv*100)),outros:o,moutros:String(Math.round(mo*100)),seguro:s,comissao:com,totalPacote:h+voo+emb+o+s,data:data};
  }
  var btn=document.getElementById('fin-v-btn'); btn.textContent='⏳...'; btn.disabled=true;
  aPost({action:'save',sheet:'Vendas',item:item}).then(function(res){
    btn.textContent='💾 Salvar Venda'; btn.disabled=false;
    if(res.ok){fOv('ov-fin-v');toast('✅ Venda salva!');carregarFIN();}else toast('❌ Erro.');
  }).catch(function(){btn.textContent='💾 Salvar Venda';btn.disabled=false;toast('❌ Sem conexão.');});
}
function eVF(id){var v=FIN_V.find(function(x){return String(x.id)===String(id);});if(v)abrirVendaFIN(v);}
function xVF(id){if(!confirm('Excluir venda?'))return;aPost({action:'delete',sheet:'Vendas',id:id}).then(function(res){if(res.ok){toast('🗑️');carregarFIN();}});}
function abrirDespFIN(){document.getElementById('fin-d-nome').value='';document.getElementById('fin-d-val').value='';document.getElementById('fin-d-data').value=HOJE.toISOString().split('T')[0];document.getElementById('ov-fin-d').classList.add('open');}
function salvarDespFIN(){
  var nome=document.getElementById('fin-d-nome').value.trim();var val=pV(document.getElementById('fin-d-val').value);
  if(!nome||!val){alert('Preencha descrição e valor!');return;}
  var item={id:String(Date.now()),nome:nome,valor:val,cat:document.getElementById('fin-d-cat').value,data:document.getElementById('fin-d-data').value};
  var btn=document.getElementById('fin-d-btn'); btn.textContent='⏳...'; btn.disabled=true;
  aPost({action:'save',sheet:'Despesas',item:item}).then(function(res){btn.textContent='💾 Salvar';btn.disabled=false;if(res.ok){fOv('ov-fin-d');toast('📤 Despesa salva!');carregarFIN();}else toast('❌ Erro.');}).catch(function(){btn.textContent='💾 Salvar';btn.disabled=false;toast('❌ Sem conexão.');});
}
function xDF(id){if(!confirm('Excluir?'))return;aPost({action:'delete',sheet:'Despesas',id:id}).then(function(res){if(res.ok){toast('🗑️');carregarFIN();}});}
function abrirMetaFIN(){var chave=getMesFIN()+'-'+HOJE.getFullYear();var meta=FIN_M[chave]||0;document.getElementById('fin-m-val').value=meta?meta.toLocaleString('pt-BR',{minimumFractionDigits:2}):'';document.getElementById('ov-fin-m').classList.add('open');}
function salvarMetaFIN(){var val=pV(document.getElementById('fin-m-val').value);var chave=getMesFIN()+'-'+HOJE.getFullYear();aPost({action:'saveMeta',sheet:'Metas',chave:chave,valor:val}).then(function(res){if(res.ok){FIN_M[chave]=val;fOv('ov-fin-m');toast('🎯 Meta salva!');renderFIN();}else toast('❌ Erro.');}).catch(function(){toast('❌ Sem conexão.');});}

// ── MARKETING ─────────────────────────────────────────────────────────────────
var MKT_TIPO='promo',MKT_PUB='familia',MKT_VER=0;
function setTabMKT(i){[0,1,2].forEach(function(k){document.getElementById('mkt-tab-'+k).className='tab'+(k===i?' on':'');document.getElementById('mkt-pane-'+k).style.display=k===i?'block':'none';});}
function tMKT(el,g){document.querySelectorAll('#mkt-chips-'+g+' .chip').forEach(function(c){c.classList.remove('on');});el.classList.add('on');if(g==='tipo')MKT_TIPO=el.dataset.v;else MKT_PUB=el.dataset.v;}
var MKT_LG={promo:{familia:[function(d,pr,pa,de,pe){return '✈️ PROMOÇÃO IMPERDÍVEL PARA A FAMÍLIA!\n\n📍 '+d+(pe?' — '+pe:'')+'\n'+(de?'🎁 '+de+'\n':'')+(pr?'💰 A partir de '+pr+(pa?' ('+pa+')':'')+'\n':'')+'\nLeve a família sem pesar no bolso! 🧳👨‍👩‍👧\n\nVagas limitadas! Chame no WhatsApp 👇\n\n#viagem #ferias #familia #'+d.replace(/[^a-zA-Z]/g,'').toLowerCase()+' #primewayviagens';},function(d,pr,pa,de,pe){return '🌟 Viagem em família que todo mundo vai lembrar!\n\n📍 '+d+(pe?' em '+pe:'')+'\n'+(de?'✅ '+de+'\n':'')+(pr?'💵 '+pr+(pa?' em '+pa:'')+'\n':'')+'\nA gente cuida de tudo! 😍\n\nComente QUERO ou chame no WhatsApp 👇\n\n#familia #'+d.replace(/[^a-zA-Z]/g,'').toLowerCase()+' #primewayviagens';}],casal:[function(d,pr,pa,de,pe){return '💑 ESCAPADA ROMÂNTICA — '+d.toUpperCase()+(pe?' | '+pe:'')+'\n\n'+(de?'✈️ '+de+'\n':'')+(pr?'💰 A partir de '+pr+(pa?' ('+pa+')':'')+'\n':'')+'\nMomentos que ficam pra sempre 🌅\n\n📲 WhatsApp\n\n#casal #romance #'+d.replace(/[^a-zA-Z]/g,'').toLowerCase()+' #primewayviagens';}],geral:[function(d,pr,pa,de,pe){return '🔥 OFERTA ESPECIAL — '+d.toUpperCase()+(pe?' | '+pe:'')+'\n\n'+(de?'✅ '+de+'\n':'')+(pr?'💰 A partir de '+pr+(pa?' ('+pa+')':'')+'\n':'')+'\nVagas limitadas! Chame agora 👇\n\n#oferta #viagem #'+d.replace(/[^a-zA-Z]/g,'').toLowerCase()+' #primewayviagens';}]},dica:{familia:[function(d){return '💡 DICA DE VIAGEM EM FAMÍLIA\n\nVai levar as crianças para '+d+'?\n\n1️⃣ Reserve perto das atrações\n2️⃣ Leve documentos de todos\n3️⃣ Compre ingressos online!\n\n📲 Chame no WhatsApp!\n\n#dicas #familia #'+d.replace(/[^a-zA-Z]/g,'').toLowerCase()+' #primewayviagens';}],casal:[function(d){return '💡 DICA PARA CASAIS\n\nPlanejando para '+d+'?\n\n1️⃣ Reserve com antecedência\n2️⃣ Pesquise restaurantes românticos\n3️⃣ Deixa a gente montar o roteiro 😍\n\n📲 Fale com a gente!\n\n#casal #'+d.replace(/[^a-zA-Z]/g,'').toLowerCase()+' #primewayviagens';}],geral:[function(d){return '💡 VOCÊ SABIA?\n\n'+d+' tem tudo para uma viagem incrível!\n\nNão espere a alta temporada 🏃‍♂️\n\n📲 WhatsApp\n\n#dica #viagem #'+d.replace(/[^a-zA-Z]/g,'').toLowerCase()+' #primewayviagens';}]},inspi:{familia:[function(d){return '✨ IMAGINE...\n\nA família toda em '+d+' 🌅\n\nMemórias pra sempre ❤️\n\nQual é o próximo destino?\n\n👇 Comente!\n\n#familia #'+d.replace(/[^a-zA-Z]/g,'').toLowerCase()+' #primewayviagens';}],casal:[function(d){return '🌅 VOCÊ E A PESSOA QUE AMA\n\nem '+d+'...\n\nSol e tempo parado ✨\n\nChama no WhatsApp 💬\n\n#casal #romance #'+d.replace(/[^a-zA-Z]/g,'').toLowerCase()+' #primewayviagens';}],geral:[function(d){return '🌍 '+d.toUpperCase()+' TE ESPERA!\n\nExperiências únicas.\n\nViajar é o único investimento que enriquece 💛\n\nSalva e chama! ✈️\n\n#viagem #'+d.replace(/[^a-zA-Z]/g,'').toLowerCase()+' #primewayviagens';}]},pacote:{familia:[function(d,pr,pa,de,pe){return '📦 PACOTE COMPLETO — '+d.toUpperCase()+(pe?' | '+pe:'')+'\n\n'+(de?'✅ '+de+'\n':'')+(pr?'💰 '+pr+(pa?' — '+pa:'')+'\n':'')+'\nSó fazer as malas! 🧳\n\n📲 Cotação gratuita 👇\n\n#pacote #familia #'+d.replace(/[^a-zA-Z]/g,'').toLowerCase()+' #primewayviagens';}],casal:[function(d,pr,pa,de){return '💑 PACOTE ESPECIAL CASAL\n📍 '+d+'\n\n'+(de?'✅ '+de+'\n':'')+(pr?'💵 '+pr+(pa?' ('+pa+')':'')+'\n':'')+'\nChame no WhatsApp 💬\n\n#casais #'+d.replace(/[^a-zA-Z]/g,'').toLowerCase()+' #primewayviagens';}],geral:[function(d,pr,pa,de){return '📦 PACOTE '+d.toUpperCase()+'\n\n'+(de?'✅ '+de+'\n':'')+(pr?'💰 A partir de '+pr+(pa?' ('+pa+')':'')+'\n':'')+'\nFale com a gente 👇\n\n#pacoteviagem #'+d.replace(/[^a-zA-Z]/g,'').toLowerCase()+' #primewayviagens';}]},destaque:{familia:[function(d){return '📍 DESTINO: '+d.toUpperCase()+'\n\nPerfeito para família!\n\n✅ Lazer para crianças\n✅ Hotéis com estrutura familiar\n✅ Gastronomia variada\n\nMonte seu pacote 👇\n\n#'+d.replace(/[^a-zA-Z]/g,'').toLowerCase()+' #familia #primewayviagens';}],casal:[function(d){return '📍 '+d.toUpperCase()+' PARA CASAIS\n\n✅ Cenários românticos\n✅ Boa gastronomia\n✅ Hotéis especiais\n\nCote com a PrimeWay 💬\n\n#'+d.replace(/[^a-zA-Z]/g,'').toLowerCase()+' #casal #primewayviagens';}],geral:[function(d){return '📍 CONHEÇA '+d.toUpperCase()+'\n\n✅ Atrações para todos\n✅ Pacotes acessíveis\n\nChama a gente!\n\n#'+d.replace(/[^a-zA-Z]/g,'').toLowerCase()+' #viagem #primewayviagens';}]}};
function gerarLegenda(outra){if(outra)MKT_VER++;var d=document.getElementById('mkt-dest').value.trim()||'o destino dos sonhos';var pr=document.getElementById('mkt-preco').value.trim();var pa=document.getElementById('mkt-parc').value.trim();var de=document.getElementById('mkt-destaques').value.trim();var pe=document.getElementById('mkt-periodo').value.trim();var banco=MKT_LG[MKT_TIPO]&&MKT_LG[MKT_TIPO][MKT_PUB]?MKT_LG[MKT_TIPO][MKT_PUB]:MKT_LG[MKT_TIPO]&&MKT_LG[MKT_TIPO]['geral']?MKT_LG[MKT_TIPO]['geral']:MKT_LG['promo']['geral'];var txt=banco[MKT_VER%banco.length](d,pr,pa,de,pe);document.getElementById('mkt-lg-txt').textContent=txt;document.getElementById('mkt-lg-out').style.display='block';document.getElementById('mkt-lg-out').scrollIntoView({behavior:'smooth',block:'start'});}
var CAL_TIPOS=[{tipo:'promo',label:'🔥 Promoção',cls:'t-promo',peso:10},{tipo:'dica',label:'💡 Dica',cls:'t-dica',peso:6},{tipo:'inspi',label:'✨ Inspiração',cls:'t-inspi',peso:7},{tipo:'engaj',label:'💬 Engajamento',cls:'t-engaj',peso:5},{tipo:'destaque',label:'📍 Destino',cls:'t-dest',peso:7}];
var CAL_MOD={promo:['Oferta relâmpago','Promoção exclusiva','Desconto especial'],dica:['3 dicas para economizar','Melhor época para viajar','Documentos necessários'],inspi:['Post inspiracional','Antes e depois das férias','Pôr do sol do destino'],engaj:['Qual seu próximo destino?','Praia ou montanha?','Marque alguém que levaria!'],destaque:['Apresentação do destino','Atrações imperdíveis','Gastronomia típica']};
function gerarCal(){var mes=document.getElementById('mkt-cal-mes').value;var raw=document.getElementById('mkt-cal-dest').value;var dests=raw?raw.split(',').map(function(s){return s.trim();}).filter(Boolean):['Fortaleza','Gramado','Buenos Aires'];var dsem=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];var html='';for(var i=1;i<=30;i++){var dest=dests[(i-1)%dests.length];var pool=[];CAL_TIPOS.forEach(function(t){for(var x=0;x<t.peso;x++)pool.push(t);});var tc=pool[i%pool.length];var mod=CAL_MOD[tc.tipo];var modelo=mod[i%mod.length];var txt=tc.label+' — '+dest+': '+modelo;html+='<div class="cal-day"><div class="cal-num">'+i+'<br><span style="font-size:8px;color:#8a9bb5">'+dsem[i%7]+'</span></div><div style="flex:1"><span class="cal-tipo '+tc.cls+'">'+tc.label+'</span><div style="font-size:11px;color:#8a9bb5;line-height:1.5"><b>'+dest+'</b> — '+modelo+'</div></div><button style="background:transparent;border:none;font-size:12px;color:#8a9bb5;cursor:pointer;padding:2px 4px;" onclick="cTxt(\''+txt.replace(/'/g,"\\'").replace(/\n/g,'\\n')+'\',this)">📋</button></div>';}document.getElementById('mkt-cal-out').innerHTML=html;document.getElementById('mkt-cal-out').style.display='block';}
var MKT_SC=[{badge:'🟢',bl:'1º CONTATO',fn:function(n,d){return 'Olá'+(n?', '+n:'')+', tudo bem? 😊\n\nSou da PrimeWay Viagens!\n\nVi que você se interessou'+(d?' por '+d:' em viajar')+'.\n\nPosso te mandar opções de pacote? Parcelamos no cartão! ✈️';}},{badge:'🟡',bl:'ENVIO COTAÇÃO',fn:function(n,d){return 'Oi'+(n?', '+n:'')+' 😊\n\nSegue a cotação'+(d?' para '+d:'')+'!\n\nQualquer ajuste é só falar 🙌\n\nValidade: 48h.\n\nAguardo! ✈️';}},{badge:'🟠',bl:'FOLLOW-UP',fn:function(n,d){return 'Oi'+(n?', '+n:'')+' 😊\n\nPassei pra saber se viu a cotação'+(d?' de '+d:'')+'.\n\nAlguma dúvida? Me conta!';}},{badge:'🔴',bl:'FECHAMENTO',fn:function(n,d){return 'Oi'+(n?', '+n:'')+' 😊\n\nAinda tenho disponibilidade'+(d?' para '+d:'')+'!\n\nPreços sobem com a data. Posso reservar agora? 🎯';}},{badge:'🩷',bl:'PÓS-VENDA',fn:function(n,d){return 'Oi'+(n?', '+n:'')+', bem-vindo(a) de volta'+(d?' de '+d:'')+'! ✈️\n\nEspero que foi incrível!\n\nQuando bater vontade de viajar, conte comigo 😉';}},{badge:'💛',bl:'INDICAÇÃO',fn:function(n){return 'Oi'+(n?', '+n:'')+' 😊\n\nSe ficou feliz, me indica para um amigo?\n\nÉ só compartilhar meu contato 🙌\n\nObrigado! ✈️';}}];
function renderScripts(){var n=document.getElementById('mkt-sc-nome').value.trim();var d=document.getElementById('mkt-sc-dest').value.trim();document.getElementById('mkt-scripts').innerHTML=MKT_SC.map(function(s,i){var txt=s.fn(n,d);return '<div style="background:#152347;border:1px solid #1e3060;border-radius:12px;margin-bottom:8px;overflow:hidden;"><div style="padding:10px 13px;display:flex;align-items:center;gap:8px;cursor:pointer;" onclick="tSC('+i+')"><span>'+s.badge+'</span><span style="flex:1;font-size:12px;font-weight:700;">'+s.bl+'</span><span style="font-size:12px;color:#8a9bb5;" id="sc-chev-'+i+'">▼</span></div><div style="display:none;border-top:1px solid #1e3060;padding:10px 13px;" id="sc-body-'+i+'"><div style="white-space:pre-wrap;font-size:12px;line-height:1.7;">'+txt+'</div><button style="width:100%;margin-top:8px;padding:9px;border:1px solid #1e3060;border-radius:8px;background:transparent;font-size:11px;font-weight:700;color:#8a9bb5;cursor:pointer;" onclick="cTxt(\''+txt.replace(/\n/g,'\\n').replace(/'/g,"\\'")+'\',this)">📋 Copiar</button></div></div>';}).join('');}
function tSC(i){var b=document.getElementById('sc-body-'+i);var c=document.getElementById('sc-chev-'+i);b.style.display=b.style.display==='none'?'block':'none';c.textContent=b.style.display==='block'?'▲':'▼';}

// ── CALCULADORAS ──────────────────────────────────────────────────────────────
var CALC_TIPO='credito',CALC_CANAL='maquininha',CALC_PARC=10;
var TAXAS_MAQ={debito:1.37,credito:{1:3.15,2:5.39,3:6.12,4:6.85,5:7.57,6:8.28,7:8.99,8:9.69,9:10.38,10:11.06,11:11.74,12:12.40},pix:0};
var TAXAS_LINK={debito:1.37,credito:{1:4.20,2:6.09,3:7.01,4:7.91,5:8.80,6:9.67,7:12.59,8:13.42,9:14.25,10:15.07,11:15.87,12:16.66},pix:0};
function setTabCALC(i){[0,1].forEach(function(k){document.getElementById('calc-tab-'+k).className='tab'+(k===i?' on':'');document.getElementById('calc-pane-'+k).style.display=k===i?'block':'none';});}
function tCALC(el,g){document.querySelectorAll('#calc-chips-'+g+' .chip').forEach(function(c){c.classList.remove('on');});el.classList.add('on');if(g==='canal')CALC_CANAL=el.dataset.v;if(g==='tipo'){CALC_TIPO=el.dataset.v;document.getElementById('calc-parc-sec').style.display=CALC_TIPO==='credito'?'block':'none';if(CALC_TIPO!=='credito')CALC_PARC=1;buildParc();}calcIP();}
function buildParc(){var row=document.getElementById('calc-parc-wrap');row.innerHTML='';if(CALC_TIPO!=='credito')return;for(var i=1;i<=12;i++){var btn=document.createElement('button');btn.className='parc-btn'+(i===CALC_PARC?' on':'');btn.textContent=i===1?'1x':i+'x';(function(p){btn.onclick=function(){CALC_PARC=p;document.querySelectorAll('.parc-btn').forEach(function(b){b.classList.toggle('on',b.textContent===p+'x'||b.textContent==='1x'&&p===1);});calcIP();};})(i);row.appendChild(btn);}}
function getTaxaIP(){var t=CALC_CANAL==='link'?TAXAS_LINK:TAXAS_MAQ;if(CALC_TIPO==='pix')return 0;if(CALC_TIPO==='debito')return t.debito;return t.credito[CALC_PARC]||0;}
function calcIP(){var val=pV(document.getElementById('calc-valor').value);var el=document.getElementById('calc-ip-res');if(!val){el.innerHTML='<div class="empty"><span>🧮</span>Digite um valor acima</div>';return;}var taxa=getTaxaIP();var clientePaga=taxa===0?val:val/(1-taxa/100);var parcela=clientePaga/(CALC_TIPO==='credito'?CALC_PARC:1);var taxaVal=clientePaga-val;el.innerHTML='<div class="kcard" style="margin-bottom:8px;"><div class="kcard-lbl">Cliente paga</div><div style="font-size:36px;font-weight:800;color:#e8b84b;letter-spacing:-1px;line-height:1;">R$ '+fBRL(clientePaga).replace('R$ ','')+'</div>'+(CALC_TIPO==='credito'&&CALC_PARC>1?'<div class="kcard-sub">'+CALC_PARC+'x de '+fBRL(parcela)+'</div>':'')+'</div><div class="kcard" style="margin-bottom:8px;"><div class="kcard-lbl">Você recebe</div><div style="font-size:22px;font-weight:800;color:#4af0a0;">'+fBRL(val)+'</div></div><div style="background:#152347;border:1px solid #1e3060;border-radius:12px;padding:12px 14px;"><div class="det-row"><span class="det-k">Modalidade</span><span class="det-v">'+(CALC_TIPO==='credito'?'Crédito '+CALC_PARC+'x':CALC_TIPO==='debito'?'Débito':'Pix')+'</span></div><div class="det-row"><span class="det-k">Canal</span><span class="det-v">'+(CALC_CANAL==='link'?'Link Online':'Maquininha')+'</span></div><div class="det-row"><span class="det-k">Taxa aplicada</span><span class="det-v" style="color:#e8b84b">'+taxa.toFixed(2).replace('.',',')+' %</span></div><div class="det-row"><span class="det-k">Custo da taxa</span><span class="det-v" style="color:#ff6b6b">'+(taxa===0?'Grátis':fBRL(taxaVal))+'</span></div></div>';}
function calcMeta(){var meta=pV(document.getElementById('meta-val').value);var dias=parseInt(document.getElementById('meta-dias').value)||22;var ticket=pV(document.getElementById('meta-ticket').value);var el=document.getElementById('meta-res');if(!meta){el.innerHTML='<div class="empty"><span>🎯</span>Preencha os campos acima</div>';return;}var porDia=meta/dias;var semanas=Math.ceil(dias/5);var porSemana=meta/semanas;var vT=ticket>0?Math.ceil(meta/ticket):0;var vS=ticket>0?Math.ceil(porSemana/ticket):0;var vD=ticket>0?(meta/ticket/dias).toFixed(1):0;el.innerHTML='<div class="kcard" style="margin-bottom:8px;"><div class="kcard-lbl">🎯 Para faturar '+fBRL(meta)+' em '+dias+' dias úteis</div></div><div style="background:#152347;border:1px solid #1e3060;border-radius:12px;padding:12px 14px;margin-bottom:8px;"><div class="det-row"><span class="det-k">💰 Por dia</span><span class="det-v" style="color:#e8b84b">'+fBRL(porDia)+'</span></div><div class="det-row"><span class="det-k">📅 Por semana</span><span class="det-v" style="color:#e8b84b">'+fBRL(porSemana)+'</span></div>'+(ticket?'<div class="det-row"><span class="det-k">✈️ Vendas no mês</span><span class="det-v" style="color:#4af0a0">'+vT+' vendas</span></div>':'')+(ticket?'<div class="det-row"><span class="det-k">📆 Por semana</span><span class="det-v" style="color:#4af0a0">'+vS+' venda(s)</span></div>':'')+(ticket?'<div class="det-row"><span class="det-k">🗓️ Por dia</span><span class="det-v" style="color:#60b4ff">'+vD+'/dia</span></div>':'')+'</div><div style="background:rgba(232,184,75,.08);border:1px solid rgba(232,184,75,.2);border-radius:10px;padding:11px 13px;font-size:12px;color:#e8b84b;text-align:center;">'+(ticket?'🏆 Meta de '+vS+' venda(s)/semana para faturar '+fBRL(meta)+'!':'Informe o ticket médio')+'</div>';}

// ── CHECKLIST ─────────────────────────────────────────────────────────────────
var CK_TIPO='nacional',CK_INC=new Set(['voo','hotel']),CK_STATE={};
function tCK(el){document.querySelectorAll('#ck-chips-tipo .chip').forEach(function(c){c.classList.remove('on');});el.classList.add('on');CK_TIPO=el.dataset.v;}
function mCK(el){el.classList.toggle('on');if(el.classList.contains('on'))CK_INC.add(el.dataset.v);else CK_INC.delete(el.dataset.v);}
function setOTabCK(i){[0,1].forEach(function(k){document.getElementById('ck-ot-'+k).className='otab'+(k===i?' on':'');document.getElementById('ck-out-'+k).style.display=k===i?'block':'none';});}
function getCKItens(){var grupos=[];var docs=['📋 Passagens impressas ou no celular','🏨 Voucher do hotel'];if(CK_INC.has('transfer'))docs.push('🚐 Voucher do transfer');if(CK_INC.has('seguro'))docs.push('🛡️ Apólice do seguro viagem');if(CK_INC.has('carro'))docs.push('🚗 Reserva do aluguel de carro');if(CK_TIPO==='internacional'){docs.push('🛂 Passaporte válido (mín. 6 meses)');docs.push('📄 Visto (se necessário)');docs.push('💊 Carteira de vacinação');}else{docs.push('🪪 RG ou CNH válidos');docs.push('📝 Certidão de nascimento (menores)');}grupos.push({icon:'📁',title:'Documentos',items:docs});var bag=['🧳 Mala verificada','👜 Mochila de mão','👗 Roupas para o clima','👟 Sapatos confortáveis','🧴 Higiene pessoal','💊 Medicamentos','🔌 Carregadores'];if(CK_TIPO==='internacional')bag.push('💱 Moeda estrangeira');grupos.push({icon:'🧳',title:'Bagagem',items:bag});var antes=['📱 Baixar app da cia aérea','📍 Salvar endereço do hotel','✈️ Check-in online (48h antes)','💳 Avisar banco'];if(!CK_INC.has('seguro'))antes.push('🛡️ Contratar seguro viagem!');if(CK_TIPO==='internacional')antes.push('📶 Chip internacional');grupos.push({icon:'📋',title:'Antes de Viajar',items:antes});grupos.push({icon:'🌅',title:'No Dia',items:['⏰ Acordar com antecedência','📲 Confirmar transfer','🔋 Carregar dispositivos','🌡️ Ver previsão do tempo']});var dest=['🏨 Confirmar check-in','📲 Salvar número de emergência'];if(CK_INC.has('carro'))dest.push('🚗 Retirar carro locado');if(CK_TIPO==='internacional')dest.push('🛂 Guardar cartão de imigração');dest.push('📸 Aproveitar cada momento! 🎉');grupos.push({icon:'📍',title:'No Destino',items:dest});return grupos;}
function gerarCK(){var nome=document.getElementById('ck-nome').value.trim();var dest=document.getElementById('ck-dest').value.trim()||'seu destino';var data=document.getElementById('ck-data').value;var grupos=getCKItens();CK_STATE={};var total=0;grupos.forEach(function(g){g.items.forEach(function(item,i){CK_STATE[g.title+i]=false;total++;});});var html='<div class="cl-prog"><div class="cl-prog-bar-wrap"><div class="cl-prog-bar" id="ck-bar" style="width:0%"></div></div><div class="cl-prog-txt" id="ck-prog-txt">0 / '+total+'</div></div>';grupos.forEach(function(g){html+='<div style="margin-bottom:12px;"><div class="cl-grupo-title">'+g.icon+' '+g.title+'</div>';g.items.forEach(function(item,i){var k=g.title+i;html+='<div class="cl-item" onclick="tCKItem(\''+k+'\','+total+')"><div class="cl-cb" id="ck-cb-'+k+'"></div><div class="cl-txt" id="ck-ct-'+k+'">'+item+'</div></div>';});html+='</div>';});document.getElementById('ck-out-0').innerHTML=html;var txt='✈️ *CHECKLIST DA SUA VIAGEM*\n'+(nome?'👤 '+nome+'\n':'')+'📍 '+dest+(data?' — '+fData(data):'')+'\n━━━━━━━━━━━━━━━━━\n\n';grupos.forEach(function(g){txt+=g.icon+' *'+g.title.toUpperCase()+'*\n';g.items.forEach(function(item){txt+='☐ '+item+'\n';});txt+='\n';});txt+='━━━━━━━━━━━━━━━━━\n_Qualquer dúvida é só chamar!_\n✈️ *PrimeWay Viagens*';document.getElementById('ck-out-1').innerHTML='<div class="output-box">'+txt+'</div><div class="out-actions" style="margin-top:8px;"><button class="btn-copy" onclick="cTxt(\''+txt.replace(/\n/g,'\\n').replace(/'/g,"\\'")+'\',this)">📋 Copiar</button><button class="btn-wpp" onclick="wTxt(\''+txt.replace(/\n/g,'\\n').replace(/'/g,"\\'")+'\')">📲 WhatsApp</button></div>';document.getElementById('ck-output').style.display='block';setOTabCK(0);document.getElementById('ck-output').scrollIntoView({behavior:'smooth',block:'start'});}
function tCKItem(k,total){CK_STATE[k]=!CK_STATE[k];document.getElementById('ck-cb-'+k).classList.toggle('chk',CK_STATE[k]);document.getElementById('ck-ct-'+k).classList.toggle('chk',CK_STATE[k]);var done=Object.values(CK_STATE).filter(Boolean).length;document.getElementById('ck-bar').style.width=Math.round(done/total*100)+'%';document.getElementById('ck-prog-txt').textContent=done+' / '+total;}

// ── PACOTE VISUAL ─────────────────────────────────────────────────────────────
var PV_PUB='Família',PV_TEMA='t-praia',PV_INC=new Set(['✈️ Passagem aérea','🏨 Hotel']);
function tPV(el,g){document.querySelectorAll('#pv-chips-'+g+' .chip').forEach(function(c){c.classList.remove('on');});el.classList.add('on');if(g==='pub')PV_PUB=el.dataset.v;}
function mPV(el){el.classList.toggle('on');if(el.classList.contains('on'))PV_INC.add(el.dataset.v);else PV_INC.delete(el.dataset.v);}
function tTema(el){document.querySelectorAll('.tema-btn').forEach(function(b){b.classList.remove('on');});el.classList.add('on');PV_TEMA=el.dataset.t;}
function setOTabPV(i){[0,1,2].forEach(function(k){document.getElementById('pv-ot-'+k).className='otab'+(k===i?' on':'');document.getElementById('pv-out-'+k).style.display=k===i?'block':'none';});}
var EMOS={'t-praia':'🏖️','t-montanha':'🏔️','t-cidade':'🌆','t-romance':'💑','t-aventura':'🧗','t-luxo':'✨'};
function gerarPV(){var dest=document.getElementById('pv-dest').value.trim();if(!dest){alert('Informe o destino!');return;}var dur=document.getElementById('pv-dur').value.trim();var per=document.getElementById('pv-periodo').value.trim();var preco=document.getElementById('pv-preco').value.trim();var parc=document.getElementById('pv-parc').value.trim();var inc=Array.from(PV_INC);var emo=EMOS[PV_TEMA]||'✈️';var tag={família:'PACOTE FAMÍLIA',casal:'ESCAPADA A DOIS',individual:'VIAGEM INDIVIDUAL'}[PV_PUB.toLowerCase()]||'PACOTE ESPECIAL';var card='<div class="prev-card '+PV_TEMA+'"><div class="prev-hdr"><div class="prev-tag">'+emo+' '+tag+'</div><div class="prev-dest">'+dest.toUpperCase()+'</div><div class="prev-sub">'+(dur||'')+( dur&&per?' · ':'')+( per||'')+'</div></div>'+(preco?'<div class="prev-preco"><div class="prev-de">A PARTIR DE</div><div class="prev-val">R$ '+preco+'</div>'+(parc?'<div class="prev-parc">'+parc+'</div>':'')+'</div>':'')+(inc.length?'<div class="prev-inc"><div class="prev-inc-t">✅ Incluso no pacote</div>'+inc.map(function(i){return '<div class="prev-item">'+i+'</div>';}).join('')+'</div>':'')+'<div class="prev-cta"><span class="prev-cta-btn">📲 Solicite sua cotação</span></div><div class="prev-rod">✈️ PRIMEWAY VIAGENS</div></div>';var canva='=== TEXTO PARA O CANVA ===\n\n[TÍTULO]\n'+dest.toUpperCase()+'\n\n'+(dur||per?'[SUBTÍTULO]\n'+(dur||'')+( dur&&per?' · ':'')+( per||'')+'\n\n':'')+'[TAG]\n'+emo+' '+tag+'\n\n'+(preco?'[PREÇO]\nA partir de R$ '+preco+(parc?'\n'+parc:'')+'\n\n':'')+(inc.length?'[INCLUSO]\n'+inc.map(function(i){return '• '+i;}).join('\n')+'\n\n':'')+'[CTA]\n📲 Solicite sua cotação\n\n[RODAPÉ]\n✈️ PrimeWay Viagens';var wpp='✈️ *'+dest.toUpperCase()+'*'+(per?' — '+per:'')+'\n'+(dur?'🕐 '+dur+'\n':'')+'👥 *'+PV_PUB+'*\n\n'+(inc.length?'*✅ Incluso:*\n'+inc.join('\n')+'\n\n':'')+(preco?'💰 *A partir de R$ '+preco+'*'+(parc?' ('+parc+')':'')+'\n\n':'')+'📲 Entre em contato!\n\n_PrimeWay Viagens_';document.getElementById('pv-out-0').innerHTML=card;document.getElementById('pv-out-1').innerHTML='<div class="output-box">'+canva+'</div><div class="out-actions" style="margin-top:8px;"><button class="btn-copy" onclick="cTxt(\''+canva.replace(/\n/g,'\\n').replace(/'/g,"\\'")+'\',this)">📋 Copiar</button></div>';document.getElementById('pv-out-2').innerHTML='<div class="output-box">'+wpp+'</div><div class="out-actions" style="margin-top:8px;"><button class="btn-copy" onclick="cTxt(\''+wpp.replace(/\n/g,'\\n').replace(/'/g,"\\'")+'\',this)">📋 Copiar</button><button class="btn-wpp" onclick="wTxt(\''+wpp.replace(/\n/g,'\\n').replace(/'/g,"\\'")+'\')">📲 WhatsApp</button></div>';document.getElementById('pv-output').style.display='block';setOTabPV(0);document.getElementById('pv-output').scrollIntoView({behavior:'smooth',block:'start'});}
function setTabFER(i){[0,1].forEach(function(k){document.getElementById('fer-tab-'+k).className='tab'+(k===i?' on':'');document.getElementById('fer-pane-'+k).style.display=k===i?'block':'none';});}

// ── INIT ──────────────────────────────────────────────────────────────────────
buildParc();
Promise.all([aPost({action:'init',sheet:'Vendas'}),aPost({action:'init',sheet:'Despesas'}),aPost({action:'init',sheet:'Metas'})]).catch(function(){});
// Init hoteis
aPost({action:'init',sheet:'Hoteis'}).catch(function(){});

if('serviceWorker' in navigator){navigator.serviceWorker.register('/primeway/sw.js').catch(function(){});}
// ── HOTÉIS ────────────────────────────────────────────────────────────────────
var HT_DB = [];

function ssHT(s){
  var el=document.getElementById('ht-sync');
  if(!el)return;
  if(s==='ok'){el.className='sync-badge s-ok';el.textContent='✅';}
  else if(s==='err'){el.className='sync-badge s-err';el.textContent='❌';}
  else{el.className='sync-badge s-load';el.textContent='⏳';}
}

function carregarHT(){
  ssHT('load');
  aGet('Hoteis').then(function(res){
    HT_DB=res.ok?res.data.filter(function(r){return r.id;}).map(function(r){
      return{
        id:r.id, nome:r.nome||'', cidade:r.cidade||'', estado:r.estado||'',
        estrelas:parseInt(r.estrelas)||0,
        notaGoogle:parseFloat(r.notaGoogle)||0,
        notaBooking:parseFloat(r.notaBooking)||0,
        mediaNotas:parseFloat(r.mediaNotas)||0,
        regime:r.regime||'', precoBaixa:parseFloat(r.precoBaixa)||0,
        precoAlta:parseFloat(r.precoAlta)||0,
        publico:r.publico||'Todos', obs:r.obs||'', link:r.link||'', criado:r.criado||''
      };
    }):[];
    ssHT('ok'); renderHT();
  }).catch(function(){ssHT('err');document.getElementById('ht-lista').innerHTML='<div class="empty"><span>📡</span>Sem conexão. Toque em 🔄</div>';});
}

function renderHT(){
  var q=(document.getElementById('ht-busca').value||'').toLowerCase().trim();
  var lista=HT_DB.filter(function(h){
    if(!q) return true;
    return (h.cidade||'').toLowerCase().includes(q)||
           (h.nome||'').toLowerCase().includes(q)||
           (h.estado||'').toLowerCase().includes(q);
  }).sort(function(a,b){return b.mediaNotas-a.mediaNotas;});

  var el=document.getElementById('ht-lista');
  if(!lista.length){
    el.innerHTML='<div class="empty"><span>🏨</span>'+(q?'Nenhum hotel encontrado para "'+q+'"':'Nenhum hotel cadastrado.<br>Toque em "+ Adicionar"')+'</div>';
    return;
  }

  el.innerHTML=lista.map(function(h){
    var estrelas='';
    for(var i=0;i<5;i++) estrelas+='<span style="color:'+(i<h.estrelas?'#e8b84b':'#1e3060')+'">★</span>';
    var mediaColor=h.mediaNotas>=4.5?'#4af0a0':h.mediaNotas>=4.0?'#e8b84b':'#ff7eb3';
    var pubIco={familia:'👨‍👩‍👧',casal:'💑',todos:'👥'}[(h.publico||'').toLowerCase()]||'👥';

    return '<div class="ht-card">'
      +'<div class="ht-hdr" onclick="tDetHT(\''+h.id+'\')">'
      +'<div class="ht-left">'
      +'<div class="ht-nome">'+(h.nome||'Hotel')+'</div>'
      +'<div class="ht-cidade">📍 '+(h.cidade||'')+(h.estado?', '+h.estado:'')+'</div>'
      +'<div class="ht-estrelas">'+estrelas+'</div>'
      +'</div>'
      +'<div class="ht-right">'
      +'<div class="ht-nota" style="background:'+mediaColor+'20;border:1px solid '+mediaColor+'40;color:'+mediaColor+'">'+h.mediaNotas.toFixed(1)+'</div>'
      +'<div class="ht-pub">'+pubIco+' '+h.publico+'</div>'
      +'</div>'
      +'</div>'
      +'<div class="ht-det" id="htd-'+h.id+'">'
      +'<div class="ht-det-grid">'
      +(h.notaGoogle?'<div class="ht-det-item"><div class="ht-det-lbl">🔍 Google</div><div class="ht-det-val">'+h.notaGoogle.toFixed(1)+'</div></div>':'')
      +(h.notaBooking?'<div class="ht-det-item"><div class="ht-det-lbl">🏢 Booking</div><div class="ht-det-val">'+h.notaBooking.toFixed(1)+'</div></div>':'')
      +(h.regime?'<div class="ht-det-item"><div class="ht-det-lbl">🍽️ Regime</div><div class="ht-det-val">'+h.regime+'</div></div>':'')
      +(h.precoBaixa?'<div class="ht-det-item"><div class="ht-det-lbl">📅 Baixa temp.</div><div class="ht-det-val">'+fBRL(h.precoBaixa)+'/nt</div></div>':'')
      +(h.precoAlta?'<div class="ht-det-item"><div class="ht-det-lbl">🔥 Alta temp.</div><div class="ht-det-val">'+fBRL(h.precoAlta)+'/nt</div></div>':'')
      +'</div>'
      +(h.obs?'<div class="ht-obs">📝 '+h.obs+'</div>':'')
      +'<div class="cc-acts">'
      +(h.link?'<button class="act" onclick="window.open(\''+h.link+'\',\'_blank\')">🔗 Ver hotel</button>':'')
      +'<button class="act" onclick="editarHT(\''+h.id+'\')">✏️ Editar</button>'
      +'<button class="act danger" onclick="excluirHT(\''+h.id+'\')">🗑️</button>'
      +'</div>'
      +'</div>'
      +'</div>';
  }).join('');
}

function tDetHT(id){var el=document.getElementById('htd-'+id);if(el)el.classList.toggle('open');}

function calcMediaHT(){
  var g=parseFloat(document.getElementById('ht-f-google').value)||0;
  var b=parseFloat(document.getElementById('ht-f-booking').value)||0;
  var count=0, soma=0;
  if(g>0){soma+=g;count++;}
  if(b>0){soma+=b;count++;}
  var media=count>0?(soma/count):0;
  document.getElementById('ht-media-preview').textContent=count>0?'Média: '+media.toFixed(1)+' ⭐':'';
  return media;
}

function abrirModalHT(h){
  document.getElementById('ht-modal-title').textContent=h?'Editar Hotel':'Adicionar Hotel';
  document.getElementById('ht-edit-id').value=h?h.id:'';
  document.getElementById('ht-f-nome').value=h?h.nome:'';
  document.getElementById('ht-f-cidade').value=h?h.cidade:'';
  document.getElementById('ht-f-estado').value=h?h.estado:'';
  document.getElementById('ht-f-estrelas').value=h?h.estrelas:'3';
  document.getElementById('ht-f-google').value=h&&h.notaGoogle?h.notaGoogle:'';
  document.getElementById('ht-f-booking').value=h&&h.notaBooking?h.notaBooking:'';
  document.getElementById('ht-f-regime').value=h?(h.regime||''):'';
  document.getElementById('ht-f-baixa').value=h&&h.precoBaixa?h.precoBaixa.toLocaleString('pt-BR',{minimumFractionDigits:2}):'';
  document.getElementById('ht-f-alta').value=h&&h.precoAlta?h.precoAlta.toLocaleString('pt-BR',{minimumFractionDigits:2}):'';
  document.getElementById('ht-f-publico').value=h?(h.publico||'Todos'):'Todos';
  document.getElementById('ht-f-obs').value=h?h.obs:'';
  document.getElementById('ht-f-link').value=h?h.link:'';
  document.getElementById('ht-media-preview').textContent='';
  if(h) calcMediaHT();
  document.getElementById('ov-ht').classList.add('open');
}

function salvarHT(){
  var nome=document.getElementById('ht-f-nome').value.trim();
  var cidade=document.getElementById('ht-f-cidade').value.trim();
  if(!nome||!cidade){alert('Informe nome e cidade!');return;}
  var g=parseFloat(document.getElementById('ht-f-google').value)||0;
  var b=parseFloat(document.getElementById('ht-f-booking').value)||0;
  var count=0,soma=0;
  if(g>0){soma+=g;count++;}
  if(b>0){soma+=b;count++;}
  var media=count>0?(soma/count):0;
  var eid=document.getElementById('ht-edit-id').value;
  var item={
    id:eid||String(Date.now()), nome:nome,
    cidade:cidade, estado:document.getElementById('ht-f-estado').value.trim(),
    estrelas:document.getElementById('ht-f-estrelas').value,
    notaGoogle:g, notaBooking:b, mediaNotas:parseFloat(media.toFixed(2)),
    regime:document.getElementById('ht-f-regime').value,
    precoBaixa:pV(document.getElementById('ht-f-baixa').value),
    precoAlta:pV(document.getElementById('ht-f-alta').value),
    publico:document.getElementById('ht-f-publico').value,
    obs:document.getElementById('ht-f-obs').value.trim(),
    link:document.getElementById('ht-f-link').value.trim(),
    criado:eid?'':new Date().toISOString()
  };
  var btn=document.getElementById('ht-save-btn');
  btn.textContent='⏳ Salvando...';btn.disabled=true;
  aPost({action:'save',sheet:'Hoteis',item:item}).then(function(res){
    btn.textContent='💾 Salvar';btn.disabled=false;
    if(res.ok){fOv('ov-ht');toast('✅ Hotel salvo!');carregarHT();}
    else toast('❌ Erro ao salvar.');
  }).catch(function(){btn.textContent='💾 Salvar';btn.disabled=false;toast('❌ Sem conexão.');});
}

function editarHT(id){var h=HT_DB.find(function(x){return String(x.id)===String(id);});if(h)abrirModalHT(h);}

function excluirHT(id){
  if(!confirm('Excluir este hotel?'))return;
  aPost({action:'delete',sheet:'Hoteis',id:id}).then(function(res){
    if(res.ok){toast('🗑️ Hotel excluído!');carregarHT();}else toast('❌ Erro.');
  }).catch(function(){toast('❌ Sem conexão.');});
}

// ── PRECIFICAÇÃO ──────────────────────────────────────────────────────────────
function calcPC(){
  var hotel=pV(document.getElementById('pc-hotel').value);
  var mhotel=parseInt(document.getElementById('pc-hotel-pct').value)/100;
  var voo=pV(document.getElementById('pc-voo').value);
  var mvoo=parseInt(document.getElementById('pc-voo-pct').value)/100;
  var embarque=pV(document.getElementById('pc-embarque').value);
  var transfer=pV(document.getElementById('pc-transfer').value);
  var mtransfer=parseInt(document.getElementById('pc-transfer-pct').value)/100;
  var carro=pV(document.getElementById('pc-carro').value);
  var mcarro=parseInt(document.getElementById('pc-carro-pct').value)/100;
  var passeios=pV(document.getElementById('pc-passeios').value);
  var mpasseios=parseInt(document.getElementById('pc-passeios-pct').value)/100;
  var seguro=pV(document.getElementById('pc-seguro').value);
  var mseguro=parseInt(document.getElementById('pc-seguro-pct').value)/100;
  var custo=hotel+voo+embarque+transfer+carro+passeios+seguro;
  if(custo===0){document.getElementById('pc-resultado').innerHTML='<div class="empty"><span>💼</span>Preencha os valores acima</div>';return;}
  var comHotel=hotel*mhotel,comVoo=voo*mvoo,comTransfer=transfer*mtransfer;
  var comCarro=carro*mcarro,comPasseios=passeios*mpasseios,comSeguro=seguro*mseguro;
  var comTotal=comHotel+comVoo+comTransfer+comCarro+comPasseios+comSeguro;
  var precoFinal=custo+comTotal;
  document.getElementById('pc-resultado').innerHTML=
    '<div style="background:linear-gradient(135deg,#152347,#1c2e58);border:1px solid rgba(232,184,75,.3);border-radius:14px;padding:16px;margin-bottom:10px;">'
    +'<div style="font-size:10px;font-weight:700;color:#8a9bb5;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">💵 Preço final para o cliente</div>'
    +'<div style="font-size:38px;font-weight:800;color:#e8b84b;letter-spacing:-1px;line-height:1;">'+fBRL(precoFinal)+'</div>'
    +'<div style="display:flex;justify-content:space-between;margin-top:12px;">'
    +'<div><div style="font-size:9px;color:#8a9bb5;text-transform:uppercase;letter-spacing:.8px;">Seu custo</div><div style="font-size:14px;font-weight:700;color:#f0f0f0;">'+fBRL(custo)+'</div></div>'
    +'<div style="text-align:right"><div style="font-size:9px;color:#8a9bb5;text-transform:uppercase;letter-spacing:.8px;">Sua comissão</div><div style="font-size:14px;font-weight:700;color:#4af0a0;">'+fBRL(comTotal)+'</div></div>'
    +'</div></div>'
    +'<div style="background:#152347;border:1px solid #1e3060;border-radius:12px;padding:12px 14px;margin-bottom:8px;">'
    +'<div style="font-size:10px;font-weight:700;color:#8a9bb5;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">Detalhamento</div>'
    +(hotel?'<div class="det-row"><span class="det-k">🏨 Hotel</span><span class="det-v">'+fBRL(hotel)+(mhotel>0?' <span style="color:#4af0a0;font-size:10px;">(+'+fBRL(comHotel)+')</span>':'')+'</span></div>':'')
    +(voo?'<div class="det-row"><span class="det-k">✈️ Passagem</span><span class="det-v">'+fBRL(voo)+(mvoo>0?' <span style="color:#4af0a0;font-size:10px;">(+'+fBRL(comVoo)+')</span>':'')+'</span></div>':'')
    +(embarque?'<div class="det-row"><span class="det-k">🛫 Tx. Embarque</span><span class="det-v">'+fBRL(embarque)+' <span style="color:#8a9bb5;font-size:10px;">(sem margem)</span></span></div>':'')
    +(transfer?'<div class="det-row"><span class="det-k">🚐 Transfer</span><span class="det-v">'+fBRL(transfer)+(mtransfer>0?' <span style="color:#4af0a0;font-size:10px;">(+'+fBRL(comTransfer)+')</span>':'')+'</span></div>':'')
    +(carro?'<div class="det-row"><span class="det-k">🚗 Aluguel carro</span><span class="det-v">'+fBRL(carro)+(mcarro>0?' <span style="color:#4af0a0;font-size:10px;">(+'+fBRL(comCarro)+')</span>':'')+'</span></div>':'')
    +(passeios?'<div class="det-row"><span class="det-k">🎡 Passeios</span><span class="det-v">'+fBRL(passeios)+(mpasseios>0?' <span style="color:#4af0a0;font-size:10px;">(+'+fBRL(comPasseios)+')</span>':'')+'</span></div>':'')
    +(seguro?'<div class="det-row"><span class="det-k">🛡️ Seguro</span><span class="det-v">'+fBRL(seguro)+(mseguro>0?' <span style="color:#4af0a0;font-size:10px;">(+'+fBRL(comSeguro)+')</span>':'')+'</span></div>':'')
    +'<div class="det-row" style="border-top:1px solid #1e3060;padding-top:8px;margin-top:4px;"><span class="det-k" style="font-weight:700;color:#f0f0f0;">Total cliente</span><span class="det-v" style="color:#e8b84b;font-size:14px;">'+fBRL(precoFinal)+'</span></div>'
    +'</div>'
    +'<div style="background:rgba(74,240,160,.07);border:1px solid rgba(74,240,160,.2);border-radius:10px;padding:10px 13px;text-align:center;font-size:12px;color:#4af0a0;font-weight:700;">'
    +'📈 Margem: '+(custo>0?(comTotal/custo*100).toFixed(1):0)+'% &nbsp;|&nbsp; Comissão: '+fBRL(comTotal)
    +'</div>';
}
function limparPC(){
  ['pc-hotel','pc-voo','pc-embarque','pc-transfer','pc-carro','pc-passeios','pc-seguro'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';});
  var def={'pc-hotel-pct':10,'pc-voo-pct':5,'pc-transfer-pct':0,'pc-carro-pct':0,'pc-passeios-pct':0,'pc-seguro-pct':15};
  Object.keys(def).forEach(function(id){var el=document.getElementById(id);if(el){el.value=def[id];var lbl=document.getElementById(id+'-lbl');if(lbl)lbl.textContent=def[id];}});
  document.getElementById('pc-resultado').innerHTML='<div class="empty"><span>💼</span>Preencha os valores acima</div>';
}
