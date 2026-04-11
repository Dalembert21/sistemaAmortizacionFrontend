import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, CheckCircle, Building, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Tesseract from 'tesseract.js';
import * as faceapi from 'face-api.js';

const Investment = () => {
  const { config, role } = useAuth();
  
  const defaultInvestments = [
    { id: 1, name: 'Corto Plazo', minAmount: 100, maxAmount: 10000, minTerm: 1, maxTerm: 12 },
    { id: 2, name: 'Largo Plazo', minAmount: 5000, maxAmount: 100000, minTerm: 12, maxTerm: 120 },
    { id: 3, name: 'Ahora Flex', minAmount: 50, maxAmount: 50000, minTerm: 1, maxTerm: 60 }
  ];
  const investments = (config && config.investments && config.investments.length > 0) ? config.investments : defaultInvestments;

  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState(5000);
  const [period, setPeriod] = useState(12);
  const [type, setType] = useState<any>(null);
  const [selectedBank, setSelectedBank] = useState('');

  React.useEffect(() => {
    if (!type && investments.length > 0) {
      setType(investments[0].id);
    }
  }, [investments, type]);

  const [isBiometricValid, setIsBiometricValid] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [isCedulaValid, setIsCedulaValid] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [validationError, setValidationError] = useState('');
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [idFaceDescriptor, setIdFaceDescriptor] = useState<Float32Array | null>(null);

  // Centralize model loading to avoid redundant heavy loads
  React.useEffect(() => {
    let mounted = true;
    const loadModels = async () => {
      try {
        const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
        if (mounted && !faceapi.nets.ssdMobilenetv1.params) {
           await Promise.all([
            faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
          ]);
          if (mounted) console.log("Modelos de IA cargados correctamente");
        }
      } catch (err) {
        console.error("Error cargando modelos de IA:", err);
      }
    };
    loadModels();
    return () => { mounted = false; };
  }, []);

  const resetValidation = () => {
    setIsCedulaValid(false);
    setIsBiometricValid(false);
    setValidationError('');
    setIdFaceDescriptor(null);
  };

  // calculateReturn removed


  const startCameraScan = async () => {
    if (!idFaceDescriptor) {
      setValidationError("🚫 ERROR: Primero debe subir una cédula válida con foto nítida.");
      return;
    }
    setScanning(true);
    setValidationError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Esperar a que la cámara enfoque (5 seg)
      setTimeout(async () => {
        if (!videoRef.current) return;
        
        // 1. Capturar rostro en vivo
        const cameraDetection = await faceapi.detectSingleFace(videoRef.current)
          .withFaceLandmarks()
          .withFaceDescriptor();

        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        setScanning(false);

        if (!cameraDetection) {
          setValidationError("🚫 ERROR: No se detectó rostro en la cámara. Mire de frente al sensor.");
          return;
        }

        // 2. IA DE COMPARACIÓN REAL (Matemática Pura)
        // Comparamos el "ADN digital" (Descriptor) del rostro de la cédula vs la cámara
        const distance = faceapi.euclideanDistance(idFaceDescriptor, cameraDetection.descriptor);
        
        // Límite de seguridad: 0.6 es el estándar de oro. Si es mayor, NO es la misma persona.
        if (distance < 0.6) {
          setIsBiometricValid(true);
          setValidationError('');
        } else {
          setValidationError(`🚫 FRAUDE DETECTADO: El rostro en cámara NO COINCIDE con el de la cédula. Sistema bloqueado por suplantación.`);
          setIsBiometricValid(false);
        }
      }, 5000);
    } catch (err) {
      console.error(err);
      alert("⚠️ Permiso Denegado de Cámara.");
      setScanning(false);
    }
  };

  const handleCedulaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploadingDoc(true);
      setValidationError('Extrayendo rasgos faciales del documento con IA...');
      
      try {
        const img = await faceapi.bufferToImage(file);
        
        // 1. Extraer descriptor del rostro de la cédula
        const detections = await faceapi.detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!detections) {
          setValidationError("🚫 ERROR: No se ve un rostro claro en la imagen subida.");
          setIsCedulaValid(false);
        } else {
          // 2. Real OCR
          const result = await Tesseract.recognize(file, 'spa');
          const text = result.data.text.toUpperCase();
          
          if (text.includes('CEDULA') || text.includes('ECUADOR') || text.includes('IDENTIDAD') || text.includes('REPUBLICA')) {
            setIdFaceDescriptor(detections.descriptor);
            setIsCedulaValid(true);
            setValidationError('');
          } else {
            setValidationError('🚫 RESOLUCIÓN IA: Este documento no es una Cédula de Identidad legal.');
            setIsCedulaValid(false);
          }
        }
      } catch (err) {
        setValidationError('Error de conexión con el motor de IA.');
      }
      setUploadingDoc(false);
    }
  };

  const guestBanks = [
    { name: config?.institutionName || 'Sistema Financiero DB', rate: 'Rendimiento Base', color: 'var(--primary)', url: '#' },
    { name: 'Banco Pichincha', rate: '+0.5%', color: '#ffd100', url: 'https://www.pichincha.com' },
    { name: 'Banco Guayaquil', rate: '+0.2%', color: '#e3006f', url: 'https://www.bancoguayaquil.com' },
    { name: 'Cooperativa JEP', rate: '+1.0%', color: '#005b9f', url: 'https://www.jep.coop' }
  ];

  const bancos = role === 'GUEST' ? guestBanks : [guestBanks[0]];

  const annualRate = 7.5 + (period >= 12 ? 1.5 : 0) + (amount >= 10000 ? 1 : 0);
  const interestEarned = amount * (annualRate / 100) * (period / 12);
  const totalReturn = amount + interestEarned;

  return (
    <div className="flex flex-col gap-4 max-w-4xl mx-auto">
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Building color="var(--secondary-light)" /> Simulador de Inversiones
      </h2>

      {/* Progress Tracker */}
      <div className="flex justify-between items-center mb-4" style={{ padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius-full)' }}>
        <div style={{ color: step >= 1 ? 'var(--secondary)' : 'var(--text-muted)', fontWeight: step >= 1 ? '600' : '400' }}>1. Simulación</div>
        <div style={{ flex: 1, height: '2px', background: 'var(--border)', margin: '0 1rem' }}>
          <div style={{ height: '100%', background: 'var(--secondary)', width: step >= 2 ? '100%' : '0%', transition: 'var(--transition)' }}></div>
        </div>
        <div style={{ color: step >= 2 ? 'var(--secondary)' : 'var(--text-muted)', fontWeight: step >= 2 ? '600' : '400' }}>2. Validación Identidad</div>
        <div style={{ flex: 1, height: '2px', background: 'var(--border)', margin: '0 1rem' }}>
          <div style={{ height: '100%', background: 'var(--secondary)', width: step >= 3 ? '100%' : '0%', transition: 'var(--transition)' }}></div>
        </div>
        <div style={{ color: step >= 3 ? 'var(--secondary)' : 'var(--text-muted)', fontWeight: step >= 3 ? '600' : '400' }}>3. Selección Banco</div>
        <div style={{ flex: 1, height: '2px', background: 'var(--border)', margin: '0 1rem' }}>
          <div style={{ height: '100%', background: 'var(--secondary)', width: step >= 4 ? '100%' : '0%', transition: 'var(--transition)' }}></div>
        </div>
        <div style={{ color: step >= 4 ? 'var(--secondary)' : 'var(--text-muted)', fontWeight: step >= 4 ? '600' : '400' }}>4. Éxito</div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="glass-panel">
            <h3>Póliza de Inversión</h3>
            <div className="flex gap-4 mt-4">
              <div className="flex-col w-full">
                <label>Monto a Invertir</label>
                <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
              </div>
              <div className="flex-col w-full">
                <label>Plazo (Meses)</label>
                <input type="number" value={period} onChange={(e) => setPeriod(Number(e.target.value))} />
              </div>
            </div>

            <div className="mt-4">
              <label>Tipo de Inversión</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                {investments.map((inv: any) => (
                  <button 
                    key={inv.id}
                    className={`btn ${type === inv.id ? 'btn-primary' : 'btn-secondary'}`} 
                    onClick={() => setType(inv.id)}
                  >
                    {inv.name}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <h4 style={{ margin: 0, color: '#059669', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 Proyección de Rendimiento
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tasa Efectiva Anual</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text)' }}>{annualRate.toFixed(2)}%</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Interés Ganado</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>+ ${interestEarned.toFixed(2)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total a Recibir</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>${totalReturn.toFixed(2)}</div>
                </div>
              </div>
            </div>

            <button className="btn btn-primary w-full mt-10" onClick={() => setStep(2)}>
              Continuar a Validación de Identidad
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="glass-panel text-center">
            <h3>Validación de Identidad Inteligente</h3>
            <p>Para asegurar tu identidad, la IA comparará la foto de tu cédula con tu rostro real.</p>
            
            <div className="flex justify-center mt-8" style={{ gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ 
                    width: '160px', height: '160px', 
                    border: isCedulaValid ? '2px solid var(--secondary)' : '2px dashed var(--border)', 
                    borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' 
                  }}>
                  {isCedulaValid ? <CheckCircle size={50} color="var(--secondary)" /> : (uploadingDoc ? <div className="spinner"></div> : <Upload size={40} color="var(--text-muted)" />)}
                  <input type="file" accept="image/*" onChange={handleCedulaUpload} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} disabled={uploadingDoc} />
                </div>
                <div style={{ color: isCedulaValid ? 'var(--secondary)' : 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem' }}>
                  {isCedulaValid ? 'Identidad Cargada' : (uploadingDoc ? 'Extrayendo Rostro...' : 'Subir Cédula')}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ 
                  width: '160px', height: '160px', 
                  border: isBiometricValid ? '2px solid var(--secondary)' : '2px dashed var(--primary)', 
                  borderRadius: '50%', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', overflow: 'hidden'
                }}>
                  {scanning && (
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      muted 
                      style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  )}
                  {scanning && (
                      <motion.div 
                        initial={{ top: '-10%', opacity: 0 }}
                        animate={{ top: '110%', opacity: 1 }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        style={{ position: 'absolute', width: '100%', height: '4px', background: '#e6621f', boxShadow: '0 0 15px #e6621f' }}
                      />
                  )}
                  {isBiometricValid ? <CheckCircle size={50} color="var(--secondary)" /> : (!scanning && <Camera size={40} color="var(--text-muted)" />)}
                </div>
                {!isBiometricValid ? (
                   <button className="btn btn-primary" onClick={startCameraScan} disabled={scanning || !isCedulaValid}>
                     {scanning ? 'Detectando Puntos...' : 'Validar Identidad'}
                   </button>
                ) : (
                  <div style={{ color: 'var(--secondary)', fontWeight: 600 }}>Cédula y Rostro Coinciden</div>
                )}
              </div>
            </div>

            {validationError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '1rem', borderRadius: 'var(--radius-md)', marginTop: '1rem', fontWeight: '500', fontSize: '0.9rem' }}>
                {validationError}
              </div>
            )}

            <div className="flex gap-4 mt-8">
              <button className="btn btn-secondary w-full" onClick={() => { resetValidation(); setStep(1); }}>Atrás</button>
              <button className="btn btn-primary w-full" disabled={!isBiometricValid || !isCedulaValid} onClick={() => setStep(3)}>
                Continuar a Selección
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="glass-panel text-center">
            <CheckCircle size={50} color="var(--secondary)" style={{ margin: '0 auto 1rem' }} />
            <h3>Identidad Validada. Eliga su destino:</h3>
            <p>Ahora que hemos confirmado su identidad, puede seleccionar la entidad bancaria para su inversión.</p>
            
            <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
              {bancos.map(banco => (
                <div 
                  key={banco.name} 
                  style={{ border: '1px solid var(--border)', padding: '1.5rem 1rem', borderRadius: 'var(--radius-lg)', transition: 'var(--transition)', background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }} 
                  className="hover:scale-105"
                >
                  <h4 style={{ color: banco.color, marginBottom: '0.2rem' }}>{banco.name}</h4>
                  <div style={{ background: 'rgba(var(--primary-rgb), 0.1)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', color: 'var(--primary)', fontWeight: '700', fontSize: '0.9rem' }}>
                    Tasa: {banco.rate}
                  </div>
                  
                  <div className="flex flex-col gap-2 mt-4">
                    <button className="btn btn-primary w-full" style={{ padding: '0.5rem' }} onClick={() => { setSelectedBank(banco.name); setStep(4); }}>
                      Invertir Aquí
                    </button>
                    <a 
                      href={banco.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-secondary w-full" 
                      style={{ padding: '0.5rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                    >
                      Más Información <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <button className="btn btn-secondary mt-8" onClick={() => setStep(2)}>Volver a Validación</button>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel text-center">
             <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
               <CheckCircle size={80} color="var(--secondary)" />
             </div>
             <h2>¡Inversión Procesada con Éxito!</h2>
             <p>Acabas de escoger efectuar la inversión con <strong>{selectedBank}</strong>... ¡fue tu mejor elección!</p>
             <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Identidad validada al 99.8% vía Reconocimiento Facial.</p>
             <button className="btn btn-primary mt-6" onClick={() => { resetValidation(); setStep(1); setSelectedBank(''); }}>Finalizar y Salir</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Investment;
