package org.alienclash.twod;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import com.google.android.gms.ads.*;
import com.google.android.gms.ads.rewarded.*;
import com.google.ads.mediation.admob.AdMobAdapter;
import org.json.*;
import java.text.SimpleDateFormat;
import java.util.*;

// Native completion callbacks are the only source of ad progress. Web code cannot add views.
public final class RewardAds {
 private final Activity activity; private final WebView web; private final SharedPreferences prefs;
 private volatile boolean busy=false; private boolean initialized=false; private final Random random=new java.security.SecureRandom();
 private static final int[] RANKS={2,1,2,1,0,0,1,1,0,2,1,0,1,0,2,0,1,2,4,1,0,0,2,1,3,2,2,2,1,2,1,4,2,2,1,2,2,3,2,3,1,1,2,3,0,2,3,2,4,1,0,2,2,1,1,2,3,2,4,0,0,1,2,3,3,2,1,4,4,4,4,4,3,3,4,3,4,3,4,2,2,2,2,2,3,2,1,2,2,2,2,4};
 private static final String LIVE_UNIT="ca-app-pub-8833928525618902/9806944422";
 private static final String TEST_UNIT="ca-app-pub-3940256099942544/5224354917";
 public RewardAds(Activity a,WebView w){activity=a;web=w;prefs=a.getSharedPreferences("daily_reward_ads_v1",Activity.MODE_PRIVATE);}
 private String day(){SimpleDateFormat f=new SimpleDateFormat("yyyy-MM-dd",Locale.US);f.setTimeZone(TimeZone.getTimeZone("UTC"));return f.format(new Date());}
 private JSONObject read(){try{return new JSONObject(prefs.getString("ledger","{}"));}catch(Exception e){return new JSONObject();}}
 private boolean save(JSONObject s){return prefs.edit().putString("ledger",s.toString()).commit();}
 private int required(String key){if(key.equals("pack:omni"))return 1;if(key.equals("pack:power"))return 2;if(key.equals("pack:master"))return 3;for(int i=0;i<5;i++)if(key.equals("alien:"+i))return 2*(i+1);return -1;}
 private synchronized JSONObject state(String ownedText) throws JSONException {
  JSONObject s=read();String today=day(),old=s.optString("day","");
  if(today.compareTo(old)>0){
   Set<Integer> owned=new HashSet<>();try{JSONArray a=new JSONArray(ownedText);for(int i=0;i<a.length();i++)owned.add(a.getInt(i));}catch(Exception ignored){}
   JSONArray offers=new JSONArray();for(int rank=0;rank<5;rank++){List<Integer> pool=new ArrayList<>(),all=new ArrayList<>();for(int id=0;id<RANKS.length;id++)if(RANKS[id]==rank){all.add(id);if(!owned.contains(id))pool.add(id);}if(pool.isEmpty())pool=all;int id=pool.get(random.nextInt(pool.size()));offers.put(new JSONObject().put("id",id).put("duplicate",owned.contains(id)));}
   s.put("day",today).put("views",0).put("progress",new JSONObject()).put("offers",offers).put("claimed",new JSONArray()).put("offerChanges",new JSONObject());if(!save(s))throw new JSONException("Could not save daily rewards");
  }
  if(!s.has("progress")){
   JSONObject progress=new JSONObject();int used=0;JSONArray claimed=s.optJSONArray("claimed");if(claimed!=null)for(int i=0;i<claimed.length();i++)used=Math.max(used,2*(claimed.getJSONObject(i).optInt("rank")+1));
   int remaining=Math.max(0,s.optInt("views")-used);for(int i=0;i<5;i++){boolean taken=false;if(claimed!=null)for(int j=0;j<claimed.length();j++)if(claimed.getJSONObject(j).optInt("rank",-1)==i)taken=true;if(!taken){int n=Math.min(remaining,2*(i+1));progress.put("alien:"+i,n);remaining-=n;}}
   s.put("progress",progress);if(!save(s))throw new JSONException("Could not migrate reward progress");
  }
  s.put("clockBlocked",today.compareTo(s.optString("day"))<0);s.put("testAds",BuildConfig.REWARDED_TEST_ADS);return s;
 }
 @JavascriptInterface public synchronized String getState(String owned){try{return state(owned).toString();}catch(Exception e){return "{\"error\":\"Reward storage unavailable\"}";}}
 private boolean claimed(JSONObject s,String key) throws JSONException {JSONArray a=s.getJSONArray("claimed");for(int i=0;i<a.length();i++){JSONObject r=a.getJSONObject(i);if(key.equals(r.optString("key","alien:"+r.optInt("rank",-1))))return true;}return false;}
 @JavascriptInterface public synchronized String claimReward(String key,String owned){try{
  JSONObject s=state(owned);int need=required(key);if(need<0||s.optBoolean("clockBlocked")||s.getJSONObject("progress").optInt(key)<need)return "{}";
  JSONArray receipts=s.getJSONArray("claimed");for(int i=0;i<receipts.length();i++){JSONObject r=receipts.getJSONObject(i);if(key.equals(r.optString("key","alien:"+r.optInt("rank",-1))))return r.toString();}
  JSONObject receipt=new JSONObject().put("receipt",s.getString("day")+":"+key).put("key",key);
  if(key.startsWith("alien:")){int rank=Integer.parseInt(key.substring(6));JSONObject offer=s.getJSONArray("offers").getJSONObject(rank);boolean duplicate=offer.getBoolean("duplicate");try{JSONArray ids=new JSONArray(owned);for(int i=0;i<ids.length();i++)if(ids.getInt(i)==offer.getInt("id"))duplicate=true;}catch(Exception ignored){}receipt.put("kind","alien").put("rank",rank).put("id",offer.getInt("id")).put("duplicate",duplicate);}
  else {String pack=key.substring(5);int[] weights=pack.equals("omni")?new int[]{60,25,10,4,1}:pack.equals("power")?new int[]{25,35,25,12,3}:new int[]{0,15,40,30,15};JSONArray ids=new JSONArray();for(int draw=0;draw<15;draw++){int roll=random.nextInt(100),sum=0,rank=4;for(int i=0;i<5;i++){sum+=weights[i];if(roll<sum){rank=i;break;}}List<Integer> pool=new ArrayList<>();for(int id=0;id<RANKS.length;id++)if(RANKS[id]==rank)pool.add(id);ids.put(pool.get(random.nextInt(pool.size())));}receipt.put("kind","pack").put("packId",pack).put("cardIds",ids);}
  receipts.put(receipt);if(!save(s))return "{}";return receipt.toString();
 }catch(Exception e){return "{}";}}
 // Diamond debit is journaled in the atomic web profile before this idempotent native change.
 @JavascriptInterface public synchronized String changeOffer(String transaction,String expectedDay,int rank,int chosen,String ownedText){try{
  JSONObject s=state(ownedText);if(rank<0||rank>=5||transaction==null||transaction.length()>100||!expectedDay.equals(s.getString("day")))return "{\"error\":\"Offer day changed. Diamonds refunded.\"}";
  JSONObject changes=s.optJSONObject("offerChanges");if(changes==null){changes=new JSONObject();s.put("offerChanges",changes);}if(changes.has(transaction))return changes.getJSONObject(transaction).toString();
  if(busy||s.optBoolean("clockBlocked")||claimed(s,"alien:"+rank))return "{\"error\":\"Offer cannot be changed right now.\"}";
  int current=s.getJSONArray("offers").getJSONObject(rank).getInt("id"),id=chosen;
  if(chosen==-1){List<Integer> pool=new ArrayList<>();for(int i=0;i<RANKS.length;i++)if(RANKS[i]==rank&&i!=current)pool.add(i);if(pool.isEmpty())return "{\"error\":\"No other alien in this category.\"}";id=pool.get(random.nextInt(pool.size()));}
  if(id<0||id>=RANKS.length||RANKS[id]!=rank||id==current)return "{\"error\":\"Choose a different alien in this category.\"}";
  boolean duplicate=false;try{JSONArray a=new JSONArray(ownedText);for(int i=0;i<a.length();i++)if(a.getInt(i)==id)duplicate=true;}catch(Exception ignored){}
  JSONObject offer=new JSONObject().put("id",id).put("duplicate",duplicate),result=new JSONObject().put("ok",true).put("day",s.getString("day")).put("offer",offer);
  s.getJSONArray("offers").put(rank,offer);changes.put(transaction,result);if(!save(s))return "{\"error\":\"Offer could not be saved.\"}";return result.toString();
 }catch(Exception e){return "{\"error\":\"Offer could not be changed.\"}";}}
 private void emit(String status){web.post(()->{if(!activity.isFinishing())web.evaluateJavascript("window.dispatchEvent(new CustomEvent('omni-ad-state',{detail:"+JSONObject.quote(status)+"}))",null);});}
 @JavascriptInterface public void watchReward(String key,String owned){activity.runOnUiThread(()->{
  try{JSONObject s=state(owned);int need=required(key);if(busy||need<0||s.optBoolean("clockBlocked")||claimed(s,key)||s.getJSONObject("progress").optInt(key)>=need){emit("This reward is unavailable or already ready to claim.");return;}
   String label=key.startsWith("pack:")?key.substring(5)+" pack":new String[]{"Common","Rare","Epic","Heroic","Legendary"}[Integer.parseInt(key.substring(6))]+" character";
   new AlertDialog.Builder(activity).setTitle("Optional rewarded ad").setMessage("Complete one ad for 1 progress toward the "+label+" reward ("+s.getJSONObject("progress").optInt(key)+" / "+need+"). Only this reward's counter increases. Closing before earning the reward adds nothing. Normal play remains available without ads.").setNegativeButton("Not now",(d,w)->emit("Ad cancelled")).setPositiveButton("Watch ad",(d,w)->load(key,owned)).show();
  }catch(Exception e){emit("Could not prepare ad. Please try again.");}
 });}
 private void load(String key,String owned){if(busy)return;busy=true;emit("Loading ad…");
  RequestConfiguration config=new RequestConfiguration.Builder().setTagForChildDirectedTreatment(RequestConfiguration.TAG_FOR_CHILD_DIRECTED_TREATMENT_TRUE).setTagForUnderAgeOfConsent(RequestConfiguration.TAG_FOR_UNDER_AGE_OF_CONSENT_TRUE).setMaxAdContentRating(RequestConfiguration.MAX_AD_CONTENT_RATING_G).build();MobileAds.setRequestConfiguration(config);
  if(!initialized){initialized=true;MobileAds.initialize(activity,status->activity.runOnUiThread(()->request(key,owned)));}else request(key,owned);
 }
 private void request(String key,String owned){Bundle extras=new Bundle();extras.putString("npa","1");AdRequest request=new AdRequest.Builder().addNetworkExtrasBundle(AdMobAdapter.class,extras).build();
  RewardedAd.load(activity,BuildConfig.REWARDED_TEST_ADS?TEST_UNIT:LIVE_UNIT,request,new RewardedAdLoadCallback(){
   @Override public void onAdFailedToLoad(LoadAdError error){busy=false;emit("No ad available right now. No progress was used. Try later.");}
   @Override public void onAdLoaded(RewardedAd ad){final String castDay=day();final boolean[] earned={false};ad.setFullScreenContentCallback(new FullScreenContentCallback(){
    @Override public void onAdDismissedFullScreenContent(){busy=false;emit(earned[0]?"Ad completed. Progress saved.":"Ad closed. No reward was earned.");}
    @Override public void onAdFailedToShowFullScreenContent(AdError e){busy=false;emit("Ad could not open. No progress was used.");}
   });ad.show(activity,reward->{synchronized(RewardAds.this){if(earned[0])return;try{JSONObject s=state(owned);if(!castDay.equals(s.getString("day"))||required(key)<0||claimed(s,key)||s.getJSONObject("progress").optInt(key)>=required(key)){emit("A new reward day has started. Please try again.");return;}s.getJSONObject("progress").put(key,s.getJSONObject("progress").optInt(key)+1);if(save(s)){earned[0]=true;emit("Ad completed. Progress saved.");}else emit("Could not save progress. Please contact support.");}catch(Exception e){emit("Could not save reward progress.");}}});}
  });
 }
}



