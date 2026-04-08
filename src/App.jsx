import React, { useState, useEffect } from 'react';
import { Download, Monitor, Code, Settings, Layers, Zap } from 'lucide-react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import { generateEngineHeader } from './generator';
import './index.css';

function App() {
  const [config, setConfig] = useState({
    dx11: true,
    imgui: true,
    flexbox: true,
    simd: false,
    text: 'software' // 'software' or 'directwrite'
  });

  const [generatedCode, setGeneratedCode] = useState('');
  const [htmlTemplate, setHtmlTemplate] = useState(
    '<div style="width: 100%; height: 100%; backdrop-filter: blur(12px);">\n  <h1>Hello Glassmorphism</h1>\n</div>'
  );

  useEffect(() => {
    const code = generateEngineHeader(config);
    setGeneratedCode(code);
    setTimeout(() => Prism.highlightAll(), 0);
  }, [config]);

  const handleDownload = () => {
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'HtmlRenderer.hpp';
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleConfig = (key) => {
    setConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen p-8 p-10 max-w-7xl mx-auto flex flex-col gap-8">
      <header className="flex justify-between items-center glass-panel p-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Layers className="text-blue-400" size={32} />
            DynHTML<span className="text-blue-400">.C++</span>
          </h1>
          <p className="text-slate-400 mt-2">Single-header HTML & CSS rendering engine generator for ImGui/DX11</p>
        </div>
        <button className="btn-primary" onClick={handleDownload}>
          <Download size={20} />
          Download Header
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        
        {/* Left Panel: Configuration & Editor */}
        <div className="flex flex-col gap-6">
          <div className="glass-panel p-6 flex-1">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Settings size={20} className="text-purple-400" />
              Engine Configuration
            </h2>
            
            <div className="flex flex-col gap-4">
              <label className="flex items-center justify-between p-3 rounded bg-slate-800/50 border border-slate-700 cursor-pointer hover:bg-slate-800 transition">
                <div>
                  <h3 className="font-medium text-slate-200">DX11 Integration</h3>
                  <p className="text-sm text-slate-400">Include ID3D11ShaderResourceView hooks</p>
                </div>
                <input type="checkbox" checked={config.dx11} onChange={() => toggleConfig('dx11')} className="w-5 h-5 accent-blue-500" />
              </label>

              <label className="flex items-center justify-between p-3 rounded bg-slate-800/50 border border-slate-700 cursor-pointer hover:bg-slate-800 transition">
                <div>
                  <h3 className="font-medium text-slate-200">ImGui Helpers</h3>
                  <p className="text-sm text-slate-400">Generate ImGui::Image() drawing functions</p>
                </div>
                <input type="checkbox" checked={config.imgui} onChange={() => toggleConfig('imgui')} className="w-5 h-5 accent-blue-500" />
              </label>

              <label className="flex items-center justify-between p-3 rounded bg-slate-800/50 border border-slate-700 cursor-pointer hover:bg-slate-800 transition">
                <div>
                  <h3 className="font-medium text-slate-200">SIMD Backdrop Blur</h3>
                  <p className="text-sm text-slate-400">Optimize backdrop-filter: blur with SSE2/AVX2</p>
                </div>
                <input type="checkbox" checked={config.simd} onChange={() => toggleConfig('simd')} className="w-5 h-5 accent-purple-500" />
              </label>
              
              <label className="flex items-center justify-between p-3 rounded bg-slate-800/50 border border-slate-700 cursor-pointer hover:bg-slate-800 transition">
                <div>
                  <h3 className="font-medium text-slate-200">Flexbox Layout</h3>
                  <p className="text-sm text-slate-400">Include yoga-like flexbox solver in the header</p>
                </div>
                <input type="checkbox" checked={config.flexbox} onChange={() => toggleConfig('flexbox')} className="w-5 h-5 accent-emerald-500" />
              </label>
            </div>
          </div>

          <div className="glass-panel p-6 flex-1 flex flex-col">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Monitor size={20} className="text-emerald-400" />
              Visual Tester (HTML/CSS)
            </h2>
            <div className="flex flex-col gap-4 flex-1">
              <textarea
                className="w-full h-40 bg-slate-900 border border-slate-700 rounded p-4 text-slate-300 code-font resize-none focus:outline-none focus:border-blue-500 transition"
                value={htmlTemplate}
                onChange={(e) => setHtmlTemplate(e.target.value)}
              />
              <div className="flex-1 border border-slate-700 rounded bg-slate-900 relative overflow-hidden" style={{ minHeight: '200px' }}>
                 {/* Checkerboard background for transparency preview */}
                 <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #475569 25%, transparent 25%, transparent 75%, #475569 75%, #475569), repeating-linear-gradient(45deg, #475569 25%, #0f172a 25%, #0f172a 75%, #475569 75%, #475569)', backgroundPosition: '0 0, 10px 10px', backgroundSize: '20px 20px' }}></div>
                 <div className="absolute inset-0 p-4" dangerouslySetInnerHTML={{ __html: htmlTemplate }} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Code Preview */}
        <div className="glass-panel p-6 flex flex-col h-[80vh]">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Code size={20} className="text-pink-400" />
            Generated HtmlRenderer.hpp
          </h2>
          <div className="flex-1 overflow-auto bg-slate-900/80 rounded border border-slate-800 text-sm">
            <pre className="p-4 m-0 h-full"><code className="language-cpp">{generatedCode}</code></pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
