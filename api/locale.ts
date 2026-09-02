import type { Request, Response } from 'express';

export default function handler(req: Request, res: Response) {
  const raw = req.headers['x-vercel-ip-country'];
  const country = (Array.isArray(raw) ? raw[0] : raw || '').toString().trim().toUpperCase();
  res.setHeader('Cache-Control', 'private, max-age=300');
  res.status(200).json({ country: /^[A-Z]{2}$/.test(country) ? country : null });
}
