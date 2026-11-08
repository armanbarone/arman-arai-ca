const {test}=require('node:test');
const assert=require('node:assert/strict');
const {loader}=require('./wedding-test-loader.cjs');
function harness({reuse=false,wrongPrice=false,wrongMerchant=false}={}){
 const created=[],updates=[],product='prod_VRv3xk15KZIIXJ';
 const prices=[6700,5500,4500].map((unit_amount,i)=>({id:`price_album_${i}`,active:true,livemode:true,currency:'cad',unit_amount,tax_behavior:'exclusive',product:'aa_ca_christmas_album_2026',lookup_key:['aa_ca_xmas_album_first_2026','aa_ca_xmas_album_second_2026','aa_ca_xmas_album_third_2026'][i]}));
 if(reuse)prices.push({id:'price_new_250',active:true,livemode:true,currency:'cad',unit_amount:wrongPrice?30000:25000,tax_behavior:'exclusive',product,lookup_key:'aa_ca_xmas_session_250_30min_2026'});
 const stripe={prices:{retrieve:async()=>({id:'price_legacy_300',unit_amount:30000,livemode:true,currency:'cad',product:wrongMerchant?'other':product}),list:async q=>({data:prices.filter(p=>q.lookup_keys.includes(p.lookup_key))}),create:async p=>{created.push(p);const price={...p,id:'price_new_250',active:true,livemode:true};prices.push(price);return price;}},products:{retrieve:async()=>({}),update:async(id,p)=>{updates.push({id,...p});return{};}},taxRates:{list:async()=>({data:[{id:'gst',active:true,inclusive:false,livemode:true,percentage:5,country:'CA',display_name:'GST',tax_type:'gst'},{id:'pst',active:true,inclusive:false,livemode:true,percentage:7,country:'CA',state:'BC',display_name:'PST',tax_type:'pst'}]})}};
 const api=loader({'@/lib/portal/stripe':{stripeClient:()=>stripe}})('@/lib/christmas/stripe-catalog');
 return{api,created,updates};
}
test('new $250 price is created separately from the legacy price, with correct album tax lines',async()=>{
 const h=harness(),c=await h.api.christmasCheckoutCatalog();assert.equal(c.price,'price_new_250');assert.equal(h.created.length,1);assert.equal(h.created[0].unit_amount,25000);assert.equal(h.created[0].tax_behavior,'exclusive');assert.deepEqual(c.taxRates,['gst']);assert.deepEqual(c.albumTaxRates,['gst','pst']);assert.equal(c.albumPrices.length,3);assert.equal(h.updates[0].default_price,'price_new_250');assert.match(h.updates[0].description,/30 minutes/);
});
test('existing matching $250 price is reused and an incorrect matching lookup fails closed',async()=>{
 const h=harness({reuse:true});await h.api.christmasCheckoutCatalog();assert.equal(h.created.length,0);
 await assert.rejects(harness({reuse:true,wrongPrice:true}).api.christmasCheckoutCatalog(),/does not match/);
 await assert.rejects(harness({wrongMerchant:true}).api.christmasCheckoutCatalog(),/merchant/);
});
