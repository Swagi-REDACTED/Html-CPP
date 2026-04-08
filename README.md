# DynHTML Generator & C++ Engine

DynHTML is a custom ecosystem composed of a React-based web builder and a lightweight, single-header C++ rendering engine (`HtmlRenderer.hpp`). It is designed specifically to bring rich web aesthetic pipelines into native DirectX 11 / ImGui applications.

## What is this?
Instead of embedding a massive headless browser (like CEF) to render web interfaces, DynHTML allows you to author HTML and glassmorphic CSS dynamically. The Web App acts as a playground/generator to scaffold the features you need. The output is a C++17 single-header library that gives you a **FiveM DUI-like pipeline**, but entirely self-contained.

It parses and rasterizes your HTML surfaces natively on the CPU or GPU and seamlessly pumps the composite directly into an `ID3D11ShaderResourceView*`, which can be immediately used with `ImGui::Image()`.

---

## 🚀 Setup & Integration

### 1. Generating your Engine
Launch the web interface (via `npm run dev`), tweak your desired engine optimizations (like SIMD backdrop blur or ImGui Helpers), and click **Download Header** to receive your custom `HtmlRenderer.hpp`.

### 2. Basic Setup (Standalone DX11)
Include the generated header in your C++ project. Since it's a single-header library, you'll need to define the implementation in exactly ONE source file:

```cpp
#define DYNHTML_IMPLEMENTATION
#include "HtmlRenderer.hpp"
```

Once included, rendering a web-like surface to a texture is straightforward. The renderer handles the heavy lifting of layout and software-rasterizing CSS:

```cpp
#include "HtmlRenderer.hpp"

// Inside your rendering or UI setup
dynhtml::SurfaceConfig cfg;
cfg.useHardwareAcceleration = true;

dynhtml::HtmlRenderer renderer(cfg);

// Step 1: Initialize strictly with DX11 device & context for compositing
renderer.InitializeDX11(myD3D11Device, myD3D11DeviceContext);

// Set up the internal resolution of the web surface
renderer.SetViewport(800, 600, 1.0f);

// Push some raw HTML (or use a loaded string)
renderer.SetHTML(
    "<div style=\"width:100%; height:100%; backdrop-filter: blur(12px);\">"
    "  <h1 style=\"color: white;\">Natively Rendered HTML Overlay</h1>"
    "</div>"
);

// Optional: Pass the background scene buffer to allow "backdrop-filter: blur" matching
renderer.SetBackdropTexture(myVideoFrameSRV, 1920, 1080);
```

### 3. Usage with ImGui
One of the most powerful features to replicate the *FiveM DUI pipeline* is binding it directly to ImGui's drawing system. During your application's frame update, tell the renderer to composite its layout and then feed the resulting DX11 texture pointer to ImGui.

```cpp
// 1. Tick animation and evaluate CSS transitions
renderer.Tick(dt);

// 2. Rasterize the DOM CPU pass & composite DX11 GPU passes
if (renderer.Render()) {
    // 3. Draw the web surface inside an ImGui window!
    auto surfaceTexture = renderer.TextureHandle();
    if (surfaceTexture) {
        ImGui::Begin("Glassmorphism Web UI");
        // Draw the fully composited texture
        ImGui::Image(surfaceTexture, ImVec2(800.0f, 600.0f));
        ImGui::End();
    }
}
```

## 🎮 The "FiveM DUI" Simulation
The **DUI (Direct UI)** pipeline acts as a bridge where arbitrary URL payloads or static HTML can render transparently over a game frame. DynHTML replicates this by:
1. Providing `backdrop-filter` emulation natively.
2. Natively parsing advanced CSS properties. The generator natively scaffolds `Node` AST structures containing properties like `hasLinearGradient`, `gradientStart`, `gradientEnd`, and `backdropBlurRadius`. This ensures your C++ loop has immediate access natively to execute rich graphical blends, avoiding expensive UI draw calculations.
3. Yielding a bare DirectX 11 resource pointer. This circumvents slow operating-system level composition. The `TextureHandle()` output exists purely in VRAM after software uploading, allowing fast, direct blending. 
4. Interactivity via `ImGui`. Rather than routing complex raw Windows hooks, use ImGui's windowing bounds to translate Mouse X/Y coordinates into the `HtmlRenderer` event system.

## 🪄 Pipe It Up: Native Hardware Glassmorphism
To avoid destroying your game's framerate by processing a software blur on the CPU every 16ms, `HtmlRenderer.hpp` automatically includes a built-in hardware composition pipeline. 

By simply ensuring you've called:
```cpp
renderer.InitializeDX11(myD3D11Device, myD3D11DeviceContext);
renderer.SetBackdropTexture(myVideoFrameSRV, 1920, 1080);
```
During the `Render()` step, the engine will:
1. Automatically compile and cache the HLSL Blur Shader.
2. Filter the `myVideoFrameSRV` strictly within the bounds of your UI elements that use ` backdrop-filter: blur`.
3. Pre-composite the software-rendered DOM elements (like text and borders) over the blurred backings using `ID3D11BlendState`.
4. Output a single, fully-composited `TextureHandle()` ready for ImGui.

All DX11 states (Viewports, OM RenderTargets, Samplers, BlendStates, Input Layouts) are safely backed up and restored during `CompositeDX11()`, ensuring it perfectly drops into your existing render pipeline with zero side effects.

## ⚙️ Modifying Features (Web Builder)
Because `HtmlRenderer.hpp` is auto-generated, you can toggle specific C++ capabilities entirely from the React interface:

- **ImGui Helpers**: Wraps the texture fetching code specifically for `ImTextureID`.
- **Flexbox Layout**: Includes a mini yoga-like layout solver if you plan to use dynamic positioning (like `%` and `vh`) rather than static bounding rects.
- **SIMD Backdrop Blur**: Uses `_mm_loadu_si128` and AVX vector intrinsics in the C++ output to drastically speed up glassmorphic rendering on the CPU before texture upload.

Enjoy building native DX11 UIs with modern web aesthetics!
