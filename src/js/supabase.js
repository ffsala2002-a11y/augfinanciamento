
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = "https://fkykscrjucytptwfgvrd.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZreWtzY3JqdWN5dHB0d2ZndnJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5OTUxMDIsImV4cCI6MjA5MzU3MTEwMn0.YRdXcvNRGH7bWGHLKpVj2-0L1ERZMCOr7lv4CQgH1Xg";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);