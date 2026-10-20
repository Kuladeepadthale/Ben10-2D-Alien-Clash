package org.alienclash.twod;
import android.app.Activity;
import android.os.Bundle;
import android.content.Intent;
import android.webkit.*;
import java.io.*;
import java.security.KeyStore;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.Base64;
import java.nio.charset.StandardCharsets;
public class MainActivity extends Activity {
 private WebView web;
 private static final String HOST="appassets.androidplatform.net";
 @Override public void onCreate(Bundle state) {
  super.onCreate(state); web=new WebView(this); setContentView(web);
  WebSettings s=web.getSettings(); s.setJavaScriptEnabled(true); s.setDomStorageEnabled(true); s.setAllowFileAccess(false); s.setAllowContentAccess(false); s.setMediaPlaybackRequiresUserGesture(true); s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
  web.addJavascriptInterface(new AccountVault(),"AlienAccountVault");
  web.setBackgroundColor(0xff0b1212); web.setWebChromeClient(new WebChromeClient());
  web.setWebViewClient(new WebViewClient(){
   @Override public WebResourceResponse shouldInterceptRequest(WebView view,WebResourceRequest request){
    String remote=request.getUrl().getHost();
    if("https".equals(request.getUrl().getScheme()) && ("identitytoolkit.googleapis.com".equals(remote)||"securetoken.googleapis.com".equals(remote)||"firestore.googleapis.com".equals(remote)))return null;
    String path=request.getUrl().getPath();
    if(HOST.equals(request.getUrl().getHost()) && "https".equals(request.getUrl().getScheme()) && path!=null && !path.contains("..")){
     try {String name=path.substring(1);String ext=MimeTypeMap.getFileExtensionFromUrl(name);String mime=MimeTypeMap.getSingleton().getMimeTypeFromExtension(ext);if(name.endsWith(".js"))mime="application/javascript";if(mime==null)mime="application/octet-stream";return new WebResourceResponse(mime,"UTF-8",getAssets().open(name));}catch(IOException ignored){}
    }
    return new WebResourceResponse("text/plain","UTF-8",404,"Not Found",null,new ByteArrayInputStream(new byte[0]));
   }
   @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest request){
    if(HOST.equals(request.getUrl().getHost()))return false;
    if("https".equals(request.getUrl().getScheme()))try{startActivity(new Intent(Intent.ACTION_VIEW,request.getUrl()));}catch(Exception ignored){}
    return true;
   }
  }); web.loadUrl("https://"+HOST+"/index.html"); immersive();
 }
 public final class AccountVault {
  private static final String ALIAS="alien-clash-account-v1";
  private SecretKey key() throws Exception {
   KeyStore store=KeyStore.getInstance("AndroidKeyStore");store.load(null);
   if(!store.containsAlias(ALIAS)){KeyGenerator generator=KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES,"AndroidKeyStore");generator.init(new KeyGenParameterSpec.Builder(ALIAS,KeyProperties.PURPOSE_ENCRYPT|KeyProperties.PURPOSE_DECRYPT).setBlockModes(KeyProperties.BLOCK_MODE_GCM).setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE).setRandomizedEncryptionRequired(true).build());generator.generateKey();}
   return (SecretKey)store.getKey(ALIAS,null);
  }
  @JavascriptInterface public synchronized String get(){
   try{String value=getSharedPreferences("alien_account",MODE_PRIVATE).getString("session","");if(value.isEmpty())return "";String[] parts=value.split("\\.");if(parts.length!=2)return "";Cipher cipher=Cipher.getInstance("AES/GCM/NoPadding");cipher.init(Cipher.DECRYPT_MODE,key(),new GCMParameterSpec(128,Base64.decode(parts[0],Base64.NO_WRAP)));return new String(cipher.doFinal(Base64.decode(parts[1],Base64.NO_WRAP)),StandardCharsets.UTF_8);}catch(Exception ignored){return "";}
  }
  @JavascriptInterface public synchronized boolean set(String value){
   try{if(value==null||value.length()>20000)return false;if(value.isEmpty())return getSharedPreferences("alien_account",MODE_PRIVATE).edit().remove("session").commit();Cipher cipher=Cipher.getInstance("AES/GCM/NoPadding");cipher.init(Cipher.ENCRYPT_MODE,key());String encrypted=Base64.encodeToString(cipher.getIV(),Base64.NO_WRAP)+"."+Base64.encodeToString(cipher.doFinal(value.getBytes(StandardCharsets.UTF_8)),Base64.NO_WRAP);return getSharedPreferences("alien_account",MODE_PRIVATE).edit().putString("session",encrypted).commit();}catch(Exception ignored){return false;}
  }
 }
 private void immersive(){getWindow().getDecorView().setSystemUiVisibility(5894);}
 @Override public void onWindowFocusChanged(boolean focus){super.onWindowFocusChanged(focus);if(focus)immersive();}
 @Override protected void onPause(){web.evaluateJavascript("window.androidPause&&window.androidPause()",null);web.onPause();super.onPause();}
 @Override protected void onResume(){super.onResume();if(web!=null)web.onResume();}
 @Override public void onBackPressed(){web.evaluateJavascript("window.androidBack&&window.androidBack()",null);}
 @Override protected void onDestroy(){web.destroy();super.onDestroy();}
}
