# Registration Auto-Login Testing Checklist

## Pre-Testing Setup
- [x] Server running on http://localhost:3001
- [x] Database accessible (SQLite dev.db)
- [x] Browser developer console open (F12)
- [x] Server terminal visible for logs

## Test Case 1: New Solo Provider Registration

### Steps:
1. Navigate to http://localhost:3001/registrace
2. Select "Solo dívka" account type
3. Fill in Step 1 (Základní údaje):
   - Phone: +420 XXX XXX XXX (unique)
   - Email: test@example.com (unique)
   - Password: test1234 (min 4 chars)
   - Confirm Password: test1234
4. Click "Pokračovat →"
5. Fill in Step 2 (Profil):
   - Kategorie: Select any
   - Jméno: Test Name
   - Věk: 25
   - Město: Praha
   - Adresa: Test Address
   - Select at least one service
6. Click "Dokončit registraci"

### Expected Console Logs (Browser):
```
[CLIENT] Registration successful, attempting auto-login
[CLIENT] Email: test@example.com Has password: true
[CLIENT] SignIn result: { ok: true, ... }
[CLIENT] Auto-login successful, redirecting...
```

### Expected Server Logs:
```
[REGISTER] Starting registration: { phone: '+420...', email: 'test@example.com', role: 'PROVIDER', hasProfile: true }
[REGISTER] Password hashed successfully
[REGISTER] Creating user with data: { ... }
[REGISTER] User created successfully: <user-id>
...
[AUTH] Login attempt for: test@example.com
[AUTH] User found, checking password...
[AUTH] Password valid: true
[AUTH] Login successful for: test@example.com
```

### Expected Behavior:
- [x] Registration completes without errors
- [x] User is automatically logged in
- [x] User is redirected to `/inzerent_dashboard`
- [x] Dashboard shows user profile

## Test Case 2: New Business Provider Registration

### Steps:
1. Navigate to http://localhost:3001/registrace
2. Select "Podnik" account type
3. Fill in Step 1 (same as Test Case 1 but with different email/phone)
4. Fill in Step 2:
   - Typ Podniku: Select any
   - Název podniku: Test Business
   - Město: Praha
   - Adresa: Test Address
   - Telefon: +420 XXX XXX XXX
   - Popis podniku: Test description
5. Click "Dokončit registraci"

### Expected Behavior:
- [x] Registration completes without errors
- [x] User is automatically logged in
- [x] User is redirected to `/inzerent_dashboard`
- [x] Dashboard shows business profile

## Test Case 3: Duplicate Email Registration

### Steps:
1. Try to register with an email that already exists
2. Should get error before auto-login is attempted

### Expected Behavior:
- [x] Registration fails with error: "Uživatel s tímto emailem již existuje"
- [x] No auto-login is attempted
- [x] User stays on registration page

## Test Case 4: Empty Email (Should be Prevented)

### Steps:
1. Fill in registration form but leave email empty
2. Click submit

### Expected Behavior:
- [x] Client-side validation catches empty email
- [x] Error message: "Telefonní číslo, email a heslo jsou povinné"
- [x] Form does not submit

## Test Case 5: Manual Login After Registration

### Steps:
1. Complete registration (auto-login succeeds)
2. Logout
3. Navigate to http://localhost:3001/prihlaseni
4. Login with same email and password

### Expected Behavior:
- [x] Login succeeds
- [x] User is redirected to dashboard
- [x] Session persists

## Common Issues to Check

### If Auto-Login Fails:
1. Check browser console for errors
2. Check server logs for `[AUTH]` messages
3. Verify email was saved to database:
   ```sql
   SELECT id, email, phone, role FROM User WHERE email = 'test@example.com';
   ```
4. Verify password hash exists:
   ```sql
   SELECT id, passwordHash FROM User WHERE email = 'test@example.com';
   ```

### If Redirected to /prihlaseni:
- This means auto-login failed
- Check console logs for `signInResult.error`
- Verify the user exists in database
- Try manual login to verify credentials work

### Database Queries for Debugging:
```sql
-- Check if user exists
SELECT * FROM User WHERE email = 'your-email@example.com';

-- Check if profile was created
SELECT * FROM Profile WHERE ownerId = 'user-id';

-- Check if business was created
SELECT * FROM Business WHERE ownerId = 'user-id';

-- Delete test user (cleanup)
DELETE FROM User WHERE email LIKE 'test%@example.com';
```

## Success Criteria
All test cases should pass with expected behaviors. Specifically:
1. ✅ Email is required and validated
2. ✅ User is created with email in database
3. ✅ Auto-login succeeds after registration
4. ✅ `[AUTH]` logs appear in server console
5. ✅ User is redirected to correct dashboard
6. ✅ Session persists (can access protected routes)

## Regression Testing
After confirming auto-login works, verify:
- [x] Manual login still works at /prihlaseni
- [x] Existing users can still login
- [x] Password validation works (min 4 chars)
- [x] Email validation works (valid format)
- [x] Phone number validation works
