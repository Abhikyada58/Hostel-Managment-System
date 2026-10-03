require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testSignup() {
  console.log("Testing Signup...");
  const testEmail = `test_${Date.now()}@charusat.edu.in`;
  
  const { data, error } = await supabase.auth.admin.createUser({
    email: testEmail,
    password: 'password123',
    email_confirm: true,
    user_metadata: {
      name: 'Test Debugger',
      role: 'student'
    }
  });

  if (error) {
    console.error("SIGNUP ERROR:", error);
  } else {
    console.log("SIGNUP SUCCESS:", data.user.id);
    
    // Check if profile was created
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
      
    if (profileError) {
      console.error("PROFILE ERROR:", profileError);
    } else {
      console.log("PROFILE CREATED SUCCESSFULLY:", profile);
    }
    
    // Clean up
    await supabase.auth.admin.deleteUser(data.user.id);
    console.log("Cleanup: User deleted.");
  }
}

testSignup();
