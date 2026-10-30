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
 private boolean busy=false,initialized=false; private final Random random=new java.security.SecureRandom();
 private static final int[] RANKS={2,1,2,1,0,0,1,1,0,2,1,0,1,0,2,0,1,2,4,1,0,0,2,1,3,2,2,2,1,2,1,4,2,2,1,2,2,3,2,3,1,1,2,3,0,2,3,2,4,1,0,2,2,1,1,2,3,2,4,0,0,1,2,3,3,2,1,4,4,4,4,4,3,3,4,3,4,3,4,2,2,2,2,2,3,2,1,2,2,2,2,4};
 private static final String LIVE_UNIT="ca-app-pub-8833928525618902/9806944422";
 private static final String TEST_UNIT="ca-app-pub-3940256099942544/5224354917";
 public RewardAds(Activity a,WebView w){activity=a;web=w;prefs=a.getSharedPreferences("daily_reward_ads_v1",Activity.MODE_PRIVATE);}
 private String day(){SimpleDateFormat f=new SimpleDateFormat("yyyy-MM-dd",Locale.US);f.setTimeZone(TimeZone.getTimeZone("UTC"));return f.format(new Date());}
 private JSONObject read(){try{return new JSONObject(prefs.getString("ledger","{}"));}catch(Exception e){return new JSONObject();}}
 private boolean save(JSONObject s){return prefs.edit().putString("ledger",s.toString()).commit();}
 private synchronized JSONObject state(String ownedText) throws JSONException {
  JSONObject s=read();String today=day(),old=s.optString("day","");
  if(today.compareTo(old)>0){
   Set<Integer> owned=new HashSet<>();try{JSONArray a=new JSONArray(ownedText);for(int i=0;i<a.length();i++)owned.add(a.getInt(i));}catch(Exception ignored){}
   JSONArray offers=new JSONArray();for(int rank=0;rank<5;rank++){List<Integer> pool=new ArrayList<>(),all=new ArrayList<>();for(int id=0;id<RANKS.length;id++)if(RANKS[id]==rank){all.add(id);if(!owned.contains(id))pool.add(id);}if(pool.isEmpty())pool=all;int id=pool.get(random.nextInt(pool.size()));offers.put(new JSONObject().put("id",id).put("duplicate",owned.contains(id)));}
   s.put("day",today).put("views",0).put("offers",offers).put("claimed",new JSONArray());if(!save(s))throw new JSONException("Could not save daily rewards");
  }
  s.put("clockBlocked",today.compareTo(s.optString("day"))<0);s.put("testAds",BuildConfig.REWARDED_TEST_ADS);s.put("audience",prefs.getString("audience",""));return s;
 }
 @JavascriptInterface public synchronized String getState(String owned){try{return state(owned).toString();}catch(Exception e){return "{\"error\":\"Reward storage unavailable\"}";}}
 @JavascriptInterface public boolean setAudience(String group){if(!Arrays.asList("under6","6-12","13-17","18+").contains(group))return false;return prefs.edit().putString("audience",group).commit();}
 @JavascriptInterface public synchronized String claim(int rank,String owned){try{
  JSONObject s=state(owned);if(rank<0||rank>4||s.optBoolean("clockBlocked")||s.optInt("views")<2*(rank+1))return "{}";
  JSONArray claimed=s.getJSONArray("claimed");for(int i=0;i<claimed.length();i++)if(claimed.getJSONObject(i).getInt("rank")==rank)return claimed.getJSONObject(i).toString();
  JSONObject offer=s.getJSONArray("offers").getJSONObject(rank);boolean duplicate=offer.getBoolean("duplicate");try{JSONArray ownedIds=new JSONArray(owned);for(int i=0;i<ownedIds.length();i++)if(ownedIds.getInt(i)==offer.getInt("id"))duplicate=true;}catch(Exception ignored){}JSONObject receipt=new JSONObject().put("receipt",s.getString("day")+":"+rank).put("rank",rank).put("id",offer.getInt("id")).put("duplicate",duplicate);claimed.put(receipt);if(!save(s))return "{}";return receipt.toString();
 }catch(Exception e){return "{}";}}
 private void emit(String status){web.post(()->{if(!activity.isFinishing())web.evaluateJavascript("window.dispatchEvent(new CustomEvent('omni-ad-state',{detail:"+JSONObject.quote(status)+"}))",null);});}
 @JavascriptInterface public void watch(String owned){activity.runOnUiThread(()->{
  try{JSONObject s=state(owned);String audience=prefs.getString("audience","");if(busy||s.optInt("views")>=10||s.optBoolean("clockBlocked")){emit("Daily ad limit reached");return;}if(audience.isEmpty()||audience.equals("under6")){emit("Choose your age group first. Ads are available for ages 6 and above.");return;}
   int next=s.optInt("views")+1;new AlertDialog.Builder(activity).setTitle("Optional rewarded ad").setMessage("Complete one ad to add 1 view to today's reward progress ("+next+" of 10). Character rewards become available at 2, 4, 6, 8 and 10 completed ads. You can keep playing without watching. Closing before earning the reward does not add progress.").setNegativeButton("Not now",(d,w)->emit("Ad cancelled")).setPositiveButton("Watch ad",(d,w)->load(owned)).show();
  }catch(Exception e){emit("Could not prepare ad. Please try again.");}
 });}
 private void load(String owned){if(busy)return;busy=true;emit("Loading ad…");
  RequestConfiguration config=new RequestConfiguration.Builder().setTagForChildDirectedTreatment(RequestConfiguration.TAG_FOR_CHILD_DIRECTED_TREATMENT_TRUE).setTagForUnderAgeOfConsent(RequestConfiguration.TAG_FOR_UNDER_AGE_OF_CONSENT_TRUE).setMaxAdContentRating(RequestConfiguration.MAX_AD_CONTENT_RATING_G).build();MobileAds.setRequestConfiguration(config);
  if(!initialized){initialized=true;MobileAds.initialize(activity,status->activity.runOnUiThread(()->request(owned)));}else request(owned);
 }
 private void request(String owned){Bundle extras=new Bundle();extras.putString("npa","1");AdRequest request=new AdRequest.Builder().addNetworkExtrasBundle(AdMobAdapter.class,extras).build();
  RewardedAd.load(activity,BuildConfig.REWARDED_TEST_ADS?TEST_UNIT:LIVE_UNIT,request,new RewardedAdLoadCallback(){
   @Override public void onAdFailedToLoad(LoadAdError error){busy=false;emit("No ad available right now. No progress was used. Try later.");}
   @Override public void onAdLoaded(RewardedAd ad){final String castDay=day();final boolean[] earned={false};ad.setFullScreenContentCallback(new FullScreenContentCallback(){
    @Override public void onAdDismissedFullScreenContent(){busy=false;emit(earned[0]?"Ad completed. Progress saved.":"Ad closed. No reward was earned.");}
    @Override public void onAdFailedToShowFullScreenContent(AdError e){busy=false;emit("Ad could not open. No progress was used.");}
   });ad.show(activity,reward->{synchronized(RewardAds.this){if(earned[0])return;try{JSONObject s=state(owned);if(!castDay.equals(s.getString("day"))||s.optInt("views")>=10){emit("A new reward day has started. Please try again.");return;}s.put("views",s.optInt("views")+1);if(save(s)){earned[0]=true;emit("Ad completed. Progress saved.");}else emit("Could not save progress. Please contact support.");}catch(Exception e){emit("Could not save reward progress.");}}});}
  });
 }
}
