const KEY="expenseTrackerTransactions";
let transactions=JSON.parse(localStorage.getItem(KEY))||[];

const form=document.getElementById("transactionForm");
const list=document.getElementById("transactionList");
const search=document.getElementById("search");
const dateInput=document.getElementById("date");

dateInput.value=new Date().toISOString().split("T")[0];

function money(n){
  return new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2}).format(n);
}
function save(){localStorage.setItem(KEY,JSON.stringify(transactions));}
function escapeHtml(v){
  return v.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
}
function update(){
  const income=transactions.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0);
  const expense=transactions.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0);
  document.getElementById("income").textContent=money(income);
  document.getElementById("expense").textContent=money(expense);
  document.getElementById("balance").textContent=money(income-expense);
  document.getElementById("transactionCount").textContent=
    `${transactions.length} transaction${transactions.length===1?"":"s"}`;
}
function render(){
  const q=search.value.trim().toLowerCase();
  const items=[...transactions].reverse().filter(t=>
    t.description.toLowerCase().includes(q)||
    t.category.toLowerCase().includes(q)||
    t.date.includes(q)
  );
  if(!items.length){
    list.innerHTML=`<div class="empty">${transactions.length?"No transactions match your search.":"No transactions yet. Add your first transaction above."}</div>`;
    update(); return;
  }
  list.innerHTML=items.map(t=>{
    const sign=t.type==="income"?"+":"-";
    return `<article class="transaction">
      <div><h3>${escapeHtml(t.description)}</h3><p>${escapeHtml(t.category)} • ${escapeHtml(t.date)}</p></div>
      <div class="amount ${t.type}">${sign} ${money(t.amount)}</div>
      <button class="delete-btn" onclick="deleteTransaction(${t.id})">Delete</button>
    </article>`;
  }).join("");
  update();
}
form.addEventListener("submit",e=>{
  e.preventDefault();
  const description=document.getElementById("description").value.trim();
  const amount=Number(document.getElementById("amount").value);
  if(!description||amount<=0||!dateInput.value){alert("Enter valid details.");return;}
  transactions.push({
    id:Date.now(),description,amount,
    type:document.getElementById("type").value,
    category:document.getElementById("category").value,
    date:dateInput.value
  });
  save();form.reset();dateInput.value=new Date().toISOString().split("T")[0];render();
});
function deleteTransaction(id){transactions=transactions.filter(t=>t.id!==id);save();render();}
document.getElementById("clearAllBtn").addEventListener("click",()=>{
  if(!transactions.length)return;
  if(confirm("Delete all transactions?")){transactions=[];save();render();}
});
search.addEventListener("input",render);
render();
