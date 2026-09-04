import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, '..');
const app = express();
app.use(express.json({ limit: '25mb' }));

const ATHANLAB_BASE = 'https://api.athanlab.com/api/v1';
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

function requireKey(name) {
  const key = process.env[name];
  if (!key) throw new Error(`${name} is not configured. Put it in .env and restart the server.`);
  return key;
}

app.get('/api/health', (req,res)=>res.json({ok:true, athanlab:!!process.env.ATHANLAB_API_KEY, gemini:!!process.env.GEMINI_API_KEY}));

app.post('/api/gemini/generate', async (req,res)=>{
  try {
    const key = requireKey('GEMINI_API_KEY');
    const { model, payload } = req.body || {};
    if (!model || !payload) return res.status(400).json({error:'model and payload are required'});
    const r = await fetch(`${GEMINI_BASE}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`,{
      method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)
    });
    const text = await r.text();
    res.status(r.status).type('application/json').send(text);
  } catch(e){ res.status(500).json({error:e.message}); }
});

app.get('/api/athanlab/voices', async (req,res)=>{
  try {
    const key = requireKey('ATHANLAB_API_KEY');
    const r = await fetch(`${ATHANLAB_BASE}/voices`,{headers:{'X-API-Key':key}});
    const text = await r.text();
    res.status(r.status).type('application/json').send(text);
  } catch(e){ res.status(500).json({error:e.message}); }
});

app.post('/api/athanlab/generate', async (req,res)=>{
  try {
    const key = requireKey('ATHANLAB_API_KEY');
    const {text, voice_id, pace='normal'} = req.body || {};
    if (!text?.trim()) return res.status(400).json({error:'text is required'});
    if (!voice_id) return res.status(400).json({error:'voice_id is required'});
    if (text.length > 5000) return res.status(400).json({error:'AthanLab allows up to 5,000 characters per request'});
    const r = await fetch(`${ATHANLAB_BASE}/generate`,{
      method:'POST', headers:{'X-API-Key':key,'Content-Type':'application/json'},
      body:JSON.stringify({text,voice_id,pace})
    });
    const textBody = await r.text();
    res.status(r.status).type('application/json').send(textBody);
  } catch(e){ res.status(500).json({error:e.message}); }
});


// --- VOXCPM2 VOICE CLONE API ---

app.get('/api/voxcpm/voices', (req, res) => {
  res.json({
    voices: [
      {
        id: 'voxcpm2-default',
        name: 'My Voice Clone',
        source: 'VoxCPM2'
      }
    ]
  });
});

app.post('/api/voxcpm/generate', async (req, res) => {
  try {
    const baseUrl = process.env.VOXCPM2_API_URL;

    if (!baseUrl) {
      return res.status(500).json({
        error: 'VOXCPM2_API_URL is not configured'
      });
    }

    const {
      text,
      language = 'my',
      reference_audio_base64,
      prompt_text,
      prompt_audio_base64,
      inference_timesteps = 10
    } = req.body || {};

    if (!text || !text.trim()) {
      return res.status(400).json({
        error: 'text is required'
      });
    }

    const payload = {
      text: text.trim(),
      language,
      response_format: 'base64',
      inference_timesteps
    };

    if (reference_audio_base64) {
      payload.reference_audio_base64 = reference_audio_base64;
    }

    if (prompt_text) {
      payload.prompt_text = prompt_text;
    }

    if (prompt_audio_base64) {
      payload.prompt_audio_base64 = prompt_audio_base64;
    }

    const response = await fetch(`${baseUrl}/v1/speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.detail || data.error || `VoxCPM2 API Error ${response.status}`
      });
    }

    return res.status(200).json({
      audio: data.audio_base64,
      sample_rate: data.sample_rate || 48000
    });

  } catch (error) {
    console.error('VoxCPM2 Proxy Error:', error);

    return res.status(500).json({
      error: error.message || 'VoxCPM2 generation failed'
    });
  }
});

const dist = path.join(root,'dist');
app.use(express.static(dist));
app.use((req,res)=>res.sendFile(path.join(dist,'index.html')));

const port = process.env.PORT || 8787;
app.listen(port,()=>console.log(`Pwa Gyi AI Studio server running on http://localhost:${port}`));
