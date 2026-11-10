const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const source=ts.createSourceFile('ChristmasExperience.tsx',fs.readFileSync(path.join(__dirname,'../components/christmas/ChristmasExperience.tsx'),'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
let handler;function visit(n){if(ts.isFunctionDeclaration(n)&&n.name?.text==='beginPayment')handler=n.getText(source);ts.forEachChild(n,visit);}visit(source);assert.ok(handler);
const compiled=ts.transpileModule(handler,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
function harness({failure=false,preview=false}={}){
 const calls=[],steps=[],errors=[],ref={current:false};let resolve;
 const gate=new Promise(r=>resolve=r),tracking={eventId:'a'.repeat(64),paidCents:5000,albums:1};
 const fields={cartId:'cart',cartToken:'private',name:'Test',email:'test@example.invalid',phone:'6045550100',consent:'on',letterNames:'Family',mailLine1:'Studio',mailCity:'Vancouver',mailPostalCode:'V7N 1J2'};
 const sandbox={URL,URLSearchParams,FormData:class{get(k){return fields[k]??null;}},paymentPending:ref,slot:{id:'slot',available:true,santa:true},pkg:{id:'santa',santa:true},data:{mode:preview?'preview':'live',cancellationPolicy:'policy'},albums:1,subtotal:31700,quote:{total:33754,dueNow:5000},DEPOSIT_PLAN:'deposit-50-v1',setError:e=>errors.push(e),setBusy:b=>steps.push(['busy',b]),setStep:s=>steps.push(['step',s]),advertisingOptOut:()=>false,trackChristmasCheckout:async data=>steps.push(['event',data]),window:{location:{search:'',assign:url=>steps.push(['redirect',url])}},fetch:async(url,options)=>{calls.push({url,body:JSON.parse(options.body)});await gate;return{ok:!failure,json:async()=>failure?{error:'Checkout failed'}:{checkoutUrl:'https://checkout.stripe.com/c/pay/fixture',checkoutTracking:tracking}};}};
 vm.runInNewContext(compiled+'\nthis.run=beginPayment;',sandbox);
 return{run:()=>sandbox.run({preventDefault(){},currentTarget:{}}),release:()=>resolve(),calls,steps,errors,ref,tracking};
}
test('the real React checkout handler ignores double clicks and reports only after a successful Stripe response before redirecting',async()=>{
 const h=harness(),first=h.run(),second=h.run();assert.equal(h.calls.length,1);assert.equal(h.steps.filter(s=>s[0]==='event').length,0);
 h.release();await Promise.all([first,second]);await h.run();assert.equal(h.calls.length,1);
 const event=h.steps.findIndex(s=>s[0]==='event'),redirect=h.steps.findIndex(s=>s[0]==='redirect');assert.ok(event>=0&&redirect>event);assert.deepEqual(h.steps[event][1],h.tracking);assert.equal(h.calls[0].body.expectedDueNow,5000);assert.equal(h.ref.current,true);
});
test('failed checkout and design previews never report InitiateCheckout or Purchase',async()=>{
 const failed=harness({failure:true}),pending=failed.run();failed.release();await pending;assert.equal(failed.ref.current,false);assert.equal(failed.steps.filter(s=>['event','redirect'].includes(s[0])).length,0);assert.ok(failed.errors.includes('Checkout failed'));
 const preview=harness({preview:true});await preview.run();assert.equal(preview.calls.length,0);assert.equal(preview.steps.filter(s=>s[0]==='event').length,0);
});
