/* ====== إعدادات المتجر (عدّلها قبل التسليم) ====== */
const WHATSAPP_NUMBER = "201000000000";      // رقم واتساب بالصيغة الدولية بدون + (مثال: 2010XXXXXXXX)
const PROMO_CODES = { ROVEX10: 10 };         // كود الخصم: نسبة % (عدّل أو احذف)
const SOLD_OUT = {};                          // مقاسات نفذت لكل منتج، مثال: { "rvx-01": ["XXL"], "rvx-02": ["S","M"] }
const NEXT_DROP_DATE = "";                   // موعد الدروب الجاي، مثال: "2026-12-01T20:00:00+02:00" (فاضي = العدّاد مخفي)
/* ================================================ */
const products = [
  {id:"rvx-01", name:"ترنج ROVEX Core — أسود", price:1499, image:"https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=700&q=85", colors:["أسود","رمادي"]},
  {id:"rvx-02", name:"ترنج ROVEX Shadow — رمادي", price:1599, image:"https://images.unsplash.com/photo-1551488831-00ddcb6cbd3e?auto=format&fit=crop&w=700&q=85", colors:["رمادي","أسود"]},
  {id:"rvx-03", name:"ترنج ROVEX Volt — أسود", price:1699, image:"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=85", colors:["أسود","رمادي"]}
];
const $ = (selector) => document.querySelector(selector);
const money = (value) => `${value.toLocaleString("en-US")} ج.م`;
let cart = JSON.parse(localStorage.getItem("rovexCart") || "[]");
let activeProduct = null;
let selectedSize = "";
let modalQuantity = 1;
let promoCode = PROMO_CODES[localStorage.getItem("rovexPromo")] ? localStorage.getItem("rovexPromo") : "";
function getTotals(){
  const subtotal=cart.reduce((sum,item)=>sum+item.price*item.qty,0);
  const discount=Math.round(subtotal*(PROMO_CODES[promoCode]||0)/100);
  return {subtotal,discount,total:subtotal-discount};
}

