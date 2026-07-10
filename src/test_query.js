const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xfujpinyabrqpldqcyfk.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmdWpwaW55YWJycXBsZHFjeWZrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTQ2NTg5MiwiZXhwIjoyMDk3MDQxODkyfQ.eqFXv20yJVR58be0eOcSE8rWwPyDP2JuPPaOA47dOGU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        user_id: 'user_3FKNwwhjZ9AxnSOW5mpgWngbku4',
        username: 'test_clerk_user',
        full_name: 'Test Clerk User'
      })
      .select();
    
    if (error) {
      console.error('Insert Error:', error);
    } else {
      console.log('Insert Success:', data);
    }
  } catch (err) {
    console.error('Error running query:', err);
  }
}

run();
