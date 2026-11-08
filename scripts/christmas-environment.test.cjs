const {test}=require('node:test');
const assert=require('node:assert/strict');
const {loader}=require('./wedding-test-loader.cjs');
function env(t,values){const keys=['VERCEL_ENV','STRIPE_SECRET_KEY','CHRISTMAS_TEST_MODE','PORTAL_BLOB_PREFIX','APP_URL'];const previous=Object.fromEntries(keys.map(k=>[k,process.env[k]]));for(const k of keys)delete process.env[k];Object.assign(process.env,values);t.after(()=>{for(const k of keys)previous[k]===undefined?delete process.env[k]:process.env[k]=previous[k];});return loader()('@/lib/christmas/environment');}
test('production cannot enable test payments even with the opt-in flag',t=>{
 const api=env(t,{VERCEL_ENV:'production',STRIPE_SECRET_KEY:'rk_test_fixture',CHRISTMAS_TEST_MODE:'1',APP_URL:'http://127.0.0.1:8134',PORTAL_BLOB_PREFIX:'dev/christmas-e2e/fixture/'});assert.equal(api.christmasPaymentMode(),null);process.env.STRIPE_SECRET_KEY='rk_live_fixture';assert.equal(api.christmasPaymentMode(),'live');
});
test('local test payments require an explicit flag, test key, loopback URL and isolated prefix',t=>{
 const values={VERCEL_ENV:'development',STRIPE_SECRET_KEY:'rk_test_fixture',CHRISTMAS_TEST_MODE:'1',APP_URL:'http://127.0.0.1:8134',PORTAL_BLOB_PREFIX:'dev/christmas-e2e/fixture/'};const api=env(t,values);assert.equal(api.christmasPaymentMode(),'test');
 for(const [key,value]of Object.entries({CHRISTMAS_TEST_MODE:'0',STRIPE_SECRET_KEY:'rk_live_fixture',APP_URL:'https://preview.example.com',PORTAL_BLOB_PREFIX:'dev/'})){process.env[key]=value;assert.equal(api.christmasPaymentMode(),null,key);process.env[key]=values[key];}
 assert.equal(api.christmasSameOrigin(new Request('http://localhost:8134/api/christmas/cart',{headers:{origin:'http://127.0.0.1:8134'}})),true);assert.equal(api.christmasSameOrigin(new Request('http://localhost:8134/api/christmas/cart',{headers:{origin:'https://external.example'}})),false);
});
test('production origin checks retain the actual request origin',t=>{
 const api=env(t,{VERCEL_ENV:'production',STRIPE_SECRET_KEY:'rk_live_fixture',APP_URL:'https://www.armanarai.ca'});assert.equal(api.christmasSameOrigin(new Request('https://www.armanarai.ca/api/christmas/checkout',{headers:{origin:'https://external.example'}})),false);assert.equal(api.christmasSameOrigin(new Request('https://www.armanarai.ca/api/christmas/checkout',{headers:{origin:'https://www.armanarai.ca'}})),true);
});
