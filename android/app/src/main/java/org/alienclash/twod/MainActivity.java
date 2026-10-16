package org.alienclash.twod;
import android.app.Activity;
import android.os.Bundle;
import android.content.Intent;
import android.webkit.*;
import java.io.*;
public class MainActivity extends Activity {
 private WebView web;
 private static final String HOST="appassets.androidplatform.net";
 @Override public void onCreate(Bundle state) {
  super.onCreate(state); web=new WebView(this); setContentView(web);
  WebSettings s=web.getSettings(); s.setJavaScriptEnabled(true); s.setDomStorageEnabled(true); s.setAllowFileAccess(false); s.setAllowContentAccess(false); s.setMediaPlaybackRequiresUserGesture(true); s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
  web.setBackgroundColor(0xff0b1212); web.setWebChromeClient(new WebChromeClient());
  web.setWebViewClient(new WebViewClient(){
   @Override public WebResourceResponse shouldInterceptRequest(WebView view,WebResourceRequest request){
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
 private void immersive(){getWindow().getDecorView().setSystemUiVisibility(5894);}
 @Override public void onWindowFocusChanged(boolean focus){super.onWindowFocusChanged(focus);if(focus)immersive();}
 @Override protected void onPause(){web.evaluateJavascript("window.androidPause&&window.androidPause()",null);web.onPause();super.onPause();}
 @Override protected void onResume(){super.onResume();if(web!=null)web.onResume();}
 @Override public void onBackPressed(){web.evaluateJavascript("window.androidBack&&window.androidBack()",null);}
 @Override protected void onDestroy(){web.destroy();super.onDestroy();}
}
