import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Video, 
  User, 
  BookOpen, 
  Activity, 
  Mic, 
  Terminal, 
  UploadCloud, 
  Cpu, 
  Zap,
  Copy,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  X,
  FlaskConical,
  Sparkles,
  ChevronRight,
  Layers,
  Globe,
  Image as ImageIcon,
  Download,
  Maximize2,
  Settings2,
  Aperture
} from 'lucide-react';

export default function RacikanAI() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingProgress, setGeneratingProgress] = useState(0); // 0 to 4
  const [generatedImages, setGeneratedImages] = useState([]);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  
  // Public Tool States
  const [cooldown, setCooldown] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const MAX_CHARS = 1000;
  
  // Form State
  const [form, setForm] = useState({
    lingkungan: 'Studio Mewah',
    rasio: '9:16 TikTok',
    lighting: 'Studio Soft Light',
    style: 'Ultra Realistic',
    angle: 'Close Up',
    instruksi: ''
  });

  // Upload State
  const [uploads, setUploads] = useState({
    fotoRef: null,
    produkRef: null
  });
  
  const [dragActive, setDragActive] = useState(null);
  const [isFocused, setIsFocused] = useState(false); 

  const options = {
    lingkungan: ['Custom (Dari Instruksi)', 'Studio Mewah', 'Cafe Aesthetic', 'Kamar Modern', 'Rooftop Malam', 'Outdoor Alam', 'Studio Konten Creator', 'Studio Affiliate Profesional', 'Taman Rumah', 'Ruangan Tamu Elegan', 'Alam Terbuka', 'Hutan'],
    rasio: ['1:1 Kotak', '4:5 Portrait', '9:16 TikTok', '16:9 YouTube', '21:9 Cinematic'],
    lighting: ['Siang Terik', 'Golden Hour', 'Warm Cozy', 'LED Biru', 'Studio Soft Light', 'Moody Dark'],
    style: ['Ultra Realistic', 'Cinematic Movie', 'Fashion Luxury', 'Commercial Ads'],
    angle: ['Close Up', 'Low Angle', 'POV Tangan', 'Tracking Shot', 'Orbit Shot', 'Full Shot', 'Wide Shot', 'Dari Atas', 'Dari Bawah', 'Dari Samping']
  };

  const getTargetDimensions = (rasio) => {
    switch (rasio) {
      case '1:1 Kotak': return { w: 1080, h: 1080, label: '1080x1080' };
      case '4:5 Portrait': return { w: 1080, h: 1350, label: '1080x1350' };
      case '9:16 TikTok': return { w: 1080, h: 1920, label: '1080x1920' };
      case '16:9 YouTube': return { w: 1920, h: 1080, label: '1920x1080' };
      case '21:9 Cinematic': return { w: 2560, h: 1080, label: '2560x1080' };
      default: return { w: 1080, h: 1080, label: '1080x1080' };
    }
  };

  const handleFileChange = (e, zoneId) => {
    const file = e.target.files?.[0];
    if (file) processFile(file, zoneId);
  };

  const handleDrop = (e, zoneId) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(null);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file, zoneId);
  };

  const processFile = (file, zoneId) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploads(prev => ({ ...prev, [zoneId]: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeUpload = (zoneId, e) => {
    e.stopPropagation();
    setUploads(prev => ({ ...prev, [zoneId]: null }));
    // Reset file input
    const input = document.getElementById(`file-${zoneId}`);
    if (input) input.value = '';
  };

  const handleDragOver = (e, zoneId) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(zoneId);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(null);
  };

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const downloadHDImage = (src, index) => {
    const dim = getTargetDimensions(form.rasio);
    const img = new Image();
    img.crossOrigin = "Anonymous";
    
    img.onload = () => {
      // Buat Canvas bayangan untuk merender ulang gambar ke dimensi sesungguhnya
      const canvas = document.createElement('canvas');
      canvas.width = dim.w;
      canvas.height = dim.h;
      const ctx = canvas.getContext('2d');

      // Aktifkan rendering kualitas tertinggi (Mencegah pixelated)
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Kalkulasi rasio potong pintar agar sesuai frame persis
      const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
      const x = (canvas.width / 2) - (img.width / 2) * scale;
      const y = (canvas.height / 2) - (img.height / 2) * scale;
      
      // Render gambar HD ke kanvas
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

      // Ekspor murni kualitas 100% tanpa kompresi file (PNG)
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      
      // Auto Download
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `RACIKAN_AI_${dim.label}_Render_${index + 1}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
    img.src = src;
  };

  const generateSingleImage = async (variationIndex, retryCount = 0) => {
    const apiKey = "";
    // Menggunakan gemini-3.1-flash-image-preview untuk mendukung input gambar referensi
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=${apiKey}`;

    const promptText = `
      ${form.instruksi ? form.instruksi + ', ' : ''}
      Lingkungan: ${form.lingkungan !== 'Custom (Dari Instruksi)' ? form.lingkungan : 'Sesuai instruksi'}, 
      Pencahayaan: ${form.lighting}, 
      Style: ${form.style}, 
      Angle Kamera: ${form.angle}. 
      8k resolution, ultra-sharp focus, highly detailed, masterpiece, commercial photography, photorealistic, raw render, no blur, sharp edges, perfect lighting.
      (Variasi Render: ${variationIndex})
    `;

    const parts = [{ text: promptText }];
    
    // Inject referensi jika ada
    if (uploads.fotoRef) {
      parts.push({ 
        inlineData: { mimeType: "image/jpeg", data: uploads.fotoRef.split(',')[1] } 
      });
    }
    if (uploads.produkRef) {
      parts.push({ 
        inlineData: { mimeType: "image/jpeg", data: uploads.produkRef.split(',')[1] } 
      });
    }

    // Mapping Aspek Rasio
    let aspectRatio = "1:1";
    if (form.rasio === '4:5 Portrait') aspectRatio = "3:4"; 
    else if (form.rasio === '9:16 TikTok') aspectRatio = "9:16";
    else if (form.rasio === '16:9 YouTube' || form.rasio === '21:9 Cinematic') aspectRatio = "16:9";

    const payload = {
      contents: [{ role: 'user', parts }],
      generationConfig: {
        responseModalities: ['IMAGE'],
        imageConfig: { aspectRatio }
      }
    };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      
      if (response.status === 429 && retryCount < 3) {
        // Exponential backoff untuk menghindari limit API
        await new Promise(r => setTimeout(r, (retryCount + 1) * 2000));
        return generateSingleImage(variationIndex, retryCount + 1);
      }

      const part = result?.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      if (part) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      } else {
        throw new Error("Format respons API tidak sesuai.");
      }
    } catch (error) {
      console.error(`Error generating image ${variationIndex}:`, error);
      throw error;
    }
  };

  const handleGenerate = async () => {
    if (cooldown > 0 || isGenerating) return;
    
    setErrorMsg('');
    setIsGenerating(true);
    setGeneratedImages([]);
    setGeneratingProgress(0);
    
    const results = [];
    
    try {
      // Generate 4 gambar secara sekuensial agar progress bar terlihat dan mencegah 429 Too Many Requests
      for (let i = 1; i <= 4; i++) {
        setGeneratingProgress(i - 0.5); // Status sedang render
        const img = await generateSingleImage(i);
        results.push(img);
        setGeneratedImages([...results]); // Update UI seketika
        setGeneratingProgress(i); // Status render selesai
      }
    } catch (error) {
      setErrorMsg("Gagal meracik visual. Server AI Quantum mungkin sibuk, silakan coba lagi.");
    } finally {
      setIsGenerating(false);
      setGeneratingProgress(0);
      setCooldown(15); 
    }
  };

  const handleReset = () => {
    setForm({
      lingkungan: 'Studio Mewah',
      rasio: '9:16 TikTok',
      lighting: 'Studio Soft Light',
      style: 'Ultra Realistic',
      angle: 'Close Up',
      instruksi: ''
    });
    setUploads({ fotoRef: null, produkRef: null });
    setGeneratedImages([]);
    setErrorMsg('');
  };

  const particles = Array.from({ length: 25 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 5}s`,
    animationDuration: `${15 + Math.random() * 15}s`,
    size: `${2 + Math.random() * 5}px`,
  }));

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans overflow-hidden flex flex-col selection:bg-orange-500/30 selection:text-white relative">
      {/* GLOBAL CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        
        @keyframes float-particle {
          0%, 100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.1; }
          50% { transform: translateY(-40px) translateX(20px) scale(1.5); opacity: 0.5; }
        }
        @keyframes scan-sweep {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(500%); opacity: 0; }
        }
        @keyframes scan-horizontal {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .ambient-mesh {
          background: 
            radial-gradient(circle at 10% 40%, rgba(249, 115, 22, 0.05), transparent 45%),
            radial-gradient(circle at 90% 60%, rgba(14, 165, 233, 0.05), transparent 45%);
        }
        .premium-glow-border { position: relative; }
        .premium-glow-border::before {
          content: "";
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(to right, rgba(249, 115, 22, 0.5), rgba(14, 165, 233, 0.5));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.5s ease;
        }
        .premium-glow-border:hover::before, .premium-glow-border.active::before { opacity: 1; }
        
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(51, 65, 85, 0.5); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(249, 115, 22, 0.5); }
        
        /* Animasi Keren AI Text */
        .typing-pulse::after {
          content: '▋';
          display: inline-block;
          animation: blink 1s step-end infinite;
          color: #f97316;
          margin-left: 4px;
        }
        @keyframes blink { 50% { opacity: 0; } }
      `}} />

      {/* BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 pointer-events-none z-0 ambient-mesh"></div>
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-orange-400 blur-[1.5px]"
            style={{
              left: p.left, top: p.top, width: p.size, height: p.size,
              animation: `float-particle ${p.animationDuration} infinite ease-in-out`,
              animationDelay: p.animationDelay,
            }}
          />
        ))}
      </div>

      {/* HEADER TACTICAL HUD */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-3xl flex items-center justify-between px-4 md:px-8 relative z-40">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-8 h-8 bg-gradient-to-br from-orange-500/20 to-transparent border border-orange-500/40 rounded-lg overflow-hidden group">
            <div className="absolute inset-0 bg-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Aperture className="text-orange-500 w-4 h-4 relative z-10 animate-[spin_10s_linear_infinite]" />
          </div>
          <div className="flex items-baseline gap-2">
            <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 font-bold text-base md:text-lg tracking-widest uppercase">
              RACIKAN AI
            </h1>
            <span className="text-sky-500/80 font-mono text-[10px] md:text-xs hidden sm:inline-block border border-sky-500/30 px-2 py-0.5 rounded backdrop-blur-sm">PRO_ENGINE</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] sm:text-xs font-medium text-slate-400">
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sesi Publik</span>
          </div>
          <div className="hidden md:flex items-center gap-4 px-4 py-1.5 rounded-full border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl shadow-[inset_0_1px_4px_rgba(0,0,0,0.5)] text-xs font-mono">
            <div className="flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-400">Mesin: <span className="text-orange-400 font-semibold">Quantum-V3</span></span>
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-700"></div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-300">Sistem Aktif</span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN WORKSPACE GRID */}
      <main className="flex-1 flex overflow-hidden relative z-10 p-2 sm:p-4 lg:p-6">
        <div className="max-w-[1400px] w-full mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6">
          
          {/* KOLOM KIRI: KONTROL & PARAMETER */}
          <div className="w-full lg:w-[45%] xl:w-[40%] flex flex-col gap-4 overflow-y-auto pr-1 pb-20 lg:pb-0">
            
            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl group-hover:bg-orange-500/10 transition-colors"></div>
              
              <div className="flex items-center gap-2 mb-4">
                <Settings2 className="w-4 h-4 text-orange-400" />
                <h2 className="text-sm font-semibold text-slate-200 tracking-wide uppercase">AI Photo Production Engine</h2>
              </div>

              {/* UPLOAD REFERENSI (2 Kotak Besar) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                {[
                  { id: 'fotoRef', label: 'Upload Foto Referensi', desc: 'Gambar Dasar / Pose' },
                  { id: 'produkRef', label: 'Upload Produk Referensi', desc: 'Detail Item / Karakter' }
                ].map((zone) => (
                  <div 
                    key={zone.id}
                    onDragOver={(e) => handleDragOver(e, zone.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, zone.id)}
                    onClick={() => document.getElementById(`file-${zone.id}`).click()}
                    className={`premium-glow-border relative h-32 bg-slate-950/50 backdrop-blur-md border rounded-xl flex flex-col items-center justify-center transition-all duration-300 cursor-pointer overflow-hidden group
                      ${dragActive === zone.id ? 'border-orange-500/60 bg-orange-500/10 active' : 'border-slate-800/80 hover:bg-slate-900'}`}
                  >
                    <input type="file" id={`file-${zone.id}`} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, zone.id)} />

                    {uploads[zone.id] ? (
                      <>
                        <img src={uploads[zone.id]} alt={zone.label} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-slate-950/40 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button 
                            onClick={(e) => removeUpload(zone.id, e)}
                            className="bg-red-500/80 text-white border border-red-500 p-2 rounded-full hover:bg-red-500 transition-all shadow-lg backdrop-blur-md"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="absolute bottom-2 bg-slate-950/80 px-2 py-0.5 rounded text-[10px] text-orange-400 border border-orange-500/30 font-mono">
                          Diunggah
                        </div>
                      </>
                    ) : (
                      <>
                        <div className={`p-2.5 rounded-xl mb-2 transition-colors duration-300 border border-transparent
                          ${dragActive === zone.id ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-slate-900 text-slate-500 group-hover:text-orange-400 group-hover:bg-orange-500/10 group-hover:border-orange-500/30 shadow-inner'}`}>
                          <UploadCloud className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold text-slate-300 text-center">{zone.label}</span>
                        <span className="text-[9px] text-slate-500 mt-0.5">{zone.desc}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* DROPDOWNS PARAMETER GRID */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { id: 'lingkungan', label: 'Lingkungan', icon: <Layers className="w-3.5 h-3.5" /> },
                  { id: 'rasio', label: 'Rasio', icon: <ImageIcon className="w-3.5 h-3.5" /> },
                  { id: 'lighting', label: 'Lighting', icon: <Zap className="w-3.5 h-3.5" /> },
                  { id: 'style', label: 'Style Visual', icon: <Sparkles className="w-3.5 h-3.5" /> },
                  { id: 'angle', label: 'Angle Kamera', icon: <Camera className="w-3.5 h-3.5" />, colSpan: 2 }
                ].map((field) => (
                  <div key={field.id} className={`flex flex-col gap-1.5 ${field.colSpan === 2 ? 'col-span-2' : 'col-span-1'}`}>
                    <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5 ml-1">
                      {field.icon} {field.label}
                    </label>
                    <div className="relative">
                      <select 
                        name={field.id}
                        value={form[field.id]}
                        onChange={handleChange}
                        className="w-full appearance-none bg-slate-950/60 border border-slate-800 text-slate-300 text-xs px-3 py-2.5 rounded-lg outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 hover:border-slate-700 transition-colors shadow-inner"
                      >
                        {options[field.id].map(opt => <option key={opt} value={opt} className="bg-slate-900">{opt}</option>)}
                      </select>
                      <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 rotate-90 pointer-events-none" />
                    </div>
                  </div>
                ))}
              </div>

              {/* TEXTAREA INSTRUKSI */}
              <div className="flex flex-col gap-1.5 mb-6 group/textarea relative">
                <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5 ml-1">
                  <Terminal className="w-3.5 h-3.5" /> Instruksi Tambahan
                </label>
                <div className={`absolute -inset-0.5 bg-gradient-to-r from-orange-500/20 to-sky-500/10 rounded-xl blur opacity-0 transition-opacity duration-300 pointer-events-none ${isFocused ? 'opacity-100' : 'group-hover/textarea:opacity-50'}`}></div>
                <textarea 
                  name="instruksi"
                  className={`relative w-full h-24 bg-slate-950/80 text-slate-200 p-3 text-xs outline-none resize-none placeholder-slate-600 font-mono leading-relaxed rounded-xl border transition-colors shadow-inner
                    ${isFocused ? 'border-orange-500/50' : 'border-slate-800 hover:border-slate-700'}`}
                  placeholder="Contoh: Tambahkan efek asap tipis, warna dominan cyan, ekspresi model tajam melihat ke arah kamera..."
                  value={form.instruksi}
                  onChange={handleChange}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                ></textarea>
              </div>

              {/* ERROR ALERT */}
              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2 rounded-lg flex items-center gap-2 text-xs mb-4 animate-[pulse_2s_ease-in-out_infinite]">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" /> <p>{errorMsg}</p>
                </div>
              )}

              {/* ACTION BUTTONS */}
              <div className="flex gap-3">
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating || cooldown > 0}
                  className="flex-1 relative overflow-hidden group bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl py-3.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] shadow-lg"
                >
                  {!isGenerating && cooldown === 0 && (
                    <div className="absolute inset-0 -translate-x-full group-hover:animate-[scan-horizontal_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0"></div>
                  )}
                  <div className="relative z-10 flex items-center justify-center gap-2 font-bold text-sm tracking-wide">
                    {isGenerating ? (
                      <><Cpu className="w-4 h-4 animate-spin" /> MENGANALISA...</>
                    ) : cooldown > 0 ? (
                      <><AlertTriangle className="w-4 h-4" /> COOLDOWN ({cooldown}s)</>
                    ) : (
                      <><FlaskConical className="w-4 h-4" /> GENERATE 4X</>
                    )}
                  </div>
                </button>
                
                <button 
                  onClick={handleReset}
                  disabled={isGenerating}
                  className="px-4 border border-slate-700 bg-slate-800/40 rounded-xl text-slate-400 hover:text-white hover:border-slate-500 hover:bg-slate-700 transition-all flex items-center justify-center group disabled:opacity-50"
                  title="Reset Semua Parameter"
                >
                  <RotateCcw className="w-4 h-4 group-hover:-rotate-180 transition-transform duration-500" />
                </button>
              </div>

            </div>
          </div>

          {/* KOLOM KANAN: OUTPUT 2X2 GRID */}
          <div className="w-full lg:w-[55%] xl:w-[60%] flex flex-col h-[500px] lg:h-auto border border-slate-800/80 rounded-2xl bg-slate-900/30 backdrop-blur-md overflow-hidden relative shadow-2xl">
            
            {/* Header Output */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950/80 border-b border-slate-800/80 z-20">
              <span className="text-xs text-orange-400 font-bold uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Monitor Render
              </span>
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                <div className="w-2 h-2 rounded-full bg-slate-700"></div>
              </div>
            </div>

            {/* Area Grid Render */}
            <div className="relative flex-1 p-4 overflow-y-auto bg-[#020617]/60">
              
              {/* Animasi Loading Overlay (Muncul saat generate) */}
              {isGenerating && (
                <div className="absolute inset-0 z-30 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center transition-all duration-500">
                  <div className="relative w-full h-full max-w-lg max-h-96 border border-orange-500/20 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(249,115,22,0.1)]">
                    
                    {/* Scanner Line */}
                    <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent via-orange-500/10 to-orange-500/30 border-b border-orange-500/80 shadow-[0_4px_30px_rgba(249,115,22,0.3)] animate-[scan-sweep_2s_ease-in-out_infinite]"></div>
                    
                    {/* Progress Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-slate-900/50">
                      <div className="w-16 h-16 border-2 border-slate-800 border-t-orange-500 rounded-full animate-spin mb-6 shadow-[0_0_15px_rgba(249,115,22,0.5)]"></div>
                      <h3 className="text-orange-400 font-mono text-sm tracking-widest uppercase mb-2 typing-pulse">
                        AI Sedang Membuat Visual Cinematic
                      </h3>
                      
                      <div className="flex flex-col gap-1.5 w-64 mt-4 font-mono text-[10px] text-slate-400 text-left">
                         <div className="flex justify-between"><span className={generatingProgress >= 0.5 ? 'text-sky-400' : ''}>[1] Render Engine...</span><span>{generatingProgress >= 1 ? 'OK' : '...'}</span></div>
                         <div className="flex justify-between"><span className={generatingProgress >= 1.5 ? 'text-sky-400' : ''}>[2] Komposisi Cahaya...</span><span>{generatingProgress >= 2 ? 'OK' : '...'}</span></div>
                         <div className="flex justify-between"><span className={generatingProgress >= 2.5 ? 'text-sky-400' : ''}>[3] Detail Tekstur...</span><span>{generatingProgress >= 3 ? 'OK' : '...'}</span></div>
                         <div className="flex justify-between"><span className={generatingProgress >= 3.5 ? 'text-orange-400' : ''}>[4] Finalisasi Master...</span><span>{generatingProgress >= 4 ? 'OK' : '...'}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Grid 2x2 Layout */}
              {generatedImages.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full relative z-10">
                  {/* Tampilkan Placeholder untuk slot yang belum selesai dirender */}
                  {[0, 1, 2, 3].map((idx) => (
                    <div key={idx} className="relative aspect-[3/4] sm:aspect-square md:aspect-[4/5] bg-slate-900/50 border border-slate-800/80 rounded-xl overflow-hidden group">
                      
                      {generatedImages[idx] ? (
                        <>
                          <img src={generatedImages[idx]} alt={`Render ${idx+1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                          
                          {/* Hover Overlay Actions */}
                          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                            <button 
                              onClick={() => setFullscreenImage(generatedImages[idx])}
                              className="p-3 bg-slate-800/80 hover:bg-orange-500/20 text-slate-200 hover:text-orange-400 border border-slate-600 hover:border-orange-500/50 rounded-full transition-all shadow-lg backdrop-blur-md"
                              title="Preview Fullscreen"
                            >
                              <Maximize2 className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => downloadHDImage(generatedImages[idx], idx)}
                              className="p-3 bg-orange-600/90 hover:bg-orange-500 text-white border border-orange-400 rounded-full transition-all shadow-[0_0_15px_rgba(249,115,22,0.5)] backdrop-blur-md"
                              title={`Download Resolusi Penuh (${getTargetDimensions(form.rasio).label})`}
                            >
                              <Download className="w-5 h-5" />
                            </button>
                          </div>
                          
                          {/* Label Resolution Kiri Atas */}
                          <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded text-[9px] text-sky-400 border border-sky-500/30 font-mono tracking-wider">
                            {getTargetDimensions(form.rasio).label} HD
                          </div>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                           <ImageIcon className="w-8 h-8 text-slate-800/50" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                // State Kosong (Idle)
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 opacity-60">
                  <div className="w-24 h-24 mb-4 border border-dashed border-slate-700 rounded-2xl flex items-center justify-center bg-slate-900/30">
                    <ImageIcon className="w-8 h-8 text-slate-600" />
                  </div>
                  <p className="text-xs font-mono tracking-widest uppercase">Ruang Render Siap</p>
                  <p className="text-[10px] mt-1 text-slate-600">Menunggu parameter instruksi...</p>
                </div>
              )}

            </div>
          </div>

        </div>
      </main>

      {fullscreenImage && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-10 cursor-zoom-out opacity-100 transition-opacity"
          onClick={() => setFullscreenImage(null)}
        >
          <button className="absolute top-6 right-6 p-2 bg-slate-800/50 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-500/50 rounded-full transition-all">
             <X className="w-6 h-6" />
          </button>
          <img 
            src={fullscreenImage} 
            alt="Fullscreen Render" 
            className="max-w-full max-h-full object-contain rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-slate-800"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}

    </div>
  );
}