function showToast(message){
  const toast=$("#toast"); toast.textContent=message; toast.classList.add("show");
  clearTimeout(showToast.timer); showToast.timer=setTimeout(()=>toast.classList.remove("show"),2300);
}
function saveCart(){localStorage.setItem("rovexCart",JSON.stringify(cart));}
function addToCart(id,size="M",color="أسود",qty=1){
  const product=products.find(item=>item.id===id); if(!product)return;
  const existing=cart.find(item=>item.id===id&&item.size===size&&item.color===color);
  if(existing)existing.qty+=qty;
  else cart.push({...product,size,color,qty});
  updateCart(); closeProductModal(); showToast("اتضاف للسلة بنجاح ✓");
}
function updateCart(){
  saveCart();
  const count=cart.reduce((sum,item)=>sum+item.qty,0);
  const t=getTotals();
  $("#cartCount").textContent=count; $("#drawerCount").textContent=`(${count})`;
  $("#cartSubtotal").textContent=money(t.total);$("#discountLine").hidden=!t.discount;$("#discountValue").textContent="− "+money(t.discount);
  const container=$("#cartItems");
  if(!cart.length){container.innerHTML='<div class="empty-cart">لسه السلة فاضية.<br><a href="#collection" id="continueShopping">اكتشف المجموعة ←</a></div>';return;}
  container.innerHTML=cart.map(item=>`
    <div class="cart-row">
      <img class="cart-thumb" src="${item.image}" alt="">
      <div><h3>${item.name}</h3><p>${money(item.price)}</p>
      <small>المقاس: ${item.size} | اللون: ${item.color}</small>
      <div class="qty-control"><button data-qty="${item.id}" data-size="${item.size}" data-color="${item.color}" data-change="-1">−</button><span>${item.qty}</span><button data-qty="${item.id}" data-size="${item.size}" data-color="${item.color}" data-change="1">＋</button></div>
      <button class="remove-item" data-remove="${item.id}" data-size="${item.size}" data-color="${item.color}">حذف</button></div>
      <strong>${money(item.price*item.qty)}</strong>
    </div>`).join("");
}
function openCart(){closeProductModal();$("#toast").classList.remove("show");$("#cartDrawer").classList.add("open");$("#cartDrawer").setAttribute("aria-hidden","false");$("#overlay").classList.add("show");document.body.style.overflow="hidden";}
function closeCart(){ $("#cartDrawer").classList.remove("open");$("#cartDrawer").setAttribute("aria-hidden","true");$("#overlay").classList.remove("show");document.body.style.overflow=""; }
function openProductModal(id){
  activeProduct=products.find(item=>item.id===id); if(!activeProduct)return;
  selectedSize="";modalQuantity=1;
  $("#modalProductName").textContent=activeProduct.name;
  $("#modalProductPrice").textContent=money(activeProduct.price);
  $("#modalProductImage").src=activeProduct.image;
  $("#modalProductImage").alt=activeProduct.name;
  $("#modalQty").textContent=modalQuantity;
  $("#colorSelect").value=activeProduct.colors[0];
  document.querySelectorAll("#sizeOptions button").forEach(b=>{b.classList.remove("selected");const out=(SOLD_OUT[id]||[]).includes(b.dataset.size);b.disabled=out;b.title=out?"نفذ":"";});
  $("#sizeError").classList.remove("show");
  $("#productModal").classList.add("open");$("#productModal").setAttribute("aria-hidden","false");
  $("#overlay").classList.add("show");document.body.style.overflow="hidden";
}
function closeProductModal(){
  $("#productModal").classList.remove("open");$("#productModal").setAttribute("aria-hidden","true");
  if(!$("#cartDrawer").classList.contains("open")){$("#overlay").classList.remove("show");document.body.style.overflow="";}
}
function openCheckout(){
  if(!cart.length){showToast("السلة فاضية، أضف منتج الأول");return;}
  closeCart();
  const t=getTotals();
  $("#checkoutSummary").innerHTML=`عدد القطع: ${cart.reduce((sum,item)=>sum+item.qty,0)}<br>${t.discount?`خصم (${promoCode}): − ${money(t.discount)}<br>`:""}إجمالي المنتجات: <strong>${money(t.total)}</strong><br>الشحن: يُحدد لاحقًا حسب المحافظة.`;
  $("#checkoutForm").hidden=false;$("#orderSuccess").hidden=true;
  $("#checkoutModal").classList.add("open");document.body.style.overflow="hidden";
}
function closeCheckout(){$("#checkoutModal").classList.remove("open");document.body.style.overflow="";}
document.addEventListener("click",event=>{
  const add=event.target.closest("[data-add]");if(add)openProductModal(add.dataset.add);
  const cardImg=event.target.closest(".product-image-wrap img");if(cardImg)openProductModal(cardImg.closest(".product-card").dataset.id);
  const view=event.target.closest("[data-view]");if(view)openProductModal(view.dataset.view);
  const size=event.target.closest("#sizeOptions [data-size]");
  if(size){selectedSize=size.dataset.size;document.querySelectorAll("#sizeOptions button").forEach(b=>b.classList.toggle("selected",b===size));$("#sizeError").classList.remove("show");}
  const qty=event.target.closest("[data-qty]");
  if(qty){const item=cart.find(p=>p.id===qty.dataset.qty&&p.size===qty.dataset.size&&p.color===qty.dataset.color);if(item){item.qty+=Number(qty.dataset.change);if(item.qty<=0)cart=cart.filter(p=>p!==item);updateCart();}}
  const remove=event.target.closest("[data-remove]");
  if(remove){cart=cart.filter(p=>!(p.id===remove.dataset.remove&&p.size===remove.dataset.size&&p.color===remove.dataset.color));updateCart();}
  const favorite=event.target.closest(".favorite-btn");
  if(favorite)toggleFavorite(favorite);
  if(event.target.closest("#continueShopping"))closeCart();
});
$("#cartToggle").addEventListener("click",openCart);
$("#cartClose").addEventListener("click",closeCart);
$("#overlay").addEventListener("click",()=>{closeCart();closeProductModal();});
$("#productModalClose").addEventListener("click",closeProductModal);
$("#modalQtyMinus").addEventListener("click",()=>{modalQuantity=Math.max(1,modalQuantity-1);$("#modalQty").textContent=modalQuantity;});
$("#modalQtyPlus").addEventListener("click",()=>{modalQuantity=Math.min(10,modalQuantity+1);$("#modalQty").textContent=modalQuantity;});
$("#modalAddToCart").addEventListener("click",()=>{if(!selectedSize){$("#sizeError").classList.add("show");return;}addToCart(activeProduct.id,selectedSize,$("#colorSelect").value,modalQuantity);});
$("#checkoutButton").addEventListener("click",openCheckout);
$("#checkoutClose").addEventListener("click",closeCheckout);
$("#successClose").addEventListener("click",()=>{closeCheckout();cart=[];updateCart();});
$("#checkoutForm").addEventListener("submit",event=>{
  event.preventDefault();
  const data=new FormData(event.target);
  const orderNumber="RVX-"+Date.now().toString().slice(-7);
  const t=getTotals();
  const lines=cart.map((i,n)=>`${n+1}) ${i.name} | مقاس ${i.size} | ${i.color} | ×${i.qty} = ${money(i.price*i.qty)}`);
  const msg=["طلب جديد من متجر ROVEX 🛒",`رقم الطلب: ${orderNumber}`,"",...lines,"",
    t.discount?`خصم (${promoCode}): − ${money(t.discount)}`:null,
    `الإجمالي: ${money(t.total)} (الشحن يُحدد حسب المحافظة)`,"",
    `الاسم: ${data.get("name")}`,`الموبايل: ${data.get("phone")}`,
    `العنوان: ${data.get("governorate")} - ${data.get("city")} - ${data.get("address")}`,
    data.get("notes")?`ملاحظات: ${data.get("notes")}`:null,
    `الدفع: ${data.get("payment")}`].filter(x=>x!==null).join("\n");
  const url=`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  $("#waRetry").href=url;
  window.open(url,"_blank","noopener");
  $("#successMessage").textContent=`رقم طلبك: ${orderNumber}. اتفتح واتساب برسالة الطلب جاهزة، اضغط "إرسال" عشان نأكد معاك.`;
  event.target.reset();
  $("#checkoutForm").hidden=true;$("#orderSuccess").hidden=false;
});
function setMenu(open){
  $("#mainNav").classList.toggle("open",open);
  $("#menuToggle").setAttribute("aria-expanded",String(open));
  $("#menuToggle").setAttribute("aria-label",open?"إغلاق القائمة":"فتح القائمة");
}
$("#menuToggle").addEventListener("click",()=>setMenu(!$("#mainNav").classList.contains("open")));
$("#mainNav").querySelectorAll("a").forEach(link=>link.addEventListener("click",()=>setMenu(false)));
document.addEventListener("click",e=>{if(!e.target.closest(".site-header"))setMenu(false);});
const originalOrder=[...document.querySelectorAll("#productGrid .product-card")];
$("#sortSelect").addEventListener("change",event=>{
  const grid=$("#productGrid"),mode=event.target.value,list=[...originalOrder];
  if(mode==="asc")list.sort((x,y)=>x.dataset.price-y.dataset.price);
  if(mode==="desc")list.sort((x,y)=>y.dataset.price-x.dataset.price);
  list.forEach(card=>grid.appendChild(card));
});
$("#newsletterForm").addEventListener("submit",event=>{event.preventDefault();$("#newsletterMessage").textContent="شكرًا لاشتراكك في ROVEX!";event.target.reset();});
document.addEventListener("keydown",event=>{if(event.key==="Escape"){setMenu(false);$("#sizeGuideModal").classList.remove("open");closeCart();closeProductModal();closeCheckout();}});
document.querySelectorAll("[data-soon]").forEach(card=>{
  const notify=()=>showToast("القسم ده قريبًا.. ترقب الدروب الجاي 🔥");
  card.addEventListener("click",notify);
  card.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();notify();}});
});
/* ===== Size guide ===== */
$("#sizeGuideOpen").addEventListener("click",()=>$("#sizeGuideModal").classList.add("open"));
$("#sizeGuideClose").addEventListener("click",()=>$("#sizeGuideModal").classList.remove("open"));
$("#sizeGuideModal").addEventListener("click",e=>{if(e.target.id==="sizeGuideModal")$("#sizeGuideModal").classList.remove("open");});

/* ===== Promo code ===== */
if(promoCode){$("#promoInput").value=promoCode;$("#promoMessage").textContent=`تم تطبيق خصم ${PROMO_CODES[promoCode]}% ✓`;}
$("#promoApply").addEventListener("click",()=>{
  const code=$("#promoInput").value.trim().toUpperCase();
  if(!code)return;
  if(PROMO_CODES[code]){promoCode=code;localStorage.setItem("rovexPromo",code);$("#promoMessage").textContent=`تم تطبيق خصم ${PROMO_CODES[code]}% ✓`;}
  else{promoCode="";localStorage.removeItem("rovexPromo");$("#promoMessage").textContent="الكود غير صحيح";}
  updateCart();
});

/* ===== WhatsApp links ===== */
document.querySelectorAll("[data-wa]").forEach(a=>{a.href=`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("أهلاً ROVEX، عندي استفسار")}`;});

/* ===== Next drop countdown ===== */
(function(){
  const box=$("#dropCountdown");
  const target=NEXT_DROP_DATE?new Date(NEXT_DROP_DATE).getTime():NaN;
  if(isNaN(target)||target<=Date.now())return;
  box.hidden=false;
  const pad=n=>String(n).padStart(2,"0");
  let timer;
  const tick=()=>{
    const d=Math.max(0,target-Date.now());
    $("#cdD").textContent=pad(Math.floor(d/864e5));
    $("#cdH").textContent=pad(Math.floor(d/36e5)%24);
    $("#cdM").textContent=pad(Math.floor(d/6e4)%60);
    $("#cdS").textContent=pad(Math.floor(d/1e3)%60);
    if(d<=0){clearInterval(timer);box.hidden=true;}
  };
  tick();timer=setInterval(tick,1000);
})();
/* ===== Favorites (persist) ===== */
let favorites=[];try{favorites=JSON.parse(localStorage.getItem("rovexFav")||"[]");}catch(e){}
function paintFav(btn,on){btn.classList.toggle("is-favorite",on);btn.textContent=on?"♥":"♡";}
function toggleFavorite(btn){
  const id=btn.closest(".product-card").dataset.id;
  const on=!favorites.includes(id);
  favorites=on?[...favorites,id]:favorites.filter(x=>x!==id);
  try{localStorage.setItem("rovexFav",JSON.stringify(favorites));}catch(e){}
  paintFav(btn,on);showToast(on?"اتضاف للمفضلة ♥":"اتشال من المفضلة");
}
document.querySelectorAll(".product-card").forEach(card=>{const btn=card.querySelector(".favorite-btn");if(btn)paintFav(btn,favorites.includes(card.dataset.id));});

/* ===== Egyptian phone input ===== */
const phoneInput=document.querySelector('#checkoutForm [name="phone"]');
phoneInput.addEventListener("input",()=>{
  phoneInput.value=phoneInput.value.replace(/[٠-٩]/g,d=>"٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/\s+/g,"");
  phoneInput.setCustomValidity("");
});
phoneInput.addEventListener("invalid",()=>phoneInput.setCustomValidity("اكتب رقم موبايل مصري صحيح، مثال: 01012345678"));

/* ===== SEO: structured data from products ===== */
(function(){
  const ld={"@context":"https://schema.org","@graph":products.map(p=>({"@type":"Product",name:p.name,image:p.image,brand:{"@type":"Brand",name:"ROVEX"},offers:{"@type":"Offer",priceCurrency:"EGP",price:p.price,availability:"https://schema.org/InStock"}}))};
  const el=document.createElement("script");el.type="application/ld+json";el.textContent=JSON.stringify(ld);document.head.appendChild(el);
})();

/* ===== Accessibility: focus management + trap ===== */
(function(){
  const panels=["#sizeGuideModal","#checkoutModal","#productModal","#cartDrawer"].map(sel=>$(sel));
  const FOCUSABLE='a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';
  const vis=el=>el.getClientRects().length>0;
  const lastFocus=new Map();
  const observer=new MutationObserver(list=>list.forEach(m=>{
    const el=m.target,open=el.classList.contains("open"),tracked=lastFocus.has(el);
    el.setAttribute("aria-hidden",open?"false":"true");
    if(open&&!tracked){
      lastFocus.set(el,document.activeElement);
      setTimeout(()=>{const f=[...el.querySelectorAll(FOCUSABLE)].filter(vis);if(f[0])f[0].focus({preventScroll:true});},60);
    }
    if(!open&&tracked){const prev=lastFocus.get(el);lastFocus.delete(el);if(prev&&prev.focus)prev.focus({preventScroll:true});}
  }));
  panels.forEach(p=>observer.observe(p,{attributes:true,attributeFilter:["class"]}));
  document.addEventListener("keydown",e=>{
    if(e.key!=="Tab")return;
    const top=panels.find(p=>p.classList.contains("open"));if(!top)return;
    const f=[...top.querySelectorAll(FOCUSABLE)].filter(vis);if(!f.length)return;
    const first=f[0],last=f[f.length-1],inside=top.contains(document.activeElement);
    if(e.shiftKey&&(!inside||document.activeElement===first)){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&(!inside||document.activeElement===last)){e.preventDefault();first.focus();}
  });
})();

/* ===== Scroll reveal + back to top ===== */
(function(){
  const toTop=$("#toTop");
  window.addEventListener("scroll",()=>toTop.classList.toggle("show",window.scrollY>700),{passive:true});
  toTop.addEventListener("click",()=>window.scrollTo({top:0,behavior:"smooth"}));
  if(!("IntersectionObserver" in window)||matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  const io=new IntersectionObserver(entries=>entries.forEach(en=>{if(en.isIntersecting){en.target.classList.add("in");io.unobserve(en.target);}}),{threshold:.12});
  document.querySelectorAll(".section-heading,.category-card,.product-card,.benefit,.manifesto-content,.faq-list").forEach(el=>{
    el.style.transitionDelay=(Array.prototype.indexOf.call(el.parentNode.children,el)%4)*80+"ms";
    el.classList.add("reveal");io.observe(el);
  });
})();
/* ===== Header: scrolled state + active link (scroll-spy) ===== */
(function(){
  const header=document.querySelector(".site-header");
  const links=[...document.querySelectorAll("#mainNav a")];
  const targets=links.map(a=>({a,el:document.getElementById(a.getAttribute("href").slice(1))})).filter(t=>t.el);
  let ticking=false;
  function update(){
    ticking=false;
    header.classList.toggle("scrolled",window.scrollY>30);
    const y=window.scrollY+header.offsetHeight+80;
    let current=targets[0];
    targets.forEach(t=>{if(t.el.getBoundingClientRect().top+window.scrollY<=y)current=t;});
    if(window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-4)current=targets[targets.length-1];
    links.forEach(a=>{const on=current&&a===current.a;a.classList.toggle("active",on);if(on)a.setAttribute("aria-current","true");else a.removeAttribute("aria-current");});
  }
  const onScroll=()=>{if(!ticking){ticking=true;requestAnimationFrame(update);}};
  window.addEventListener("scroll",onScroll,{passive:true});
  window.addEventListener("resize",onScroll);
  update();
})();

/* ===== Announcement bar rotator (mobile shows one message at a time) ===== */
(function(){
  const items=[...document.querySelectorAll("#announcement .ann-item")];
  if(items.length<2||matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  let i=0;
  setInterval(()=>{items[i].classList.remove("on");i=(i+1)%items.length;items[i].classList.add("on");},3500);
})();
/* ===== Ticker marquee: duplicate content for a seamless loop ===== */
(function(){
  const track=document.querySelector(".ticker-track");
  if(!track||matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  [...track.children].forEach(n=>{const c=n.cloneNode(true);c.setAttribute("aria-hidden","true");track.appendChild(c);});
})();
updateCart();