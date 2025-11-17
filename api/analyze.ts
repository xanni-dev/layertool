import { HfInference } from '@huggingface/inference'

const hf = new HfInference(process.env.HF_TOKEN)

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const { image } = req.body
    const result = await hf.objectDetection({
      model: 'OpenSistemas/YOLOv8-crack-seg',
      inputs: image
    })

    const severity = result.length > 5 ? 'High' : result.length > 2 ? 'Medium' : 'Low'
    res.status(200).json({ detections: result, severity })
  } catch (e) {
    res.status(500).json({ error: 'AI failed' })
  }
}
