package com.devil.enhancer;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.PluginMethod;

@CapacitorPlugin(name = "Enhancer")
public class EnhancerPlugin extends Plugin {

    @PluginMethod
    public void enhance(PluginCall call) {
        JSObject result = new JSObject();

        result.put("success", true);
        result.put("message", "Enhancer plugin is ready");

        call.resolve(result);
    }
}
