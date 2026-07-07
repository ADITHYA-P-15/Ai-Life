/**
 * api/index.js — Vercel Serverless Function entry point.
 * 
 * Exports the Express app for Vercel's @vercel/node runtime.
 * All /api/* requests are routed here via vercel.json rewrites.
 */

import app from '../server/app.js';

export default app;
