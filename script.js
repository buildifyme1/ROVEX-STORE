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
  const total=cart.reduce((sum,item)=>sum+item.price*item.qty,0);
  $("#cartCount").textContent=count; $("#drawerCount").textContent=`(${count})`;
  $("#cartSubtotal").textContent=money(total);
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
function openCart(){closeProductModal();$("#cartDrawer").classList.add("open");$("#cartDrawer").setAttribute("aria-hidden","false");$("#overlay").classList.add("show");document.body.style.overflow="hidden";}
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
  document.querySelectorAll("#sizeOptions button").forEach(button=>button.classList.remove("selected"));
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
  const total=cart.reduce((sum,item)=>sum+item.price*item.qty,0);
  $("#checkoutSummary").innerHTML=`عدد القطع: ${cart.reduce((sum,item)=>sum+item.qty,0)}<br>إجمالي المنتجات: <strong>${money(total)}</strong><br>الشحن: يُحدد لاحقًا حسب المحافظة.`;
  $("#checkoutForm").hidden=false;$("#orderSuccess").hidden=true;
  $("#checkoutModal").classList.add("open");document.body.style.overflow="hidden";
}
function closeCheckout(){$("#checkoutModal").classList.remove("open");document.body.style.overflow="";}
document.addEventListener("click",event=>{
  const add=event.target.closest("[data-add]");if(add)addToCart(add.dataset.add);
  const view=event.target.closest("[data-view]");if(view)openProductModal(view.dataset.view);
  const size=event.target.closest("[data-size]");
  if(size){selectedSize=size.dataset.size;document.querySelectorAll("#sizeOptions button").forEach(b=>b.classList.toggle("selected",b===size));$("#sizeError").classList.remove("show");}
  const qty=event.target.closest("[data-qty]");
  if(qty){const item=cart.find(p=>p.id===qty.dataset.qty&&p.size===qty.dataset.size&&p.color===qty.dataset.color);if(item){item.qty+=Number(qty.dataset.change);if(item.qty<=0)cart=cart.filter(p=>p!==item);updateCart();}}
  const remove=event.target.closest("[data-remove]");
  if(remove){cart=cart.filter(p=>!(p.id===remove.dataset.remove&&p.size===remove.dataset.size&&p.color===remove.dataset.color));updateCart();}
  const favorite=event.target.closest(".favorite-btn");
  if(favorite){favorite.classList.toggle("is-favorite");favorite.textContent=favorite.classList.contains("is-favorite")?"♥":"♡";}
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
  $("#successMessage").textContent=`رقم الطلب التجريبي: ${orderNumber}. تم التحقق من بيانات النموذج محليًا فقط.`;
  $("#checkoutForm").hidden=true;$("#orderSuccess").hidden=false;
});
$("#menuToggle").addEventListener("click",()=>$("#mainNav").classList.toggle("open"));
$("#mainNav").querySelectorAll("a").forEach(link=>link.addEventListener("click",()=>$("#mainNav").classList.remove("open")));
$("#searchToggle").addEventListener("click",()=>{$("#searchPanel").classList.add("show");$("#searchInput").focus();});
$("#searchClose").addEventListener("click",()=>$("#searchPanel").classList.remove("show"));
$("#searchInput").addEventListener("input",event=>{const query=event.target.value.trim().toLowerCase();document.querySelectorAll(".product-card").forEach(card=>card.style.display=card.dataset.name.toLowerCase().includes(query)?"":"none");});
$("#sortButton").addEventListener("click",()=>{const grid=$("#productGrid");[...grid.querySelectorAll(".product-card")].reverse().forEach(card=>grid.appendChild(card));showToast("تم تغيير ترتيب العرض");});
$("#newsletterForm").addEventListener("submit",event=>{event.preventDefault();$("#newsletterMessage").textContent="شكرًا لاشتراكك في ROVEX!";event.target.reset();});
document.addEventListener("keydown",event=>{if(event.key==="Escape"){closeCart();closeProductModal();closeCheckout();}});
updateCart();
