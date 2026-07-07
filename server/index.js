/**
 * index.js — Local Express entry point for LVL_UP Life Dashboard.
 */

import 'dotenv/config';
import { createApp } from './app.js';

const app = createApp();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 LVL_UP Server running on http://localhost:${PORT}`);
  console.log(`📡 API base: http://localhost:${PORT}/api`);
  console.log(`🔒 Auth: http://localhost:${PORT}/api/auth/register | /login\n`);
});
